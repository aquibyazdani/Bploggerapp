import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DashboardPage } from "./components/DashboardPage";
import { ReadingsPage } from "./components/ReadingsPage";
import { TrendsPage } from "./components/TrendsPage";
import { SummaryPage } from "./components/SummaryPage";
import { SettingsPage } from "./components/SettingsPage";
import { LoginPage } from "./components/LoginPage";
import { AddToHomescreenModal } from "./components/AddToHomescreenModal";
import { Profile } from "./types/profile";
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
  profile?: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  bodyPosition: "seated" | "leaning" | "laying";
  note?: string;
  timestamp: string;
}

const DEFAULT_THEME_COLOR = "#5b6cf4";

function AppContent() {
  const { user, token, logout, loading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "readings" | "trends" | "summary" | "settings"
  >("dashboard");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [readingsLoading, setReadingsLoading] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    () => localStorage.getItem("selectedProfileId"),
  );
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [hiddenProfileIds, setHiddenProfileIds] = useState<string[]>(() => {
    const raw = localStorage.getItem("hiddenProfileIds");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
    } catch {
      return [];
    }
  });
  const [showAddToHomescreenModal, setShowAddToHomescreenModal] =
    useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [themeColor, setThemeColor] = useState(DEFAULT_THEME_COLOR);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const reminderTimes = useMemo(() => {
    const raw = import.meta.env.VITE_REMINDER_TIMES as string | undefined;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((time) => String(time));
      }
    } catch (error) {
      // ignore malformed env
    }
    return [];
  }, []);

  const applyThemeColor = useCallback((color: string) => {
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
  }, []);

  const selectProfile = useCallback((profileId: string | null) => {
    setSelectedProfileId(profileId);
    if (profileId) {
      localStorage.setItem("selectedProfileId", profileId);
    } else {
      localStorage.removeItem("selectedProfileId");
      setReadings([]);
      setEditingReading(null);
      setShowForm(false);
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    if (!token) return;

    setProfilesLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: Profile[] = await response.json();
        setProfiles(data);

        const hiddenSet = new Set(hiddenProfileIds);
        const visibleProfiles = data.filter(
          (profile) => profile.isDefault || !hiddenSet.has(profile._id),
        );
        const storedId = localStorage.getItem("selectedProfileId");
        const storedProfile = visibleProfiles.find(
          (profile) => profile._id === storedId,
        );
        const fallback =
          storedProfile ||
          visibleProfiles.find((profile) => profile.isDefault) ||
          visibleProfiles[0] ||
          null;
        selectProfile(fallback ? fallback._id : null);
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setProfilesLoading(false);
    }
  }, [apiBaseUrl, hiddenProfileIds, selectProfile, token]);

  // Load readings from API
  const loadReadings = useCallback(
    async (withLoading = true) => {
      if (!token || !selectedProfileId) return;

      if (withLoading) {
        setReadingsLoading(true);
      }
      try {
        const response = await fetch(
          `${apiBaseUrl}/readings?profileId=${encodeURIComponent(
            selectedProfileId,
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setReadings(data);
        }
      } catch (error) {
        console.error("Error loading readings:", error);
      } finally {
        if (withLoading) {
          setReadingsLoading(false);
        }
      }
    },
    [apiBaseUrl, selectedProfileId, token],
  );

  const handleCreateProfile = useCallback(
    async (profile: { name: string; relation: string }) => {
      if (!token) return;

      try {
        const response = await fetch(`${apiBaseUrl}/profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        });

        if (!response.ok) {
          throw new Error("Failed to add profile");
        }

        await loadProfiles();
      } catch (error) {
        console.error("Error adding profile:", error);
      }
    },
    [apiBaseUrl, loadProfiles, token],
  );

  const handleUpdateProfile = useCallback(
    async (profileId: string, updates: { name: string; relation: string }) => {
      if (!token) return;

      try {
        const response = await fetch(`${apiBaseUrl}/profiles/${profileId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        await loadProfiles();
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    },
    [apiBaseUrl, loadProfiles, token],
  );

  const handleToggleProfileHidden = useCallback(
    (profileId: string, hidden: boolean) => {
      setHiddenProfileIds((prev) => {
        const next = hidden
          ? Array.from(new Set([...prev, profileId]))
          : prev.filter((id) => id !== profileId);
        localStorage.setItem("hiddenProfileIds", JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const visibleProfiles = useMemo(
    () =>
      profiles.filter(
        (profile) =>
          profile.isDefault || !hiddenProfileIds.includes(profile._id),
      ),
    [hiddenProfileIds, profiles],
  );

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile._id === selectedProfileId) || null,
    [profiles, selectedProfileId],
  );

  useEffect(() => {
    if (!selectedProfileId) return;
    const selected = profiles.find(
      (profile) => profile._id === selectedProfileId,
    );
    if (!selected) return;
    if (selected.isDefault) return;
    if (!hiddenProfileIds.includes(selectedProfileId)) return;

    const fallback =
      visibleProfiles.find((profile) => profile.isDefault) ||
      visibleProfiles[0] ||
      null;
    selectProfile(fallback ? fallback._id : null);
  }, [
    hiddenProfileIds,
    profiles,
    selectProfile,
    selectedProfileId,
    visibleProfiles,
  ]);

  useEffect(() => {
    if (user && token) {
      loadProfiles();
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
  }, [loadProfiles, token, user]);

  useEffect(() => {
    if (user && token && selectedProfileId) {
      loadReadings();
    }
  }, [loadReadings, selectedProfileId, token, user]);

  useEffect(() => {
    const storedColor = localStorage.getItem("themeColor");
    if (storedColor) {
      setThemeColor(storedColor);
      applyThemeColor(storedColor);
    } else {
      applyThemeColor(DEFAULT_THEME_COLOR);
    }
  }, [applyThemeColor]);

  useEffect(() => {
    if (!/^#[0-9a-fA-F]{6}$/.test(themeColor)) return;
    applyThemeColor(themeColor);
    localStorage.setItem("themeColor", themeColor);
  }, [applyThemeColor, themeColor]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    if (!isProfileSheetOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileSheetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProfileSheetOpen]);

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
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  // Handle PWA installation
  const handleIOSInstall = useCallback(() => {
    // On iOS, we can't programmatically install, but we can try to guide the user
    // The modal will show iOS-specific instructions
    // We could potentially try to trigger the share menu, but it's unreliable
    console.log("iOS installation - showing instructions");
  }, []);

  const handleInstallApp = useCallback(async () => {
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
  }, [deferredPrompt, handleIOSInstall]);

  const handleAddReading = useCallback(
    async (reading: Omit<Reading, "_id" | "timestamp">) => {
      if (!token || !selectedProfileId) return;

      try {
        setReadingsLoading(true);
        const response = await fetch(`${apiBaseUrl}/readings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...reading, profileId: selectedProfileId }),
        });

        if (!response.ok) {
          throw new Error("Failed to add reading");
        }

        await loadReadings(false);
        setShowForm(false);
      } catch (error) {
        console.error("Error adding reading:", error);
      } finally {
        setReadingsLoading(false);
      }
    },
    [apiBaseUrl, loadReadings, selectedProfileId, token],
  );

  const handleEditReading = useCallback((reading: Reading) => {
    setEditingReading(reading);
    setShowForm(true);
    setCurrentPage("readings");
  }, []);

  const handleUpdateReading = useCallback(
    async (updatedReading: Reading) => {
      if (!token || !selectedProfileId) return;

      try {
        setReadingsLoading(true);
        const response = await fetch(
          `${apiBaseUrl}/readings/${updatedReading._id}`,
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
              profileId: selectedProfileId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update reading");
        }

        await loadReadings(false);
        setEditingReading(null);
        setShowForm(false);
      } catch (error) {
        console.error("Error updating reading:", error);
      } finally {
        setReadingsLoading(false);
      }
    },
    [apiBaseUrl, loadReadings, selectedProfileId, token],
  );

  const handleDeleteReading = useCallback(
    async (id: string) => {
      if (!token) return;

      try {
        setReadingsLoading(true);
        const response = await fetch(`${apiBaseUrl}/readings/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete reading");
        }

        await loadReadings(false);
        if (editingReading?._id === id) {
          setEditingReading(null);
          setShowForm(false);
        }
      } catch (error) {
        console.error("Error deleting reading:", error);
      } finally {
        setReadingsLoading(false);
      }
    },
    [apiBaseUrl, editingReading, loadReadings, token],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingReading(null);
    setShowForm(false);
  }, []);

  const handleQuickAdd = useCallback(() => {
    setCurrentPage("readings");
    setEditingReading(null);
    setShowForm(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setCurrentPage("dashboard");
    setReadings([]);
    setProfiles([]);
    selectProfile(null);
    // Clear hash on logout
    window.location.hash = "";
  }, [logout, selectProfile]);

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
        <Activity size={32} style={{ color: themeColor }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div style={styles.app}>
      {/* Mobile App Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Activity size={24} style={styles.headerIcon} />
          <h1 style={styles.headerTitle}>BP Tracker</h1>
          {visibleProfiles.length > 1 && (
            <div style={styles.profileSelector}>
              <div style={styles.profileSelectWrap}>
                <span style={styles.profileDot} />
                <button
                  type="button"
                  style={styles.profileSelectButton}
                  onClick={() => setIsProfileSheetOpen(true)}
                  disabled={profilesLoading}
                  aria-label="Open profile switcher"
                >
                  {selectedProfile?.name || "Select profile"}
                </button>
                <button
                  type="button"
                  style={styles.profileCaretButton}
                  onClick={() => setIsProfileSheetOpen(true)}
                  aria-label="Open profile switcher"
                  disabled={profilesLoading}
                >
                  ▾
                </button>
              </div>
            </div>
          )}
          <div style={styles.headerActions}>
            <button
              onClick={() => setCurrentPage("settings")}
              style={styles.headerActionButton}
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={handleLogout}
              style={styles.headerActionButton}
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {currentPage === "dashboard" && (
          <DashboardPage
            readings={readings}
            userName={selectedProfile?.name || user.name}
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
            loading={readingsLoading}
          />
        )}
        {currentPage === "trends" && <TrendsPage readings={readings} />}
        {currentPage === "summary" && (
          <SummaryPage
            readings={readings}
            userName={selectedProfile?.name || user?.name}
          />
        )}
        {currentPage === "settings" && (
          <SettingsPage
            themeColor={themeColor}
            onThemeColorChange={setThemeColor}
            onResetTheme={() => {
              localStorage.removeItem("themeColor");
              setThemeColor(DEFAULT_THEME_COLOR);
            }}
            email={user?.email}
            reminderTimes={reminderTimes}
            apiBaseUrl={apiBaseUrl}
            token={token}
            profiles={profiles}
            selectedProfileId={selectedProfileId}
            onSelectProfile={selectProfile}
            onCreateProfile={handleCreateProfile}
            onUpdateProfile={handleUpdateProfile}
            hiddenProfileIds={hiddenProfileIds}
            onToggleProfileHidden={handleToggleProfileHidden}
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

      {isProfileSheetOpen && (
        <div
          style={styles.sheetOverlay}
          onClick={() => setIsProfileSheetOpen(false)}
        >
          <div
            style={styles.sheet}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.sheetHandle} />
            <div style={styles.sheetHeader}>
              <span style={styles.sheetTitle}>Switch profile</span>
              <button
                type="button"
                style={styles.sheetClose}
                onClick={() => setIsProfileSheetOpen(false)}
                aria-label="Close profile switcher"
              >
                ✕
              </button>
            </div>
            <div style={styles.sheetList}>
              {visibleProfiles.map((profile) => {
                const isActive = profile._id === selectedProfileId;
                return (
                  <button
                    key={profile._id}
                    type="button"
                    style={{
                      ...styles.sheetItem,
                      ...(isActive ? styles.sheetItemActive : {}),
                    }}
                    onClick={() => {
                      selectProfile(profile._id);
                      setIsProfileSheetOpen(false);
                    }}
                  >
                    <div style={styles.sheetItemInfo}>
                      <span style={styles.sheetItemName}>{profile.name}</span>
                      <span style={styles.sheetItemMeta}>
                        {profile.relation}
                      </span>
                    </div>
                    {isActive && <span style={styles.sheetItemCheck}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
  header: {
    background:
      "linear-gradient(135deg, var(--primary-strong) 0%, var(--primary) 100%)",
    padding: "18px 20px 14px 20px",
    borderBottom: "none",
    position: "sticky",
    top: 0,
    zIndex: 40,
    boxShadow: "0 10px 24px rgba(var(--primary-rgb), 0.22)",
    borderRadius: "0px 0px 16px 16px",
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
    fontSize: "17px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.01em",
    fontFamily: "var(--font-display)",
  },
  profileSelector: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flex: 1,
    justifyContent: "center",
  },
  profileSelectWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.35)",
    borderRadius: "12px",
    padding: "4px 8px",
    minWidth: "120px",
    maxWidth: "170px",
    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
  },
  profileDot: {
    width: "6px",
    height: "6px",
    borderRadius: "999px",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.22)",
    flexShrink: 0,
  },
  profileSelectButton: {
    background: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "600",
    minWidth: "90px",
    maxWidth: "130px",
    outline: "none",
    textAlign: "left",
    flex: 1,
    cursor: "pointer",
  },
  profileCaretButton: {
    background: "rgba(255, 255, 255, 0.18)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    color: "rgba(255, 255, 255, 0.9)",
    width: "22px",
    height: "22px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  headerActionButton: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#ffffff",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "8px",
    transition: "background-color 0.2s",
  },
  sheetOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    backdropFilter: "blur(6px)",
    zIndex: 80,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: "0 16px 16px 16px",
  },
  sheet: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "12px 16px 20px",
    boxShadow: "0 24px 48px rgba(15, 23, 42, 0.2)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    animation: "sheetUp 180ms ease-out",
  },
  sheetHandle: {
    width: "44px",
    height: "5px",
    borderRadius: "999px",
    backgroundColor: "#e2e8f0",
    margin: "4px auto 10px",
  },
  sheetHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  sheetTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-strong)",
  },
  sheetClose: {
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "var(--muted)",
  },
  sheetList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sheetItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    backgroundColor: "rgba(248, 250, 252, 0.9)",
    cursor: "pointer",
    textAlign: "left",
  },
  sheetItemActive: {
    borderColor: "rgba(var(--primary-rgb), 0.5)",
    backgroundColor: "rgba(var(--primary-rgb), 0.12)",
  },
  sheetItemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  sheetItemName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-strong)",
  },
  sheetItemMeta: {
    fontSize: "12px",
    color: "var(--muted)",
    textTransform: "capitalize",
  },
  sheetItemCheck: {
    fontSize: "16px",
    color: "var(--primary-strong)",
    fontWeight: "700",
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
    borderRadius: "20px 20px 0px 0px",
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
};
