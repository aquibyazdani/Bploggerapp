import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DashboardPage } from "./components/DashboardPage";
import { ReadingsPage } from "./components/ReadingsPage";
import { TrendsPage } from "./components/TrendsPage";
import { SummaryPage } from "./components/SummaryPage";
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
    "dashboard" | "readings" | "trends" | "summary"
  >("dashboard");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "signup">("login");
  const [showAddToHomescreenModal, setShowAddToHomescreenModal] =
    useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

  const handleDashboardAddClick = () => {
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
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {currentPage === "dashboard" && (
          <DashboardPage
            readings={readings}
            onAddClick={handleDashboardAddClick}
            userName={user.name}
          />
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
          <span
            style={
              currentPage === "dashboard"
                ? styles.bottomNavLabelActive
                : styles.bottomNavLabel
            }
          >
            Dashboard
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
          <span
            style={
              currentPage === "readings"
                ? styles.bottomNavLabelActive
                : styles.bottomNavLabel
            }
          >
            Readings
          </span>
        </button>
        <button
          onClick={() => setCurrentPage("trends")}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === "trends" ? styles.bottomNavButtonActive : {}),
          }}
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
          <span
            style={
              currentPage === "trends"
                ? styles.bottomNavLabelActive
                : styles.bottomNavLabel
            }
          >
            Trends
          </span>
        </button>
        <button
          onClick={() => setCurrentPage("summary")}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === "summary" ? styles.bottomNavButtonActive : {}),
          }}
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
          <span
            style={
              currentPage === "summary"
                ? styles.bottomNavLabelActive
                : styles.bottomNavLabel
            }
          >
            Summary
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
    background: "#fefefe",
    maxWidth: "430px",
    margin: "0 auto",
    position: "relative",
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
    background: "linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)",
    padding: "20px 20px 16px 20px",
    borderBottom: "none",
    position: "sticky",
    top: 0,
    zIndex: 40,
    boxShadow: "0 4px 12px rgba(107, 124, 245, 0.15)",
    borderRadius: "0px 0px 10px 10px",
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
    fontWeight: "600",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  logoutButton: {
    background: "none",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  main: {
    flex: 1,
    width: "100%",
    margin: "0",
    padding: "16px 16px 120px 16px", // Increased from 90px to 120px for branding footer
    overflowY: "auto",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(15, 23, 42, 0.06)",
    display: "flex",
    justifyContent: "space-around",
    padding: "8px 8px max(10px, env(safe-area-inset-bottom))",
    zIndex: 50,
    boxShadow:
      "0 -6px 20px rgba(15, 23, 42, 0.08), 0 -1px 0 rgba(255, 255, 255, 0.7) inset",
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
    color: "#a3a3a3",
  },
  bottomNavButtonActive: {
    transform: "translateY(-1px)",
  },
  bottomNavIconWrap: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    boxShadow: "inset 0 0 0 1px rgba(148, 163, 184, 0.12)",
  },
  bottomNavIconWrapActive: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    boxShadow: "0 5px 12px rgba(91, 108, 244, 0.32)",
  },
  bottomNavIcon: {
    transition: "transform 0.2s",
  },
  bottomNavLabel: {
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "0.015em",
    textTransform: "uppercase",
    color: "#9aa0ab",
  },
  bottomNavLabelActive: {
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "#5B6CF4",
  },
  brandingFooter: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "430px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderTop: "1px solid rgba(0, 0, 0, 0.05)",
    padding: "8px 16px",
    textAlign: "center",
    zIndex: 40,
  },
  brandingText: {
    margin: 0,
    fontSize: "10px",
    color: "#6B7280",
    fontWeight: "400",
  },
  brandingLink: {
    color: "#6B7CF5",
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
