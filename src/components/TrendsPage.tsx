import React from "react";
import { Reading } from "../App";
import {
  TrendingUp,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Heart,
  Armchair,
  User,
  Bed,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { getBPCategory } from "../utils/bp";

interface TrendsPageProps {
  readings: Reading[];
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function calculateTrends(readings: Reading[]): {
  averageSystolic: number;
  averageDiastolic: number;
  averagePulse: number;
  highestSystolic: number;
  lowestSystolic: number;
  highestDiastolic: number;
  lowestDiastolic: number;
} {
  if (readings.length === 0) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      averagePulse: 0,
      highestSystolic: 0,
      lowestSystolic: 0,
      highestDiastolic: 0,
      lowestDiastolic: 0,
    };
  }

  const systolicValues = readings.map((r) => r.systolic);
  const diastolicValues = readings.map((r) => r.diastolic);
  const pulseValues = readings.filter((r) => r.pulse).map((r) => r.pulse!);

  return {
    averageSystolic: Math.round(
      systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
    ),
    averageDiastolic: Math.round(
      diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length
    ),
    averagePulse:
      pulseValues.length > 0
        ? Math.round(
            pulseValues.reduce((a, b) => a + b, 0) / pulseValues.length
          )
        : 0,
    highestSystolic: Math.max(...systolicValues),
    lowestSystolic: Math.min(...systolicValues),
    highestDiastolic: Math.max(...diastolicValues),
    lowestDiastolic: Math.min(...diastolicValues),
  };
}

function getBodyPositionStats(readings: Reading[]): {
  seated: number;
  leaning: number;
  laying: number;
} {
  return {
    seated: readings.filter((r) => r.bodyPosition === "seated").length,
    leaning: readings.filter((r) => r.bodyPosition === "leaning").length,
    laying: readings.filter((r) => r.bodyPosition === "laying").length,
  };
}

function getRollingAverage(values: number[], index: number, windowSize: number) {
  const start = Math.max(0, index - windowSize + 1);
  const slice = values.slice(start, index + 1);
  const total = slice.reduce((sum, val) => sum + val, 0);
  return Math.round(total / slice.length);
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; stroke: string; name?: string }[];
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div style={styles.tooltip}>
      <span style={styles.tooltipTitle}>{label}</span>
      <div style={styles.tooltipRows}>
        {payload.map((entry) => (
          <div key={entry.dataKey} style={styles.tooltipRow}>
            <span
              style={{
                ...styles.tooltipDot,
                backgroundColor: entry.stroke,
              }}
            />
            <span style={styles.tooltipLabel}>
              {entry.name || entry.dataKey}
            </span>
            <span style={styles.tooltipValue}>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function TrendsPage({ readings }: TrendsPageProps) {
  const trends = calculateTrends(readings);
  const positionStats = getBodyPositionStats(readings);
  const averageCategory =
    readings.length > 0
      ? getBPCategory(trends.averageSystolic, trends.averageDiastolic)
      : null;
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const systolicSeries = sortedReadings.map((reading) => reading.systolic);
  const diastolicSeries = sortedReadings.map((reading) => reading.diastolic);
  const chartData = sortedReadings.map((reading, index) => ({
    date: formatDate(reading.timestamp),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    systolicAvg: getRollingAverage(systolicSeries, index, 7),
    diastolicAvg: getRollingAverage(diastolicSeries, index, 7),
  }));

  if (readings.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Trends & Analysis</h1>
          <p style={styles.subtitle}>
            Visualize your blood pressure patterns over time
          </p>
        </div>
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <TrendingUp size={64} color="#94a3b8" />
            </div>
            <h3 style={styles.emptyTitle}>No data to display</h3>
            <p style={styles.emptyText}>
              Add some readings to see trends and patterns in your blood
              pressure
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Trends & Analysis</h1>
        <p style={styles.subtitle}>
          Visualize your blood pressure patterns over time
        </p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div
          style={{
            ...styles.statCard,
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
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              borderRadius: "50%",
              opacity: 0.08,
            }}
          />
          <div style={styles.statIcon}>
            <BarChart3 size={32} color="#3b82f6" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Average BP</span>
            <span style={styles.statValue}>
              {trends.averageSystolic}/{trends.averageDiastolic}
            </span>
            {averageCategory && (
              <span style={{ ...styles.statSubLabel, color: averageCategory.color }}>
                {averageCategory.label}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            ...styles.statCard,
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
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              borderRadius: "50%",
              opacity: 0.08,
            }}
          />
          <div style={styles.statIcon}>
            <ArrowUp size={32} color="#ef4444" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Highest Reading</span>
            <span style={styles.statValue}>
              {trends.highestSystolic}/{trends.highestDiastolic}
            </span>
          </div>
        </div>

        <div
          style={{
            ...styles.statCard,
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
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              borderRadius: "50%",
              opacity: 0.08,
            }}
          />
          <div style={styles.statIcon}>
            <ArrowDown size={32} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Lowest Reading</span>
            <span style={styles.statValue}>
              {trends.lowestSystolic}/{trends.lowestDiastolic}
            </span>
          </div>
        </div>

        <div
          style={{
            ...styles.statCard,
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
              background: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
              borderRadius: "50%",
              opacity: 0.08,
            }}
          />
          <div style={styles.statIcon}>
            <Heart size={32} color="#ec4899" />
          </div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Average Pulse</span>
            <span style={styles.statValue}>
              {trends.averagePulse > 0 ? `${trends.averagePulse} bpm` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>BP Trends</h2>
        </div>
        <div style={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                padding={{ left: 0, right: 0 }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: "var(--muted)" }}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                name="Diastolic"
              />
              <Line
                type="monotone"
                dataKey="systolicAvg"
                stroke="var(--primary-strong)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Systolic 7-read avg"
              />
              <Line
                type="monotone"
                dataKey="diastolicAvg"
                stroke="#0ea5e9"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Diastolic 7-read avg"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body Position Distribution */}
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
          <h2 style={styles.cardTitle}>Readings by Body Position</h2>
        </div>
        <div style={styles.positionStats}>
          <div style={styles.positionItem}>
            <div style={styles.positionIcon}>
              <Armchair size={32} color="#3b82f6" />
            </div>
            <div style={styles.positionContent}>
              <span style={styles.positionLabel}>Seated</span>
              <div style={styles.positionBar}>
                <div
                  style={{
                    ...styles.positionBarFill,
                    width: `${(positionStats.seated / readings.length) * 100}%`,
                    backgroundColor: "#3b82f6",
                  }}
                />
              </div>
              <span style={styles.positionCount}>
                {positionStats.seated} readings
              </span>
            </div>
          </div>

          <div style={styles.positionItem}>
            <div style={styles.positionIcon}>
              <User size={32} color="#8b5cf6" />
            </div>
            <div style={styles.positionContent}>
              <span style={styles.positionLabel}>Leaning</span>
              <div style={styles.positionBar}>
                <div
                  style={{
                    ...styles.positionBarFill,
                    width: `${
                      (positionStats.leaning / readings.length) * 100
                    }%`,
                    backgroundColor: "#8b5cf6",
                  }}
                />
              </div>
              <span style={styles.positionCount}>
                {positionStats.leaning} readings
              </span>
            </div>
          </div>

          <div style={styles.positionItem}>
            <div style={styles.positionIcon}>
              <Bed size={32} color="#06b6d4" />
            </div>
            <div style={styles.positionContent}>
              <span style={styles.positionLabel}>Laying Down</span>
              <div style={styles.positionBar}>
                <div
                  style={{
                    ...styles.positionBarFill,
                    width: `${(positionStats.laying / readings.length) * 100}%`,
                    backgroundColor: "#06b6d4",
                  }}
                />
              </div>
              <span style={styles.positionCount}>
                {positionStats.laying} readings
              </span>
            </div>
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
    color: "var(--text-strong)",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "var(--muted)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },
  statCard: {
    backgroundColor: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "var(--shadow-sm)",
    background: "linear-gradient(135deg, #ffffff 0%, #f9fafc 100%)",
    position: "relative",
    overflow: "hidden",
  },
  statIcon: {
    fontSize: "32px",
  },
  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--muted)",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--text-strong)",
  },
  statSubLabel: {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
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
    borderBottom: "1px solid #f5f5f5",
    backgroundColor: "transparent",
  },
  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "600",
    color: "var(--text-strong)",
    letterSpacing: "-0.01em",
  },
  chartContainer: {
    padding: "0 16px 12px 16px",
  },
  tooltip: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "10px 12px",
    boxShadow: "var(--shadow-sm)",
    color: "var(--text-strong)",
    fontSize: "12px",
  },
  tooltipTitle: {
    display: "block",
    fontWeight: "600",
    color: "var(--text-strong)",
    marginBottom: "6px",
  },
  tooltipRows: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  tooltipRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  tooltipDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
  },
  tooltipLabel: {
    flex: 1,
    color: "var(--muted)",
  },
  tooltipValue: {
    fontWeight: "600",
    color: "var(--text-strong)",
  },
  positionStats: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  positionItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  positionIcon: {
    fontSize: "28px",
  },
  positionContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  positionLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-strong)",
  },
  positionBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "var(--surface-muted)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  positionBarFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  positionCount: {
    fontSize: "12px",
    color: "var(--muted)",
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
};
