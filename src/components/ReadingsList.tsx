import React from "react";
import { Reading } from "../App";
import {
  Pencil,
  Trash2,
  Heart,
  Armchair,
  User,
  Bed,
  BarChart2,
} from "lucide-react";

interface ReadingsListProps {
  readings: Reading[];
  onEdit: (reading: Reading) => void;
  onDelete: (id: string) => void;
  editingId?: string;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);
  return `${day} ${month}, ${year}`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPositionIcon(position: string): React.ReactNode {
  switch (position) {
    case "seated":
      return <Armchair size={16} />;
    case "leaning":
      return <User size={16} />;
    case "laying":
      return <Bed size={16} />;
    default:
      return "📍";
  }
}

function getPositionLabel(position: string): string {
  return position.charAt(0).toUpperCase() + position.slice(1);
}

function getBPCategory(
  systolic: number,
  diastolic: number
): { label: string; color: string } {
  if (systolic < 120 && diastolic < 80) {
    return { label: "Normal", color: "#10b981" };
  } else if (systolic < 130 && diastolic < 80) {
    return { label: "Elevated", color: "#f59e0b" };
  } else if (systolic < 140 || diastolic < 90) {
    return { label: "High BP", color: "#ef4444" };
  } else if (systolic < 180 || diastolic < 120) {
    return { label: "High BP", color: "#dc2626" };
  } else {
    return { label: "Crisis", color: "#991b1b" };
  }
}

export function ReadingsList({
  readings,
  onEdit,
  onDelete,
  editingId,
}: ReadingsListProps) {
  if (readings.length === 0) {
    return (
      <div style={styles.emptyCard}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <BarChart2 size={56} color="#d4d4d4" strokeWidth={1.5} />
          </div>
          <h3 style={styles.emptyTitle}>No readings yet</h3>
          <p style={styles.emptyText}>
            Tap the + button below to add your first blood pressure reading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Recent Readings</h2>
        <span style={styles.badge}>{readings.length}</span>
      </div>

      <div style={styles.cardsContainer}>
        {readings.map((reading) => {
          const category = getBPCategory(reading.systolic, reading.diastolic);
          const isEditing = editingId === reading._id;

          return (
            <div
              key={reading._id}
              style={{
                ...styles.card,
                padding: "5px",
                ...(isEditing ? styles.cardEditing : {}),
              }}
            >
              {/* Compact Header */}
              <div style={styles.cardHeader}>
                <div style={styles.dateTimeSection}>
                  <span style={styles.dateText}>
                    {formatDate(reading.timestamp)}
                  </span>
                  <span style={styles.timeText}>
                    {formatTime(reading.timestamp)}
                  </span>
                </div>
                <div style={styles.actionsSection}>
                  <button
                    onClick={() => onEdit(reading)}
                    style={styles.iconButton}
                    aria-label="Edit reading"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(reading._id)}
                    style={styles.iconButtonDelete}
                    aria-label="Delete reading"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Compact Body */}
              <div style={styles.cardBody}>
                {/* BP Reading with Info */}
                <div style={styles.bpSection}>
                  <div style={styles.bpValues}>
                    <span style={styles.bpNumber}>{reading.systolic}</span>
                    <span style={styles.bpSlash}>/</span>
                    <span style={styles.bpNumber}>{reading.diastolic}</span>
                    <span style={styles.bpUnit}>mmHg</span>
                  </div>

                  {/* Heart Rate and Position in Middle */}
                  <div style={styles.infoSection}>
                    {reading.pulse && (
                      <div style={styles.infoItem}>
                        <Heart size={12} color="#ec4899" />
                        <span style={styles.infoText}>{reading.pulse}</span>
                      </div>
                    )}
                    <div style={styles.infoItem}>
                      {getPositionIcon(reading.bodyPosition)}
                      <span style={styles.infoText}>
                        {getPositionLabel(reading.bodyPosition)}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      ...styles.categoryBadge,
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {category.label}
                  </span>
                </div>

                {/* Note */}
                {reading.note && (
                  <div style={styles.noteSection}>
                    <span style={styles.noteLabel}>Note:</span>
                    <span style={styles.noteText}>{reading.note}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  headerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#0a0a0a",
    letterSpacing: "-0.01em",
  },
  badge: {
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7CF5",
    backgroundColor: "#f0f0ff",
    borderRadius: "8px",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #f0f0f0",
    overflow: "hidden",
    transition: "all 0.2s",
  },
  cardEditing: {
    backgroundColor: "#f0f0ff",
    borderLeft: "3px solid #6B7CF5",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 8px 6px 8px",
  },
  dateTimeSection: {
    display: "flex",
    flexDirection: "row",
    gap: "6px",
    alignItems: "baseline",
  },
  dateText: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  timeText: {
    fontSize: "10px",
    color: "#a3a3a3",
  },
  actionsSection: {
    display: "flex",
    gap: "2px",
  },
  iconButton: {
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#525252",
    backgroundColor: "transparent",
    border: "1px solid #e5e5e5",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  iconButtonDelete: {
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ef4444",
    backgroundColor: "transparent",
    border: "1px solid #fecaca",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  cardBody: {
    padding: "6px 8px 8px 8px",
  },
  bpSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  bpValues: {
    display: "flex",
    alignItems: "baseline",
    gap: "2px",
  },
  bpNumber: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0a0a0a",
    lineHeight: "1",
  },
  bpSlash: {
    fontSize: "14px",
    fontWeight: "300",
    color: "#d4d4d4",
  },
  bpUnit: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#a3a3a3",
    marginLeft: "2px",
  },
  categoryBadge: {
    padding: "2px 6px",
    fontSize: "9px",
    fontWeight: "600",
    borderRadius: "6px",
    textAlign: "center",
  },
  infoSection: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },
  infoText: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#525252",
  },
  noteSection: {
    backgroundColor: "#fefce8",
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #fde047",
    display: "flex",
    gap: "4px",
  },
  noteLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#92400e",
    flexShrink: 0,
  },
  noteText: {
    fontSize: "10px",
    color: "#92400e",
    lineHeight: "1.3",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #f0f0f0",
    overflow: "hidden",
    boxShadow:
      "0 2px 12px rgba(107, 124, 245, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)",
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
    lineHeight: "1.5",
  },
};
