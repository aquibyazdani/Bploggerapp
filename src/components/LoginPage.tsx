import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

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
          <div style={styles.brandRow}>
            <img src="/logo.png" alt="BP Tracker" style={styles.logo} />
            <p style={styles.appName}>BP Tracker</p>
          </div>
          <h1 style={styles.title}>Track Your BP</h1>
          <p style={styles.subtitle}>
            Log your blood pressure, spot trends, and keep a private history you
            can export anytime.
          </p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🩺</span>
              Share reports with your doctor
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📈</span>
              Spot spikes with weekly trends
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📝</span>
              Track notes, posture, and pulse
            </div>
          </div>
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
            {loading ? "Redirecting..." : "Sign in"}
          </button>
          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
            onClick={() =>
              login({
                authorizationParams: { screen_hint: "signup" },
              })
            }
          >
            Create account
          </button>
        </div>

        <div style={styles.footer}>
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
          <p style={styles.madeInText}>🇮🇳 Crafted in India with care.</p>
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
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "10px",
  },
  appName: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--primary)",
  },
  logo: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
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
  featureList: {
    marginTop: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    textAlign: "left",
    backgroundColor: "#f7f9ff",
    borderRadius: "12px",
    padding: "12px 16px",
    border: "1px solid rgba(91, 108, 244, 0.15)",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "var(--text-strong)",
    fontWeight: "500",
  },
  featureIcon: {
    width: "20px",
    height: "20px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef1ff",
    borderRadius: "8px",
    fontSize: "12px",
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
  secondaryButton: {
    background: "transparent",
    color: "var(--primary)",
    border: "1px solid var(--border-strong)",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
  },
  brandingText: {
    margin: "8px 0 0 0",
    fontSize: "13px",
    color: "var(--muted)",
    fontWeight: "600",
  },
  brandingLink: {
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: "500",
  },
  madeInText: {
    margin: "10px 0 0 0",
    fontSize: "12px",
    color: "var(--muted)",
    fontWeight: "500",
  },
};
