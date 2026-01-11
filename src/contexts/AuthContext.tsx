import React, { createContext, useContext, useEffect, useState } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !auth0User) {
      setUser(null);
      return;
    }

    const auth0UserId =
      auth0User.sub || (auth0User as { user_id?: string }).user_id || "";

    setUser({
      id: auth0UserId,
      name:
        auth0User.name ||
        auth0User.nickname ||
        auth0User.email ||
        "User",
      email: auth0User.email || "",
    });
  }, [auth0User, isAuthenticated]);

  useEffect(() => {
    let active = true;

    const loadToken = async () => {
      if (!isAuthenticated) {
        setToken(null);
        return;
      }

      try {
        const accessToken = await getAccessTokenSilently();
        if (active) {
          setToken(accessToken);
        }
      } catch (error) {
        console.error("Failed to load Auth0 access token", error);
        if (active) {
          setToken(null);
        }
      }
    };

    loadToken();

    return () => {
      active = false;
    };
  }, [getAccessTokenSilently, isAuthenticated]);

  const login = async () => {
    await loginWithRedirect();
  };

  const register = async () => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const value = {
    user,
    token,
    login,
    register,
    logout: handleLogout,
    loading: isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!domain || !clientId) {
    return (
      <div style={{ padding: "24px", fontFamily: "var(--font-body)" }}>
        Missing Auth0 configuration. Check `.env` for
        `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`.
      </div>
    );
  }

  const authorizationParams: {
    redirect_uri: string;
    audience?: string;
    scope?: string;
  } = {
    redirect_uri: window.location.origin,
    scope: "openid profile email",
  };

  if (audience) {
    authorizationParams.audience = audience;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authorizationParams}
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </Auth0Provider>
  );
};
