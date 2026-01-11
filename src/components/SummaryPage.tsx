import React, { useState } from "react";
import { Reading } from "../App";
import { getBPCategory } from "../utils/bp";
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
              padding: "12px",
            }}
          >
            <h2 style={{ ...styles.cardTitle, fontSize: "14px" }}>
              Latest Reading
            </h2>
            <div style={styles.latestHeaderInfo}>
              <span style={styles.latestHeaderDate}>
                <Calendar size={12} />
                {formatDisplayDate(lastReading.timestamp)}
              </span>
              <span style={styles.latestHeaderTime}>
                <Clock size={12} />
                {formatDisplayTime(lastReading.timestamp)}
              </span>
            </div>
          </div>
          <div
            style={{
              ...styles.latestReading,
              background: `linear-gradient(180deg, ${category.color}03 0%, transparent 100%)`,
              padding: "20px",
              gap: "8px",
            }}
          >
            {/* BP Reading, Heart Rate and Position in Same Row */}
            <div style={styles.readingRow}>
              {/* Main BP Display */}
              <div style={{ ...styles.latestBP, gap: "2px" }}>
                <div style={styles.bpNumbersRow}>
                  <span
                    style={{
                      ...styles.latestValue,
                      color: category.color,
                      fontSize: "20px",
                    }}
                  >
                    {lastReading.systolic}
                  </span>
                  <span style={{ ...styles.bpDivider, fontSize: "20px" }}>
                    /
                  </span>
                  <span
                    style={{
                      ...styles.latestValue,
                      color: category.color,
                      fontSize: "20px",
                    }}
                  >
                    {lastReading.diastolic}
                  </span>
                </div>
                <span style={styles.latestLabel}>mmHg</span>
              </div>

              {/* Heart Rate */}
              {lastReading.pulse && (
                <div style={styles.readingRowItem}>
                  <div
                    style={{
                      ...styles.latestInfoIcon,
                      width: "24px",
                      height: "24px",
                    }}
                  >
                    <Heart size={12} color="#ec4899" />
                  </div>
                  <div style={styles.latestInfoText}>
                    <span
                      style={{ ...styles.latestInfoLabel, fontSize: "11px" }}
                    >
                      Pulse
                    </span>
                    <span
                      style={{ ...styles.latestInfoValue, fontSize: "13px" }}
                    >
                      {lastReading.pulse} bpm
                    </span>
                  </div>
                </div>
              )}

              {/* Position */}
              <div style={styles.readingRowItem}>
                <div
                  style={{
                    ...styles.latestInfoIcon,
                    width: "24px",
                    height: "24px",
                  }}
                >
                  {lastReading.bodyPosition === "seated" && (
                    <Armchair size={12} color="#6366f1" />
                  )}
                  {lastReading.bodyPosition === "leaning" && (
                    <User size={12} color="#6366f1" />
                  )}
                  {lastReading.bodyPosition === "laying" && (
                    <Bed size={12} color="#6366f1" />
                  )}
                </div>
                <div style={styles.latestInfoText}>
                  <span style={{ ...styles.latestInfoLabel, fontSize: "11px" }}>
                    Position
                  </span>
                  <span style={{ ...styles.latestInfoValue, fontSize: "13px" }}>
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
                padding: "6px 8px",
                marginTop: "2px",
              }}
            >
              <Lightbulb size={12} color={category.color} />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span
                  style={{
                    ...styles.categoryLabel,
                    color: category.color,
                    fontSize: "11px",
                    margin: 0,
                  }}
                >
                  {category.label}
                </span>
                <p
                  style={{
                    ...styles.categoryMessage,
                    color: category.color,
                    fontSize: "11px",
                    margin: 0,
                  }}
                >
                  {category.message}
                </p>
              </div>
            </div>

            {/* Note if exists */}
            {lastReading.note && (
              <div
                style={{
                  ...styles.latestNote,
                  padding: "5px",
                  marginTop: "2px",
                }}
              >
                <span style={{ ...styles.latestNoteLabel, fontSize: "11px" }}>
                  Note:
                </span>
                <p style={{ ...styles.latestNoteText, fontSize: "12px" }}>
                  {lastReading.note}
                </p>
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
      <div style={{ ...styles.card, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            background: "linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)",
            borderRadius: "50%",
            opacity: 0.08,
          }}
        />
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Export Data</h2>
        </div>
        <div style={styles.exportSection}>
          <p style={styles.exportDescription}>
            Export your readings as CSV for your healthcare provider.
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
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
    background: "linear-gradient(135deg, #ffffff 0%, #f9fafc 100%)",
    position: "relative",
  },
  cardHeader: {
    padding: "20px",
    borderBottom: "1px solid var(--border)",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "600",
    color: "var(--text-strong)",
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
    color: "var(--text-strong)",
  },
  latestLabel: {
    fontSize: "13px",
    color: "var(--muted)",
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
    padding: "0px",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  statBox: {
    padding: "20px",
    backgroundColor: "var(--surface)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "var(--shadow-sm)",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statMainValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: "var(--text-strong)",
    lineHeight: "1",
  },
  statSecondary: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statSubValue: {
    fontSize: "13px",
    color: "var(--muted)",
  },
  exportSection: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  exportDescription: {
    fontSize: "13px",
    color: "var(--muted)",
    margin: 0,
    lineHeight: "1.5",
  },
  dateFilters: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  dateGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  dateLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--muted)",
  },
  dateInput: {
    padding: "12px 14px",
    fontSize: "14px",
    border: "1px solid var(--border-strong)",
    borderRadius: "12px",
    outline: "none",
    backgroundColor: "var(--surface-muted)",
  },
  dateFilterActions: {
    display: "none",
  },
  clearButton: {
    display: "none",
  },
  exportButton: {
    padding: "14px 20px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    boxShadow: "0 10px 24px rgba(91, 108, 244, 0.25)",
  },
  exportButtonSubtext: {
    fontSize: "12px",
    fontWeight: "400",
    opacity: 0.8,
  },
  exportInfo: {
    padding: "16px",
    backgroundColor: "var(--surface-muted)",
    borderRadius: "12px",
    border: "1px solid var(--border)",
  },
  exportInfoText: {
    margin: 0,
    fontSize: "13px",
    color: "var(--muted)",
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
    color: "var(--text-strong)",
  },
  emptyText: {
    margin: 0,
    fontSize: "14px",
    color: "var(--muted)",
  },
  latestHeaderInfo: {
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    alignItems: "center",
    color: "var(--muted)",
    fontSize: "11px",
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
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflowWrap: "break-word",
  },
  latestNoteLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  readingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    width: "100%",
  },
  readingRowItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};
