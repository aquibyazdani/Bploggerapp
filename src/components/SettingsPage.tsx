import React, { useMemo, useState } from "react";

interface SettingsPageProps {
  themeColor: string;
  onThemeColorChange: (color: string) => void;
  onResetTheme: () => void;
  email?: string;
  reminderTimes: string[];
  apiBaseUrl: string;
  token: string | null;
}

export function SettingsPage({
  themeColor,
  onThemeColorChange,
  onResetTheme,
  email,
  reminderTimes,
  apiBaseUrl,
  token,
}: SettingsPageProps) {
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    return localStorage.getItem("remindersEnabled") === "true";
  });
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [status, setStatus] = useState<"idle" | "working">("idle");
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState<
    "enable" | "disable" | null
  >(null);

  const formattedTimes = useMemo(() => {
    const toDisplay = (time: string) => {
      const [hourStr, minuteStr] = time.split(":");
      const hour = Number(hourStr);
      const minute = Number(minuteStr);
      if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
      const isPm = hour >= 12;
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour}:${minuteStr} ${isPm ? "PM" : "AM"}`;
    };

    return reminderTimes.map(toDisplay);
  }, [reminderTimes]);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnableReminders = async () => {
    if (!token) {
      setError("Please log in to enable reminders.");
      return;
    }

    const publicKey = import.meta.env
      .VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!publicKey) {
      setError("Missing VAPID public key configuration.");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setError("Service workers are not supported in this browser.");
      return;
    }

    setError("");
    setStatus("working");

    const permissionResult = await Notification.requestPermission();
    setPermission(permissionResult);
    if (permissionResult !== "granted") {
      setStatus("idle");
      setError("Notification permission was not granted.");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const response = await fetch(`${apiBaseUrl}/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error("Unable to save notification settings.");
      }

      localStorage.setItem("remindersEnabled", "true");
      setRemindersEnabled(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to enable reminders."
      );
    } finally {
      setStatus("idle");
    }
  };

  const handleDisableReminders = async () => {
    setError("");
    setStatus("working");

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch(`${apiBaseUrl}/notifications/unsubscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      localStorage.setItem("remindersEnabled", "false");
      setRemindersEnabled(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to disable reminders."
      );
    } finally {
      setStatus("idle");
    }
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "enable") {
      setConfirmAction(null);
      await handleEnableReminders();
      return;
    }
    if (confirmAction === "disable") {
      setConfirmAction(null);
      await handleDisableReminders();
    }
  };
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>
          Manage your account, theme, and reminder preferences.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeaderColumn}>
          <h2 style={styles.cardTitle}>Account</h2>
          <p style={styles.cardDescription}>Your signed-in email address.</p>
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

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Reminders</h2>
            <p style={styles.cardDescription}>
              Get push notifications at scheduled times (IST).
            </p>
          </div>
          <span style={styles.statusPill}>
            {remindersEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div style={styles.reminderTimes}>
          {formattedTimes.length > 0 ? (
            formattedTimes.map((time) => (
              <span key={time} style={styles.timeChip}>
                {time}
              </span>
            ))
          ) : (
            <span style={styles.timeEmpty}>No reminder times configured.</span>
          )}
        </div>

        {error && <div style={styles.errorText}>{error}</div>}

        <div style={styles.reminderActions}>
          <button
            style={styles.primaryAction}
            onClick={() => setConfirmAction("enable")}
            disabled={status === "working" || remindersEnabled}
          >
            {permission === "granted" ? "Enable Reminders" : "Allow Notifications"}
          </button>
          <button
            style={styles.secondaryAction}
            onClick={() => setConfirmAction("disable")}
            disabled={status === "working" || !remindersEnabled}
          >
            Disable Reminders
          </button>
        </div>
      </div>

      {confirmAction && (
        <div
          style={styles.confirmOverlay}
          onClick={() => setConfirmAction(null)}
        >
          <div
            style={styles.confirmCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.confirmTitle}>
              {confirmAction === "enable"
                ? "Enable reminders?"
                : "Disable reminders?"}
            </h3>
            <p style={styles.confirmText}>
              {confirmAction === "enable"
                ? "We'll send scheduled notifications based on your configured times."
                : "You can re-enable reminders anytime from Settings."}
            </p>
            <div style={styles.confirmActions}>
              <button
                style={styles.confirmCancel}
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button style={styles.confirmPrimary} onClick={handleConfirmAction}>
                {confirmAction === "enable" ? "Enable" : "Disable"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    background:
      "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
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
  statusPill: {
    padding: "6px 12px",
    borderRadius: "999px",
    backgroundColor: "var(--surface-muted)",
    border: "1px solid var(--border)",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--muted)",
  },
  reminderTimes: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  timeChip: {
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "var(--primary-soft)",
    color: "var(--primary)",
    fontSize: "12px",
    fontWeight: "600",
  },
  timeEmpty: {
    fontSize: "12px",
    color: "var(--muted)",
  },
  reminderActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryAction: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "12px",
    border: "none",
    background:
      "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(91, 108, 244, 0.25)",
  },
  secondaryAction: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid var(--border-strong)",
    backgroundColor: "transparent",
    color: "var(--muted)",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorText: {
    fontSize: "12px",
    color: "#ef4444",
  },
  confirmOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 90,
    padding: "20px",
  },
  confirmCard: {
    width: "100%",
    maxWidth: "320px",
    backgroundColor: "var(--surface)",
    borderRadius: "16px",
    padding: "18px",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  confirmTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text-strong)",
    fontFamily: "var(--font-display)",
  },
  confirmText: {
    margin: 0,
    fontSize: "13px",
    color: "var(--muted)",
    lineHeight: "1.4",
  },
  confirmActions: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  confirmCancel: {
    flex: 1,
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--muted)",
    backgroundColor: "transparent",
    border: "1px solid var(--border-strong)",
    borderRadius: "10px",
    cursor: "pointer",
  },
  confirmPrimary: {
    flex: 1,
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    background:
      "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(91, 108, 244, 0.25)",
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
