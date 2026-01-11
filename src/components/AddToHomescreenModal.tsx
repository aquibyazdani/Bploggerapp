import React from "react";
import { X, Smartphone, Share, Plus } from "lucide-react";

interface AddToHomescreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  canInstall: boolean;
}

export function AddToHomescreenModal({
  isOpen,
  onClose,
  onInstall,
  canInstall,
}: AddToHomescreenModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Detect iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // Try to trigger share menu on iOS (best effort)
  const handleIOSShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BP Tracker",
          text: "Professional Blood Pressure Tracking App",
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share or share not supported
        console.log("Share cancelled or not supported");
      }
    }
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>
          <X size={20} />
        </button>

        <div style={styles.content}>
          <div style={styles.icon}>
            <Smartphone size={48} color="var(--primary)" />
          </div>

          <h2 style={styles.title}>Add to Homescreen</h2>
          <p style={styles.description}>
            Install BP Tracker on your device for quick access and a native app
            experience.
          </p>

          {canInstall ? (
            <div style={styles.installSection}>
              <p style={styles.installText}>
                Ready to install? Click the button below to add BP Tracker to
                your home screen.
              </p>
              <button onClick={onInstall} style={styles.primaryButton}>
                Add to Home Screen
              </button>
            </div>
          ) : isIOS ? (
            <div style={styles.installSection}>
              <p style={styles.installText}>
                Tap below to open the share menu, then select "Add to Home
                Screen".
              </p>
              <button onClick={handleIOSShare} style={styles.primaryButton}>
                Open Share Menu
              </button>
              <div style={styles.instructions}>
                <div style={styles.step}>
                  <div style={styles.stepIcon}>
                    <Share size={16} />
                  </div>
                  <span style={styles.stepText}>
                    Select "Add to Home Screen"
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.instructions}>
              <div style={styles.step}>
                <div style={styles.stepIcon}>
                  <Share size={16} />
                </div>
                <span style={styles.stepText}>Tap the share button</span>
              </div>

              <div style={styles.step}>
                <div style={styles.stepIcon}>
                  <Plus size={16} />
                </div>
                <span style={styles.stepText}>Select "Add to Home Screen"</span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            style={
              canInstall || isIOS
                ? styles.secondaryButton
                : styles.primaryButton
            }
          >
            {canInstall || isIOS ? "Maybe later" : "Got it!"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    maxWidth: "320px",
    width: "100%",
    position: "relative",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-md)",
  },
  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    color: "var(--muted)",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    backgroundColor: "var(--primary-soft)",
    borderRadius: "18px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--text-strong)",
    fontFamily: "var(--font-display)",
    margin: 0,
    textAlign: "center",
  },
  description: {
    fontSize: "14px",
    color: "var(--muted)",
    textAlign: "center",
    lineHeight: "1.5",
    margin: 0,
  },
  instructions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
  },
  installSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
    alignItems: "center",
  },
  installText: {
    fontSize: "14px",
    color: "var(--muted)",
    textAlign: "center",
    lineHeight: "1.5",
    margin: 0,
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "var(--surface-muted)",
    borderRadius: "12px",
  },
  stepIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    borderRadius: "8px",
    flexShrink: 0,
  },
  stepText: {
    fontSize: "14px",
    color: "var(--text-strong)",
    fontWeight: "500",
  },
  primaryButton: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 10px 24px rgba(91, 108, 244, 0.25)",
  },
  secondaryButton: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    fontWeight: "500",
    color: "var(--muted)",
    backgroundColor: "transparent",
    border: "1px solid var(--border-strong)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "8px",
  },
};
