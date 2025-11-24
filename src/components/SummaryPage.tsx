import React, { useState } from "react";
import { Reading } from "../App";
import {
  BarChart3,
  Download,
  Lightbulb,
  Calendar,
  Heart,
  Clock,
  Armchair,
  User,
  Bed,
} from "lucide-react";

interface SummaryPageProps {
  readings: Reading[];
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDisplayDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCSV(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(
  readings: Reading[],
  startDate?: string,
  endDate?: string
) {
  // Filter readings by date range if provided
  let filteredReadings = readings;
  if (startDate || endDate) {
    filteredReadings = readings.filter((r) => {
      const readingDate = formatDate(r.timestamp);
      if (startDate && readingDate < startDate) return false;
      if (endDate && readingDate > endDate) return false;
      return true;
    });
  }

  // CSV header
  const headers = [
    "id",
    "date",
    "time",
    "systolic",
    "diastolic",
    "pulse",
    "body_position",
    "note",
  ];
  const csvRows = [headers.join(",")];

  // Sort oldest first for export
  const sortedReadings = [...filteredReadings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Add data rows
  sortedReadings.forEach((reading) => {
    const row = [
      escapeCSV(reading._id),
      escapeCSV(formatDate(reading.timestamp)),
      escapeCSV(formatTime(reading.timestamp)),
      escapeCSV(reading.systolic),
      escapeCSV(reading.diastolic),
      escapeCSV(reading.pulse || ""),
      escapeCSV(reading.bodyPosition),
      escapeCSV(reading.note || ""),
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const dateStr = formatDate(new Date().toISOString());
  const rangeStr =
    startDate || endDate
      ? `_${startDate || "start"}_to_${endDate || "end"}`
      : "";
  link.download = `bp-readings-${dateStr}${rangeStr}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function calculateStats(
  readings: Reading[],
  days: number
): {
  systolic: number;
  diastolic: number;
  pulse: number;
  count: number;
} | null {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentReadings = readings.filter(
    (r) => new Date(r.timestamp) >= cutoffDate
  );

  if (recentReadings.length === 0) return null;

  const totalSystolic = recentReadings.reduce((sum, r) => sum + r.systolic, 0);
  const totalDiastolic = recentReadings.reduce(
    (sum, r) => sum + r.diastolic,
    0
  );
  const pulseReadings = recentReadings.filter((r) => r.pulse);
  const totalPulse = pulseReadings.reduce((sum, r) => sum + (r.pulse || 0), 0);

  return {
    systolic: Math.round(totalSystolic / recentReadings.length),
    diastolic: Math.round(totalDiastolic / recentReadings.length),
    pulse:
      pulseReadings.length > 0
        ? Math.round(totalPulse / pulseReadings.length)
        : 0,
    count: recentReadings.length,
  };
}

function getBPCategory(
  systolic: number,
  diastolic: number
): { label: string; color: string; message: string } {
  // Check for Crisis first (highest priority)
  if (systolic >= 180 || diastolic >= 120) {
    return {
      label: "Hypertensive Crisis",
      color: "#991b1b",
      message: "This is a medical emergency. Seek immediate medical care.",
    };
  }
  // Check for Stage 2
  else if (systolic >= 140 || diastolic >= 90) {
    return {
      label: "High Blood Pressure (Stage 2)",
      color: "#dc2626",
      message: "You have stage 2 hypertension. Seek medical attention.",
    };
  }
  // Check for Stage 1
  else if (
    (systolic >= 130 && systolic <= 139) ||
    (diastolic >= 82 && diastolic <= 89)
  ) {
    return {
      label: "High Blood Pressure (Stage 1)",
      color: "#ef4444",
      message:
        "You have stage 1 hypertension. Consult with your healthcare provider.",
    };
  }
  // Check for Elevated
  else if (systolic >= 120 && systolic <= 129 && diastolic < 81) {
    return {
      label: "Elevated",
      color: "#f59e0b",
      message:
        "Your blood pressure is elevated. Consider lifestyle modifications.",
    };
  }
  // Normal
  else if (systolic < 120 && diastolic < 81) {
    return {
      label: "Normal",
      color: "#10b981",
      message:
        "Your blood pressure is in the normal range. Keep up the good work!",
    };
  }
  // Fallback (shouldn't reach here, but just in case)
  else {
    return {
      label: "Normal",
      color: "#10b981",
      message:
        "Your blood pressure is in the normal range. Keep up the good work!",
    };
  }
}

export function SummaryPage({ readings }: SummaryPageProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const stats7Days = calculateStats(readings, 7);
  const stats30Days = calculateStats(readings, 30);
  const stats90Days = calculateStats(readings, 90);
  const statsAllTime = {
    systolic:
      readings.length > 0
        ? Math.round(
            readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length
          )
        : 0,
    diastolic:
      readings.length > 0
        ? Math.round(
            readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length
          )
        : 0,
    pulse: (() => {
      const withPulse = readings.filter((r) => r.pulse);
      return withPulse.length > 0
        ? Math.round(
            withPulse.reduce((sum, r) => sum + (r.pulse || 0), 0) /
              withPulse.length
          )
        : 0;
    })(),
    count: readings.length,
  };

  const lastReading = readings.length > 0 ? readings[0] : null;
  const category = lastReading
    ? getBPCategory(lastReading.systolic, lastReading.diastolic)
    : null;

  const handleExport = () => {
    downloadCSV(readings, startDate, endDate);
  };

  if (readings.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Summary & Export</h1>
          <p style={styles.subtitle}>View statistics and export your data</p>
        </div>
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <BarChart3 size={64} color="#94a3b8" />
            </div>
            <h3 style={styles.emptyTitle}>No data to summarize</h3>
            <p style={styles.emptyText}>
              Add some readings to see your blood pressure summary and export
              data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Summary & Export</h1>
        <p style={styles.subtitle}>View statistics and export your data</p>
      </div>

      {/* Last Reading & Category */}
      {lastReading && category && (
        <div style={styles.card}>
          <div
            style={{
              ...styles.cardHeader,
              background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
              borderBottom: `2px solid ${category.color}30`,
            }}
          >
            <h2 style={styles.cardTitle}>Latest Reading</h2>
            <div style={styles.latestHeaderInfo}>
              <span style={styles.latestHeaderDate}>
                <Calendar size={14} />
                {formatDisplayDate(lastReading.timestamp)}
              </span>
              <span style={styles.latestHeaderTime}>
                <Clock size={14} />
                {formatDisplayTime(lastReading.timestamp)}
              </span>
            </div>
          </div>
          <div
            style={{
              ...styles.latestReading,
              background: `linear-gradient(180deg, ${category.color}03 0%, transparent 100%)`,
              padding: "20px",
              gap: "16px",
            }}
          >
            {/* Main BP Display */}
            <div style={{ ...styles.latestBP, gap: "4px" }}>
              <div style={styles.bpNumbersRow}>
                <span style={{ ...styles.latestValue, color: category.color }}>
                  {lastReading.systolic}
                </span>
                <span style={styles.bpDivider}>/</span>
                <span style={{ ...styles.latestValue, color: category.color }}>
                  {lastReading.diastolic}
                </span>
              </div>
              <span style={styles.latestLabel}>mmHg</span>
            </div>

            {/* Additional Info Grid */}
            <div style={styles.latestInfoGrid}>
              {lastReading.pulse && (
                <div style={styles.latestInfoItem}>
                  <div
                    style={{
                      ...styles.latestInfoIcon,
                      backgroundColor: "#fce7f3",
                    }}
                  >
                    <Heart size={16} color="#ec4899" />
                  </div>
                  <div style={styles.latestInfoText}>
                    <span style={styles.latestInfoLabel}>Pulse</span>
                    <span style={styles.latestInfoValue}>
                      {lastReading.pulse} bpm
                    </span>
                  </div>
                </div>
              )}

              <div style={styles.latestInfoItem}>
                <div
                  style={{
                    ...styles.latestInfoIcon,
                    backgroundColor: "#e0e7ff",
                  }}
                >
                  {lastReading.bodyPosition === "seated" && (
                    <Armchair size={16} color="#6366f1" />
                  )}
                  {lastReading.bodyPosition === "leaning" && (
                    <User size={16} color="#6366f1" />
                  )}
                  {lastReading.bodyPosition === "laying" && (
                    <Bed size={16} color="#6366f1" />
                  )}
                </div>
                <div style={styles.latestInfoText}>
                  <span style={styles.latestInfoLabel}>Position</span>
                  <span style={styles.latestInfoValue}>
                    {lastReading.bodyPosition.charAt(0).toUpperCase() +
                      lastReading.bodyPosition.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Message - Thin notification bar */}
            <div
              style={{
                ...styles.categoryMessageBox,
                backgroundColor: `${category.color}10`,
                borderLeft: `3px solid ${category.color}`,
                padding: "10px 12px",
                marginTop: "4px",
              }}
            >
              <Lightbulb size={14} color={category.color} />
              <p
                style={{
                  ...styles.categoryMessage,
                  color: category.color,
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                {category.message}
              </p>
            </div>

            {/* Note if exists */}
            {lastReading.note && (
              <div
                style={{
                  ...styles.latestNote,
                  padding: "12px",
                  marginTop: "4px",
                }}
              >
                <span style={styles.latestNoteLabel}>Note:</span>
                <p style={styles.latestNoteText}>{lastReading.note}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Period Statistics */}
      <div style={styles.statsGrid}>
        {stats7Days && (
          <div
            style={{
              ...styles.statBox,
              background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
              border: "1px solid #f0f0f0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                borderRadius: "50%",
                opacity: 0.08,
              }}
            />
            <span style={styles.statLabel}>Last 7 Days</span>
            <div style={styles.statMainValue}>
              {stats7Days.systolic}/{stats7Days.diastolic}
            </div>
            <div style={styles.statSecondary}>
              {stats7Days.pulse > 0 && (
                <span style={styles.statSubValue}>
                  Avg Pulse: {stats7Days.pulse} bpm
                </span>
              )}
              <span style={styles.statSubValue}>
                {stats7Days.count} readings
              </span>
            </div>
          </div>
        )}

        {stats30Days && (
          <div
            style={{
              ...styles.statBox,
              background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
              border: "1px solid #f0f0f0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                borderRadius: "50%",
                opacity: 0.08,
              }}
            />
            <span style={styles.statLabel}>Last 30 Days</span>
            <div style={styles.statMainValue}>
              {stats30Days.systolic}/{stats30Days.diastolic}
            </div>
            <div style={styles.statSecondary}>
              {stats30Days.pulse > 0 && (
                <span style={styles.statSubValue}>
                  Avg Pulse: {stats30Days.pulse} bpm
                </span>
              )}
              <span style={styles.statSubValue}>
                {stats30Days.count} readings
              </span>
            </div>
          </div>
        )}

        {stats90Days && (
          <div
            style={{
              ...styles.statBox,
              background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
              border: "1px solid #f0f0f0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
                borderRadius: "50%",
                opacity: 0.08,
              }}
            />
            <span style={styles.statLabel}>Last 90 Days</span>
            <div style={styles.statMainValue}>
              {stats90Days.systolic}/{stats90Days.diastolic}
            </div>
            <div style={styles.statSecondary}>
              {stats90Days.pulse > 0 && (
                <span style={styles.statSubValue}>
                  Avg Pulse: {stats90Days.pulse} bpm
                </span>
              )}
              <span style={styles.statSubValue}>
                {stats90Days.count} readings
              </span>
            </div>
          </div>
        )}

        <div
          style={{
            ...styles.statBox,
            background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f0f0f0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
              borderRadius: "50%",
              opacity: 0.08,
            }}
          />
          <span style={styles.statLabel}>All Time</span>
          <div style={styles.statMainValue}>
            {statsAllTime.systolic}/{statsAllTime.diastolic}
          </div>
          <div style={styles.statSecondary}>
            {statsAllTime.pulse > 0 && (
              <span style={styles.statSubValue}>
                Avg Pulse: {statsAllTime.pulse} bpm
              </span>
            )}
            <span style={styles.statSubValue}>
              {statsAllTime.count} total readings
            </span>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Export Data</h2>
        </div>
        <div style={styles.exportSection}>
          <p style={styles.exportDescription}>
            Export your blood pressure readings as a CSV file for use with
            spreadsheet software or sharing with your healthcare provider.
          </p>

          <div style={styles.dateFilters}>
            <div style={styles.dateGroup}>
              <label htmlFor="startDate" style={styles.dateLabel}>
                Start Date (Optional)
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.dateGroup}>
              <label htmlFor="endDate" style={styles.dateLabel}>
                End Date (Optional)
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>

            <div style={styles.dateFilterActions}>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  style={styles.clearButton}
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>

          <button onClick={handleExport} style={styles.exportButton}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Download size={18} />
              Download CSV
              {(startDate || endDate) && (
                <span style={styles.exportButtonSubtext}>
                  ({startDate || "start"} to {endDate || "end"})
                </span>
              )}
            </span>
          </button>

          <div style={styles.exportInfo}>
            <p style={styles.exportInfoText}>
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Lightbulb size={16} />
                The CSV file will include: Date, Time, Systolic, Diastolic,
                Pulse, Body Position, and Notes
              </span>
            </p>
          </div>
        </div>
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
    color: "#0a0a0a",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#737373",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #f0f0f0",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
    background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
    position: "relative",
  },
  cardHeader: {
    padding: "20px",
    borderBottom: "1px solid #f5f5f5",
    backgroundColor: "transparent",
  },
  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "600",
    color: "#0a0a0a",
    letterSpacing: "-0.01em",
  },
  latestReading: {
    padding: "32px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
  },
  latestBP: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  latestValue: {
    fontSize: "42px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  latestLabel: {
    fontSize: "13px",
    color: "#a3a3a3",
  },
  categoryBadge: {
    padding: "16px 24px",
    borderRadius: "14px",
    border: "1px solid",
    textAlign: "center",
    width: "100%",
  },
  categoryLabel: {
    fontSize: "15px",
    fontWeight: "600",
    display: "block",
    marginBottom: "6px",
  },
  categoryMessage: {
    margin: 0,
    fontSize: "13px",
    opacity: 0.8,
  },
  statsGrid: {
    padding: "20px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  statBox: {
    padding: "20px",
    backgroundColor: "#fafafa",
    borderRadius: "14px",
    border: "1px solid #f5f5f5",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statMainValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#0a0a0a",
    lineHeight: "1",
  },
  statSecondary: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statSubValue: {
    fontSize: "13px",
    color: "#737373",
  },
  exportSection: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  exportDescription: {
    fontSize: "14px",
    color: "#737373",
    margin: 0,
    lineHeight: "1.6",
  },
  dateFilters: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  dateGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  dateLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#525252",
  },
  dateInput: {
    padding: "14px 16px",
    fontSize: "16px",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    outline: "none",
    backgroundColor: "#fafafa",
  },
  dateFilterActions: {
    display: "none",
  },
  clearButton: {
    display: "none",
  },
  exportButton: {
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    boxShadow: "0 4px 12px rgba(107, 124, 245, 0.25)",
  },
  exportButtonSubtext: {
    fontSize: "12px",
    fontWeight: "400",
    opacity: 0.8,
  },
  exportInfo: {
    padding: "16px",
    backgroundColor: "#fafafa",
    borderRadius: "12px",
    border: "1px solid #f5f5f5",
  },
  exportInfoText: {
    margin: 0,
    fontSize: "13px",
    color: "#737373",
    lineHeight: "1.6",
  },
  emptyState: {
    padding: "60px 24px",
    textAlign: "center",
  },
  emptyIcon: {
    marginBottom: "16px",
    display: "flex",
    justifyContent: "center",
  },
  emptyTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  emptyText: {
    margin: 0,
    fontSize: "14px",
    color: "#a3a3a3",
  },
  latestHeaderInfo: {
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    alignItems: "center",
    color: "#737373",
    fontSize: "13px",
  },
  latestHeaderDate: {
    display: "flex",
    flexDirection: "row",
    gap: "4px",
    alignItems: "center",
  },
  latestHeaderTime: {
    display: "flex",
    flexDirection: "row",
    gap: "4px",
    alignItems: "center",
  },
  latestMainSection: {
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    alignItems: "center",
  },
  bpNumbersRow: {
    display: "flex",
    flexDirection: "row",
    gap: "4px",
    alignItems: "center",
  },
  bpDivider: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  latestInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "16px",
  },
  latestInfoItem: {
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    alignItems: "center",
  },
  latestInfoIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
  },
  latestInfoText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  latestInfoLabel: {
    fontSize: "13px",
    color: "#737373",
  },
  latestInfoValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  categoryMessageBox: {
    padding: "16px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    alignItems: "center",
    marginTop: "16px",
  },
  latestNote: {
    marginTop: "16px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  latestNoteLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  latestNoteText: {
    margin: 0,
    fontSize: "14px",
    color: "#737373",
    lineHeight: "1.6",
  },
};
