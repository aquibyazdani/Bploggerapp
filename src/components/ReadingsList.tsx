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

      <div style={styles.tableCard}>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.headerCell}>Date/Time</th>
                <th style={styles.headerCell}>BP Reading</th>
                <th style={styles.headerCell}>Pulse</th>
                <th style={styles.headerCell}>Position</th>
                <th style={styles.headerCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => {
                const category = getBPCategory(
                  reading.systolic,
                  reading.diastolic
                );
                const isEditing = editingId === reading._id;

                return (
                  <React.Fragment key={reading._id}>
                    <tr
                      style={{
                        ...styles.dataRow,
                        ...(isEditing ? styles.dataRowEditing : {}),
                      }}
                    >
                      {/* Date/Time Column */}
                      <td style={styles.dataCell}>
                        <div style={styles.dateTimeCell}>
                          <span style={styles.dateText}>
                            {formatDate(reading.timestamp)}
                          </span>
                          <span style={styles.timeText}>
                            {formatTime(reading.timestamp)}
                          </span>
                        </div>
                      </td>

                      {/* BP Reading Column */}
                      <td style={styles.dataCell}>
                        <div style={styles.bpCell}>
                          <div style={styles.bpValues}>
                            <span style={styles.bpNumber}>
                              {reading.systolic}
                            </span>
                            <span style={styles.bpSlash}>/</span>
                            <span style={styles.bpNumber}>
                              {reading.diastolic}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Pulse Column */}
                      <td style={styles.dataCell}>
                        {reading.pulse ? (
                          <div style={styles.pulseCell}>
                            <Heart size={16} color="#ec4899" />
                            <span style={styles.pulseText}>
                              {reading.pulse}
                            </span>
                          </div>
                        ) : (
                          <span style={styles.emptyValue}>—</span>
                        )}
                      </td>

                      {/* Position Column */}
                      <td style={styles.dataCell}>
                        <div style={styles.positionCell}>
                          {getPositionIcon(reading.bodyPosition)}
                          <span style={styles.positionText}>
                            {getPositionLabel(reading.bodyPosition)}
                          </span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td style={styles.dataCell}>
                        <div style={styles.actionsCell}>
                          <button
                            onClick={() => onEdit(reading)}
                            style={styles.iconButton}
                            aria-label="Edit reading"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(reading._id)}
                            style={styles.iconButtonDelete}
                            aria-label="Delete reading"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Note Row (if exists) */}
                    {reading.note && (
                      <tr style={styles.noteRow}>
                        <td colSpan={5} style={styles.noteCell}>
                          <div style={styles.noteContent}>
                            <span style={styles.noteLabel}>Note:</span>
                            <span style={styles.noteText}>{reading.note}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  headerTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "600",
    color: "#0a0a0a",
    letterSpacing: "-0.01em",
  },
  badge: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6B7CF5",
    backgroundColor: "#f0f0ff",
    borderRadius: "12px",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #f0f0f0",
    overflow: "hidden",
    boxShadow:
      "0 2px 12px rgba(107, 124, 245, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    background: "linear-gradient(135deg, #f8f9ff 0%, #f0f0ff 100%)",
    borderBottom: "2px solid #e8e8f5",
  },
  headerCell: {
    padding: "16px 12px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "600",
    color: "#6B7CF5",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  dataRow: {
    borderBottom: "1px solid #f5f5f5",
    transition: "background-color 0.2s",
  },
  dataRowEditing: {
    backgroundColor: "#f0f0ff",
    borderLeft: "3px solid #6B7CF5",
  },
  dataCell: {
    padding: "16px 12px",
    verticalAlign: "middle",
  },
  dateTimeCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  dateText: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  timeText: {
    fontSize: "11px",
    color: "#a3a3a3",
  },
  bpCell: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  bpValues: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  bpNumber: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0a0a0a",
    lineHeight: "1",
  },
  bpSlash: {
    fontSize: "16px",
    fontWeight: "300",
    color: "#d4d4d4",
  },
  categoryBadge: {
    padding: "4px 8px",
    paddingLeft: "6px",
    fontSize: "10px",
    fontWeight: "600",
    borderRadius: "6px",
    width: "fit-content",
  },
  pulseCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  pulseText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0a0a0a",
  },
  emptyValue: {
    fontSize: "16px",
    color: "#d4d4d4",
  },
  positionCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#737373",
  },
  positionText: {
    fontSize: "13px",
    fontWeight: "500",
  },
  actionsCell: {
    display: "flex",
    gap: "6px",
  },
  iconButton: {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#525252",
    backgroundColor: "#fafafa",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  iconButtonDelete: {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ef4444",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  noteRow: {
    backgroundColor: "#fffbeb",
    borderBottom: "1px solid #f5f5f5",
  },
  noteCell: {
    padding: "12px 12px",
  },
  noteContent: {
    display: "flex",
    gap: "8px",
    fontSize: "13px",
  },
  noteLabel: {
    fontWeight: "600",
    color: "#92400e",
  },
  noteText: {
    color: "#78716c",
    lineHeight: "1.5",
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
