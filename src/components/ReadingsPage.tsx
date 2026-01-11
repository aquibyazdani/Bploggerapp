import React, { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { Reading } from "../App";
import { ReadingsList } from "./ReadingsList";
import { ReadingForm } from "./ReadingForm";

interface ReadingsPageProps {
  readings: Reading[];
  onAdd: (reading: Omit<Reading, "_id" | "timestamp">) => void;
  onEdit: (reading: Reading) => void;
  onUpdate: (reading: Reading) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
  editingReading: Reading | null;
  showFormInitial?: boolean;
  loading?: boolean;
}

export function ReadingsPage({
  readings,
  onAdd,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
  editingReading,
  showFormInitial = false,
  loading = false,
}: ReadingsPageProps) {
  const [showForm, setShowForm] = useState(showFormInitial);

  // Update showForm when showFormInitial changes
  useEffect(() => {
    setShowForm(showFormInitial);
  }, [showFormInitial]);

  const handleEdit = (reading: Reading) => {
    setShowForm(true);
    onEdit(reading);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (reading: Reading) => {
    if (editingReading) {
      onUpdate(reading);
    } else {
      onAdd(reading);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    onCancelEdit();
    setShowForm(false);
  };

  return (
    <div style={styles.container}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingCard}>
            <Activity size={18} style={styles.loadingIcon} />
            <span style={styles.loadingText}>Loading readings...</span>
          </div>
        </div>
      )}
      {showForm && (
        <ReadingForm
          onSubmit={handleSubmit}
          editingReading={editingReading}
          onCancel={handleCancel}
        />
      )}

      {!showForm && (
        <ReadingsList
          readings={readings}
          onEdit={handleEdit}
          onDelete={onDelete}
          editingId={editingReading?._id}
        />
      )}

    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    paddingBottom: "20px",
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "24px",
    zIndex: 10,
  },
  loadingCard: {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "999px",
    padding: "8px 14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "var(--shadow-sm)",
  },
  loadingIcon: {
    color: "var(--primary)",
  },
  loadingText: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-strong)",
  },
};
