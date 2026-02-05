import React, { useState } from "react";
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
import { getBPCategory, getBPBreakdown } from "../utils/bp";

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

export function ReadingsList({
  readings,
  onEdit,
  onDelete,
  editingId,
}: ReadingsListProps) {
  const [pendingDelete, setPendingDelete] = useState<Reading | null>(null);

  const handleDeleteRequest = (reading: Reading) => {
    setPendingDelete(reading);
  };

  const handleDeleteConfirm = () => {
    if (pendingDelete) {
      onDelete(pendingDelete._id);
      setPendingDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setPendingDelete(null);
  };

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
        <h2 style={styles.headerTitle}>Readings</h2>
        <span style={styles.badge}>{readings.length}</span>
      </div>

      <div style={styles.cardsContainer}>
        {readings.map((reading) => {
          const category = getBPCategory(reading.systolic, reading.diastolic);
          const breakdown = getBPBreakdown(reading.systolic, reading.diastolic);
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
                    onClick={() => handleDeleteRequest(reading)}
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
                      backgroundColor: "var(--surface-muted)",
                    }}
                  >
                    <span style={styles.categoryGroup}>
                      <span
                        style={{
                          ...styles.categoryDot,
                          backgroundColor: breakdown.systolic.color,
                        }}
                      />
                      <span
                        style={{
                          ...styles.categoryText,
                          color: breakdown.systolic.color,
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
                          ...styles.categoryText,
                          color: breakdown.diastolic.color,
                        }}
                      >
                        D: {breakdown.diastolic.shortLabel}
                      </span>
                    </span>
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

      {pendingDelete && (
        <div style={styles.confirmOverlay} onClick={handleDeleteCancel}>
          <div style={styles.confirmCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.confirmTitle}>Delete reading?</h3>
            <p style={styles.confirmText}>
              This will permanently remove the reading from your history.
            </p>
            <div style={styles.confirmActions}>
              <button style={styles.confirmCancel} onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button
                style={styles.confirmDelete}
                onClick={handleDeleteConfirm}
              >
                Delete
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
    color: "var(--text-strong)",
    letterSpacing: "-0.01em",
    fontFamily: "var(--font-display)",
  },
  badge: {
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--primary)",
    backgroundColor: "var(--primary-soft)",
    borderRadius: "999px",
  },
  cardsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  card: {
    backgroundColor: "var(--surface)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    overflow: "hidden",
    transition: "all 0.2s",
    boxShadow: "var(--shadow-sm)",
  },
  cardEditing: {
    backgroundColor: "var(--surface-contrast)",
    borderLeft: "3px solid var(--primary)",
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
    color: "var(--text-strong)",
  },
  timeText: {
    fontSize: "10px",
    color: "var(--muted)",
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
    color: "var(--muted)",
    backgroundColor: "transparent",
    border: "1px solid var(--border-strong)",
    borderRadius: "8px",
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
    borderRadius: "8px",
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
    fontSize: "16.5px",
    fontWeight: "700",
    color: "var(--text-strong)",
    lineHeight: "1",
  },
  bpSlash: {
    fontSize: "14px",
    fontWeight: "300",
    color: "#cbd5f5",
  },
  bpUnit: {
    fontSize: "10px",
    fontWeight: "500",
    color: "var(--muted)",
    marginLeft: "2px",
  },
  categoryBadge: {
    padding: "2px 6px",
    fontSize: "9px",
    fontWeight: "600",
    borderRadius: "6px",
    textAlign: "center",
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
  categoryText: {
    fontSize: "9px",
    fontWeight: "600",
  },
  categoryDivider: {
    margin: "0 6px",
    color: "var(--muted)",
    fontSize: "9px",
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
    fontSize: "10px",
    fontWeight: "500",
    color: "var(--muted)",
  },
  noteSection: {
    backgroundColor: "#fff7ed",
    padding: "6px",
    borderRadius: "8px",
    border: "1px solid #fed7aa",
    display: "flex",
    gap: "4px",
  },
  noteLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#9a3412",
    flexShrink: 0,
  },
  noteText: {
    fontSize: "10px",
    color: "#9a3412",
    lineHeight: "1.3",
  },
  emptyCard: {
    backgroundColor: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
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
    lineHeight: "1.5",
  },
  confirmOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 80,
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
  confirmDelete: {
    flex: 1,
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(239, 68, 68, 0.25)",
  },
};
