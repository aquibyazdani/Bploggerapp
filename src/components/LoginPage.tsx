import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Activity } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Activity size={32} style={styles.icon} />
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>
            Log in to securely access your blood pressure records.
          </p>
        </div>

        <div style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <button
            type="button"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? "Redirecting..." : "Continue with Auth0"}
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <button
              onClick={() => (window.location.hash = "#signup")}
              style={styles.linkButton}
            >
              Sign up
            </button>
          </p>
          <p style={styles.brandingText}>
            Created by{" "}
            <a
              href="https://aquibyazdani.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.brandingLink}
            >
              Aquib Yazdani
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(120% 120% at 50% -10%, #e6ebff 0%, #f6f7fb 60%, #ffffff 100%)",
    padding: "20px",
  },
  card: {
    backgroundColor: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    padding: "32px",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  icon: {
    color: "var(--primary)",
    marginBottom: "16px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--text-strong)",
    fontFamily: "var(--font-display)",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "var(--muted)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  error: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
  button: {
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
    color: "#ffffff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 10px 24px rgba(91, 108, 244, 0.25)",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
  },
  footerText: {
    margin: 0,
    fontSize: "14px",
    color: "var(--muted)",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "var(--primary)",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
  brandingText: {
    margin: "8px 0 0 0",
    fontSize: "12px",
    color: "var(--muted)",
  },
  brandingLink: {
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: "500",
  },
};
