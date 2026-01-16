import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Reading } from "../App";
import { getBPCategory, getBPBreakdown } from "../utils/bp";
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
  userName?: string;
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

function formatTimeIST(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
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

function downloadPDF(
  readings: Reading[],
  startDate?: string,
  endDate?: string,
  patientName?: string
) {
  let filteredReadings = readings;
  if (startDate || endDate) {
    filteredReadings = readings.filter((r) => {
      const readingDate = formatDate(r.timestamp);
      if (startDate && readingDate < startDate) return false;
      if (endDate && readingDate > endDate) return false;
      return true;
    });
  }

  const sortedReadings = [...filteredReadings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (sortedReadings.length === 0) {
    alert("No readings available for the selected date range.");
    return;
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const title = "BP Tracker Readings";
  const dateStr = formatDate(new Date().toISOString());
  const rangeStr =
    startDate || endDate ? ` (${startDate || "start"} to ${endDate || "end"})` : "";

  const toRgb = (hex: string) => {
    const normalized = hex.replace("#", "");
    if (normalized.length !== 6) return { r: 91, g: 108, b: 244 };
    const num = parseInt(normalized, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const mix = (color: string, target: string, weight: number) => {
    const a = toRgb(color);
    const b = toRgb(target);
    const clamp = (val: number) => Math.min(255, Math.max(0, val));
    const toHex = (val: number) => clamp(val).toString(16).padStart(2, "0");
    const r = Math.round(a.r * (1 - weight) + b.r * weight);
    const g = Math.round(a.g * (1 - weight) + b.g * weight);
    const bVal = Math.round(a.b * (1 - weight) + b.b * weight);
    return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
  };

  const rootStyles = getComputedStyle(document.documentElement);
  const primary = rootStyles.getPropertyValue("--primary").trim() || "#5b6cf4";
  const primaryStrong =
    rootStyles.getPropertyValue("--primary-strong").trim() || "#4555f3";
  const primarySoft = mix(primary, "#ffffff", 0.86);
  const primaryStroke = mix(primary, "#000000", 0.2);
  const rowBorder = mix(primary, "#ffffff", 0.9);
  const chartPrimary = primaryStrong || primary;
  const chartSecondary = mix(primary, "#ffffff", 0.35);
  const primarySoftRgb = toRgb(primarySoft);
  const primaryStrokeRgb = toRgb(primaryStroke);
  const rowBorderRgb = toRgb(rowBorder);

  const titleRgb = toRgb(primaryStrong);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(titleRgb.r, titleRgb.g, titleRgb.b);
  doc.text(title, 40, 40);
  doc.setDrawColor(titleRgb.r, titleRgb.g, titleRgb.b);
  doc.setLineWidth(2);
  doc.line(40, 46, 140, 46);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Exported: ${dateStr}${rangeStr}`, 40, 60);
  if (patientName) {
    doc.setTextColor(70);
    doc.text(`Patient: ${patientName}`, 40, 76);
  }

  const headers = ["Date", "Time", "Sys", "Dia", "Pulse", "Pos", "Note"];
  const columns = [40, 120, 190, 235, 290, 350, 420];
  const maxNoteLength = 32;

  let y = 90;

  const drawTableHeader = (rowY: number) => {
    doc.setTextColor(12);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(primarySoftRgb.r, primarySoftRgb.g, primarySoftRgb.b);
    doc.setDrawColor(primaryStrokeRgb.r, primaryStrokeRgb.g, primaryStrokeRgb.b);
    doc.setLineWidth(0.8);
    doc.roundedRect(40, rowY - 14, pageWidth - 80, 22, 6, 6, "FD");
    headers.forEach((header, idx) => {
      doc.text(header, columns[idx], rowY);
    });
  };

  const avgValue = (key: "systolic" | "diastolic") =>
    Math.round(
      sortedReadings.reduce((sum, reading) => sum + reading[key], 0) /
        sortedReadings.length
    );

  const avgSystolic = avgValue("systolic");
  const avgDiastolic = avgValue("diastolic");
  const highestReading = sortedReadings.reduce((max, reading) =>
    reading.systolic > max.systolic ? reading : max
  );
  const lowestReading = sortedReadings.reduce((min, reading) =>
    reading.systolic < min.systolic ? reading : min
  );

  const summaryNotes = [
    `Total readings: ${sortedReadings.length}`,
    `Average BP: ${avgSystolic}/${avgDiastolic} mmHg`,
    `Highest reading: ${highestReading.systolic}/${highestReading.diastolic} mmHg`,
    `Lowest reading: ${lowestReading.systolic}/${lowestReading.diastolic} mmHg`,
  ];

  const chartCanvas = document.createElement("canvas");
  chartCanvas.width = 620;
  chartCanvas.height = 200;
  const chartCtx = chartCanvas.getContext("2d");

  if (chartCtx) {
    chartCtx.fillStyle = "#ffffff";
    chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = chartCanvas.width - padding.left - padding.right;
    const height = chartCanvas.height - padding.top - padding.bottom;

    const systolicValues = sortedReadings.map((reading) => reading.systolic);
    const diastolicValues = sortedReadings.map((reading) => reading.diastolic);
    const minValue = Math.min(...diastolicValues) - 5;
    const maxValue = Math.max(...systolicValues) + 5;

    const toX = (index: number) =>
      padding.left + (width * index) / Math.max(1, sortedReadings.length - 1);
    const toY = (value: number) =>
      padding.top + height - ((value - minValue) / (maxValue - minValue)) * height;

    chartCtx.strokeStyle = "#e2e8f0";
    chartCtx.lineWidth = 1;
    chartCtx.beginPath();
    chartCtx.moveTo(padding.left, padding.top);
    chartCtx.lineTo(padding.left, padding.top + height);
    chartCtx.lineTo(padding.left + width, padding.top + height);
    chartCtx.stroke();

    chartCtx.fillStyle = "#64748b";
    chartCtx.font = "10px Helvetica";
    const yLabels = 4;
    for (let i = 0; i <= yLabels; i += 1) {
      const value = Math.round(minValue + ((maxValue - minValue) / yLabels) * i);
      const yPos = toY(value);
      chartCtx.fillText(String(value), 8, yPos + 3);
      chartCtx.strokeStyle = "#f1f5f9";
      chartCtx.beginPath();
      chartCtx.moveTo(padding.left, yPos);
      chartCtx.lineTo(padding.left + width, yPos);
      chartCtx.stroke();
    }

    const xStep = Math.max(1, Math.floor(sortedReadings.length / 5));
    sortedReadings.forEach((reading, index) => {
      if (index % xStep !== 0 && index !== sortedReadings.length - 1) return;
      const x = toX(index);
      const dateLabel = formatDate(reading.timestamp);
      chartCtx.fillText(dateLabel, x - 16, padding.top + height + 16);
    });

    chartCtx.fillStyle = "#94a3b8";
    chartCtx.fillText("Date", padding.left + width - 24, padding.top + height + 28);
    chartCtx.save();
    chartCtx.translate(14, padding.top + height / 2);
    chartCtx.rotate(-Math.PI / 2);
    chartCtx.fillText("mmHg", 0, 0);
    chartCtx.restore();

    const drawLine = (values: number[], color: string) => {
      chartCtx.strokeStyle = color;
      chartCtx.lineWidth = 2;
      chartCtx.beginPath();
      values.forEach((value, index) => {
        const x = toX(index);
        const yPos = toY(value);
        if (index === 0) {
          chartCtx.moveTo(x, yPos);
        } else {
          chartCtx.lineTo(x, yPos);
        }
      });
      chartCtx.stroke();
    };

    drawLine(systolicValues, chartPrimary);
    drawLine(diastolicValues, chartSecondary);

    chartCtx.fillStyle = chartPrimary;
    chartCtx.fillText("Systolic", padding.left + 10, padding.top + 12);
    chartCtx.fillStyle = chartSecondary;
    chartCtx.fillText("Diastolic", padding.left + 90, padding.top + 12);
  }

  const chartDataUrl = chartCanvas.toDataURL("image/png");
  doc.addImage(chartDataUrl, "PNG", 40, y, pageWidth - 80, 150);
  y += 174;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(24);
  doc.text("Summary Notes", 40, y);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setDrawColor(primaryStrokeRgb.r, primaryStrokeRgb.g, primaryStrokeRgb.b);
  doc.setFillColor(primarySoftRgb.r, primarySoftRgb.g, primarySoftRgb.b);
  const notesBoxHeight = summaryNotes.length * 16 + 22;
  doc.roundedRect(40, y, pageWidth - 80, notesBoxHeight, 10, 10, "FD");
  summaryNotes.forEach((note, index) => {
    doc.text(note, 56, y + 22 + index * 16);
  });
  y += notesBoxHeight + 18;

  drawTableHeader(y);
  y += 24;
  doc.setFont("helvetica", "normal");
  sortedReadings.forEach((reading) => {
    if (y > pageHeight - 72) {
      doc.addPage();
      y = 40;
      drawTableHeader(y);
      y += 24;
      doc.setFont("helvetica", "normal");
    }

    const note = reading.note
      ? reading.note.length > maxNoteLength
        ? `${reading.note.slice(0, maxNoteLength)}...`
        : reading.note
      : "";

    const row = [
      formatDate(reading.timestamp),
      formatTimeIST(reading.timestamp),
      String(reading.systolic),
      String(reading.diastolic),
      reading.pulse ? String(reading.pulse) : "-",
      reading.bodyPosition,
      note,
    ];

    doc.setDrawColor(rowBorderRgb.r, rowBorderRgb.g, rowBorderRgb.b);
    doc.rect(40, y - 14, pageWidth - 80, 22);
    row.forEach((value, idx) => {
      doc.text(value, columns[idx], y);
    });

    y += 22;
  });

  const fileRange =
    startDate || endDate ? `_${startDate || "start"}_to_${endDate || "end"}` : "";
  doc.save(`bp-readings-${dateStr}${fileRange}.pdf`);
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

export function SummaryPage({ readings, userName }: SummaryPageProps) {
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
  const breakdown = lastReading
    ? getBPBreakdown(lastReading.systolic, lastReading.diastolic)
    : null;

  const handleExport = () => {
    downloadPDF(readings, startDate, endDate, userName);
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
                <span style={styles.categoryLabelRow}>
                  {breakdown && (
                    <>
                      <span style={styles.categoryGroup}>
                        <span
                          style={{
                            ...styles.categoryDot,
                            backgroundColor: breakdown.systolic.color,
                          }}
                        />
                        <span
                          style={{
                            ...styles.categoryLabel,
                            color: breakdown.systolic.color,
                            margin: 0,
                            display: "inline",
                          }}
                        >
                          S: {breakdown.systolic.shortLabel}
                        </span>
                      </span>
                      <span style={styles.categoryDivider}>|</span>
                      <span style={styles.categoryGroup}>
                        <span
                          style={{
                            ...styles.categoryDot,
                            backgroundColor: breakdown.diastolic.color,
                          }}
                        />
                        <span
                          style={{
                            ...styles.categoryLabel,
                            color: breakdown.diastolic.color,
                            margin: 0,
                            display: "inline",
                          }}
                        >
                          D: {breakdown.diastolic.shortLabel}
                        </span>
                      </span>
                    </>
                  )}
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
            Export a doctor-ready PDF with charts and summary notes.
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
              Download PDF
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
  categoryLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  categoryGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  categoryDot: {
    width: "6px",
    height: "6px",
    borderRadius: "999px",
  },
  categoryDivider: {
    color: "var(--muted)",
    fontSize: "11px",
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
