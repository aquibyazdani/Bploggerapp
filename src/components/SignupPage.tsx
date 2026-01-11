import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Activity, Eye, EyeOff } from "lucide-react";

export const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Activity size={32} style={styles.icon} />
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join BP Tracker to track your health</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="Enter your full name"
              required
            />
          </div>

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
                placeholder="Create a password"
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{" "}
            <button
              onClick={() => (window.location.hash = "#login")}
              style={styles.linkButton}
            >
              Log in
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
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--muted)",
  },
  input: {
    padding: "12px 40px 12px 16px",
    border: "1px solid var(--border-strong)",
    borderRadius: "12px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    backgroundColor: "var(--surface-muted)",
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
    color: "var(--muted)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
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
