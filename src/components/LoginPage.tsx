import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Activity, Eye, EyeOff } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
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
          <p style={styles.subtitle}>Sign in to your BP Logger account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

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
      "linear-gradient(180deg, #C7D2FE 0%, #DDD6FE 50%, #E9D5FF 100%)",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 10px 40px rgba(107, 124, 245, 0.15)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  icon: {
    color: "#6B7CF5",
    marginBottom: "16px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#0a0a0a",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#737373",
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
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "12px 16px",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  passwordContainer: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#6B7280",
    cursor: "pointer",
  },
  button: {
    background: "linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)",
    color: "#ffffff",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
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
    color: "#6B7280",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#6B7CF5",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
  brandingText: {
    margin: "8px 0 0 0",
    fontSize: "12px",
    color: "#9CA3AF",
  },
  brandingLink: {
    color: "#6B7CF5",
    textDecoration: "none",
    fontWeight: "500",
  },
};
