import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DashboardPage } from "./components/DashboardPage";
import { ReadingsPage } from "./components/ReadingsPage";
import { TrendsPage } from "./components/TrendsPage";
import { SummaryPage } from "./components/SummaryPage";
import { SettingsPage } from "./components/SettingsPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { AddToHomescreenModal } from "./components/AddToHomescreenModal";
import {
  Activity,
  Home,
  List,
  TrendingUp,
  FileBarChart,
  LogOut,
  Plus,
  Settings,
} from "lucide-react";

export interface Reading {
  _id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  bodyPosition: "seated" | "leaning" | "laying";
  note?: string;
  timestamp: string;
}

function AppContent() {
  const { user, token, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "readings" | "trends" | "summary" | "settings"
  >("dashboard");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "signup">("login");
  const [showAddToHomescreenModal, setShowAddToHomescreenModal] =
    useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const defaultThemeColor = "#5b6cf4";
  const [themeColor, setThemeColor] = useState(defaultThemeColor);

  const applyThemeColor = (color: string) => {
    const hex = color.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;

    const toRgb = (value: string) => {
      const num = parseInt(value.slice(1), 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    };

    const mix = (c1: string, c2: string, weight: number) => {
      const a = toRgb(c1);
      const b = toRgb(c2);
      const clamp = (val: number) => Math.min(255, Math.max(0, val));
      const toHex = (val: number) => clamp(val).toString(16).padStart(2, "0");
      const r = Math.round(a.r * (1 - weight) + b.r * weight);
      const g = Math.round(a.g * (1 - weight) + b.g * weight);
      const bVal = Math.round(a.b * (1 - weight) + b.b * weight);
      return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
    };

    const strong = mix(hex, "#000000", 0.18);
    const soft = mix(hex, "#ffffff", 0.88);
    const rgb = toRgb(hex);

    const root = document.documentElement.style;
    root.setProperty("--primary", hex);
    root.setProperty("--primary-strong", strong);
    root.setProperty("--primary-soft", soft);
    root.setProperty("--primary-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  };

  // Load readings from API
  const loadReadings = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/readings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReadings(data);
      }
    } catch (error) {
      console.error("Error loading readings:", error);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadReadings();
      // Clear hash when user is authenticated
      window.location.hash = "";

      // Show Add to Homescreen modal after 30 seconds
      const timer = setTimeout(() => {
        // Check if the app is not already installed
        if (!window.matchMedia("(display-mode: standalone)").matches) {
          setShowAddToHomescreenModal(true);
        }
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [user, token]);

  useEffect(() => {
    const storedColor = localStorage.getItem("themeColor");
    if (storedColor) {
      setThemeColor(storedColor);
      applyThemeColor(storedColor);
    } else {
      applyThemeColor(defaultThemeColor);
    }
  }, []);

  useEffect(() => {
    if (!/^#[0-9a-fA-F]{6}$/.test(themeColor)) return;
    applyThemeColor(themeColor);
    localStorage.setItem("themeColor", themeColor);
  }, [themeColor]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Check hash for auth page
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#signup") {
        setAuthPage("signup");
      } else if (hash === "#login") {
        setAuthPage("login");
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Handle PWA installation
  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS - try to guide user to share menu
      handleIOSInstall();
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the deferred prompt
    setDeferredPrompt(null);

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      setShowAddToHomescreenModal(false);
    } else {
      console.log("User dismissed the install prompt");
    }
  };

  // Handle iOS installation (fallback)
  const handleIOSInstall = () => {
    // On iOS, we can't programmatically install, but we can try to guide the user
    // The modal will show iOS-specific instructions
    // We could potentially try to trigger the share menu, but it's unreliable
    console.log("iOS installation - showing instructions");
  };

  const handleAddReading = async (
    reading: Omit<Reading, "_id" | "timestamp">
  ) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/readings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reading),
        }
      );

      if (response.ok) {
        await loadReadings();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding reading:", error);
    }
  };

  const handleEditReading = (reading: Reading) => {
    setEditingReading(reading);
    setShowForm(true);
    setCurrentPage("readings");
  };

  const handleUpdateReading = async (updatedReading: Reading) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/readings/${updatedReading._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            timestamp: updatedReading.timestamp,
            systolic: updatedReading.systolic,
            diastolic: updatedReading.diastolic,
            pulse: updatedReading.pulse,
            bodyPosition: updatedReading.bodyPosition,
            note: updatedReading.note,
          }),
        }
      );

      if (response.ok) {
        await loadReadings();
        setEditingReading(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error updating reading:", error);
    }
  };

  const handleDeleteReading = async (id: string) => {
    if (!token) return;

    if (confirm("Are you sure you want to delete this reading?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/readings/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          await loadReadings();
          if (editingReading?._id === id) {
            setEditingReading(null);
            setShowForm(false);
          }
        }
      } catch (error) {
        console.error("Error deleting reading:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
    setShowForm(false);
  };

  const handleQuickAdd = () => {
    setCurrentPage("readings");
    setEditingReading(null);
    setShowForm(true);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage("dashboard");
    setReadings([]);
    // Clear hash on logout
    window.location.hash = "";
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Activity size={32} style={{ color: "#6B7CF5" }} />
      </div>
    );
  }

  if (!user) {
    return authPage === "login" ? <LoginPage /> : <SignupPage />;
  }

  return (
    <div style={styles.app}>
      {/* Mobile App Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Activity size={24} style={styles.headerIcon} />
          <h1 style={styles.headerTitle}>BP Tracker</h1>
          <div style={styles.headerActions}>
            <button
              onClick={() => setCurrentPage("settings")}
              style={styles.headerActionButton}
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              style={styles.headerActionButton}
              aria-label="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {currentPage === "dashboard" && (
          <DashboardPage readings={readings} userName={user.name} />
        )}
        {currentPage === "readings" && (
          <ReadingsPage
            readings={readings}
            onAdd={handleAddReading}
            onEdit={handleEditReading}
            onUpdate={handleUpdateReading}
            onDelete={handleDeleteReading}
            onCancelEdit={handleCancelEdit}
            editingReading={editingReading}
            showFormInitial={showForm}
          />
        )}
        {currentPage === "trends" && <TrendsPage readings={readings} />}
        {currentPage === "summary" && <SummaryPage readings={readings} />}
        {currentPage === "settings" && (
          <SettingsPage
            themeColor={themeColor}
            onThemeColorChange={setThemeColor}
            onResetTheme={() => {
              localStorage.removeItem("themeColor");
              setThemeColor(defaultThemeColor);
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav style={styles.bottomNav}>
        <button
          onClick={() => setCurrentPage("dashboard")}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === "dashboard"
              ? styles.bottomNavButtonActive
              : {}),
          }}
          aria-label="Dashboard"
        >
          <span
            style={
              currentPage === "dashboard"
                ? styles.bottomNavIconWrapActive
                : styles.bottomNavIconWrap
            }
          >
            <Home size={20} style={styles.bottomNavIcon} />
          </span>
        </button>
        <button
          onClick={() => {
            setCurrentPage("readings");
            setShowForm(false);
            setEditingReading(null);
          }}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === "readings" ? styles.bottomNavButtonActive : {}),
          }}
          aria-label="Readings"
        >
          <span
            style={
              currentPage === "readings"
                ? styles.bottomNavIconWrapActive
                : styles.bottomNavIconWrap
            }
          >
            <List size={20} style={styles.bottomNavIcon} />
          </span>
        </button>
        <button
          onClick={handleQuickAdd}
          style={styles.bottomNavCenterButton}
          aria-label="Add reading"
        >
          <span style={styles.bottomNavCenterWrap}>
            <Plus size={22} strokeWidth={2.6} />
          </span>
        </button>
        <button
          onClick={() => setCurrentPage("trends")}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === "trends" ? styles.bottomNavButtonActive : {}),
          }}
          aria-label="Trends"
        >
          <span
            style={
              currentPage === "trends"
                ? styles.bottomNavIconWrapActive
                : styles.bottomNavIconWrap
            }
          >
            <TrendingUp size={20} style={styles.bottomNavIcon} />
          </span>
        </button>
        <button
          onClick={() => setCurrentPage("summary")}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === "summary" ? styles.bottomNavButtonActive : {}),
          }}
          aria-label="Summary"
        >
          <span
            style={
              currentPage === "summary"
                ? styles.bottomNavIconWrapActive
                : styles.bottomNavIconWrap
            }
          >
            <FileBarChart size={20} style={styles.bottomNavIcon} />
          </span>
        </button>
      </nav>

      {/* Branding Footer */}
      <footer style={styles.brandingFooter}>
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
      </footer>

      {/* Add to Homescreen Modal */}
      <AddToHomescreenModal
        isOpen={showAddToHomescreenModal}
        onClose={() => setShowAddToHomescreenModal(false)}
        onInstall={handleInstallApp}
        canInstall={!!deferredPrompt}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--app-bg)",
    maxWidth: "430px",
    margin: "0 auto",
    position: "relative",
    color: "var(--text)",
  },
  nav: {
    display: "none",
  },
  navContainer: {
    display: "none",
  },
  logo: {
    display: "none",
  },
  logoIcon: {
    display: "none",
  },
  logoText: {
    display: "none",
  },
  navLinks: {
    display: "none",
  },
  navLink: {
    display: "none",
  },
  navLinkActive: {
    display: "none",
  },
  navLinkIcon: {
    display: "none",
  },
  header: {
    background:
      "linear-gradient(135deg, var(--primary-strong) 0%, var(--primary) 100%)",
    padding: "18px 20px 14px 20px",
    borderBottom: "none",
    position: "sticky",
    top: 0,
    zIndex: 40,
    boxShadow: "0 10px 24px rgba(var(--primary-rgb), 0.22)",
    borderRadius: "0px 0px 18px 18px",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  headerIcon: {
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.01em",
    fontFamily: "var(--font-display)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  headerActionButton: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#ffffff",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "10px",
    transition: "background-color 0.2s",
  },
  main: {
    flex: 1,
    width: "100%",
    margin: "0",
    padding: "18px 16px 120px 16px",
    overflowY: "auto",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(12px)",
    border: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-around",
    padding: "8px 8px max(10px, env(safe-area-inset-bottom))",
    zIndex: 50,
    boxShadow:
      "0 -10px 24px rgba(15, 23, 42, 0.08), 0 -1px 0 rgba(255, 255, 255, 0.7) inset",
    borderRadius: "20px 20px 16px 16px",
  },
  bottomNavButton: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "4px 4px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "var(--muted)",
    justifyContent: "center",
  },
  bottomNavButtonActive: {
    transform: "translateY(-1px)",
  },
  bottomNavCenterButton: {
    width: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    // transform: "translateY(-12px)",
  },
  bottomNavCenterWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 10px 22px rgba(91, 108, 244, 0.35), 0 6px 14px rgba(15, 23, 42, 0.12)",
  },
  bottomNavIconWrap: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    backgroundColor: "var(--surface-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8a94a6",
  },
  bottomNavIconWrapActive: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    boxShadow: "0 6px 16px rgba(91, 108, 244, 0.35)",
  },
  bottomNavIcon: {
    transition: "transform 0.2s",
  },
  bottomNavLabel: {
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "0.015em",
    textTransform: "uppercase",
    color: "var(--muted)",
  },
  bottomNavLabelActive: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "var(--primary)",
  },
  brandingFooter: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    backdropFilter: "blur(10px)",
    borderTop: "1px solid var(--border)",
    padding: "8px 16px",
    textAlign: "center",
    zIndex: 40,
  },
  brandingText: {
    margin: 0,
    fontSize: "10px",
    color: "var(--muted)",
    fontWeight: "400",
  },
  brandingLink: {
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: "500",
  },
  footer: {
    display: "none",
  },
  footerText: {
    display: "none",
  },
  footerIcon: {
    display: "none",
  },
};
