import React from "react";

interface SettingsPageProps {
  themeColor: string;
  onThemeColorChange: (color: string) => void;
  onResetTheme: () => void;
  email?: string;
}

export function SettingsPage({
  themeColor,
  onThemeColorChange,
  onResetTheme,
  email,
}: SettingsPageProps) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>
          Personalize the app with your preferred theme color.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeaderColumn}>
          <h2 style={styles.cardTitle}>Account</h2>
          <p style={styles.cardDescription}>
            Your signed-in email address.
          </p>
        </div>
        <div style={styles.emailRow}>
          <span style={styles.emailValue}>{email || "Not available"}</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Theme Color</h2>
            <p style={styles.cardDescription}>
              Choose a primary accent color for the interface.
            </p>
          </div>
          <span
            style={{
              ...styles.colorSwatch,
              backgroundColor: themeColor,
            }}
          />
        </div>

        <div style={styles.pickerRow}>
          <input
            type="color"
            value={themeColor}
            onChange={(e) => onThemeColorChange(e.target.value)}
            style={styles.colorPicker}
            aria-label="Theme color picker"
          />
          <input
            type="text"
            value={themeColor.toUpperCase()}
            onChange={(e) => onThemeColorChange(e.target.value)}
            style={styles.colorInput}
            aria-label="Theme color value"
          />
        </div>

        <div style={styles.preview}>
          <span style={styles.previewLabel}>Preview</span>
          <div style={styles.previewBar}>
            <div style={styles.previewPill} />
            <div style={styles.previewPillSecondary} />
            <div style={styles.previewPillMuted} />
          </div>
        </div>

        <button style={styles.resetButton} onClick={onResetTheme}>
          Reset to Default
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  header: {
    marginBottom: "4px",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "22px",
    fontWeight: "600",
    color: "var(--text-strong)",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "var(--muted)",
  },
  card: {
    backgroundColor: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    padding: "20px",
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  cardHeaderColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--text-strong)",
  },
  cardDescription: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "var(--muted)",
  },
  colorSwatch: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
  },
  pickerRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  colorPicker: {
    width: "56px",
    height: "48px",
    borderRadius: "12px",
    border: "1px solid var(--border-strong)",
    padding: "6px",
    backgroundColor: "var(--surface-muted)",
    cursor: "pointer",
  },
  colorInput: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid var(--border-strong)",
    backgroundColor: "var(--surface-muted)",
    fontSize: "14px",
    outline: "none",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  preview: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  previewLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  previewBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  previewPill: {
    height: "10px",
    flex: 1,
    borderRadius: "999px",
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
  },
  previewPillSecondary: {
    height: "10px",
    flex: 1,
    borderRadius: "999px",
    backgroundColor: "var(--primary-soft)",
    border: "1px solid var(--border)",
  },
  previewPillMuted: {
    height: "10px",
    flex: 1,
    borderRadius: "999px",
    backgroundColor: "var(--surface-muted)",
    border: "1px solid var(--border)",
  },
  resetButton: {
    marginTop: "4px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid var(--border-strong)",
    backgroundColor: "transparent",
    color: "var(--muted)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  emailRow: {
    backgroundColor: "var(--surface-muted)",
    borderRadius: "12px",
    border: "1px solid var(--border-strong)",
    padding: "12px 14px",
  },
  emailValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-strong)",
    wordBreak: "break-word",
  },
};
