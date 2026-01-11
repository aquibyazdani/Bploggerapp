import React, { useState, useEffect } from "react";
import { Reading } from "../App";
import { ReadingsList } from "./ReadingsList";
import { ReadingForm } from "./ReadingForm";
import { Plus } from "lucide-react";

interface ReadingsPageProps {
  readings: Reading[];
  onAdd: (reading: Omit<Reading, "_id" | "timestamp">) => void;
  onEdit: (reading: Reading) => void;
  onUpdate: (reading: Reading) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
  editingReading: Reading | null;
  showFormInitial?: boolean;
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
}: ReadingsPageProps) {
  const [showForm, setShowForm] = useState(showFormInitial);

  // Update showForm when showFormInitial changes
  useEffect(() => {
    setShowForm(showFormInitial);
  }, [showFormInitial]);

  const handleAddClick = () => {
    if (showForm && editingReading) {
      onCancelEdit();
    }
    setShowForm(!showForm);
    if (!showForm) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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

      {/* Floating Action Button */}
      <button
        onClick={handleAddClick}
        style={{
          ...styles.fab,
          transform: showForm
            ? "translateX(calc(215px - 32px)) rotate(45deg)"
            : "translateX(calc(215px - 32px))",
        }}
        aria-label={showForm ? "Close form" : "Add new reading"}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    paddingBottom: "20px",
  },
  fab: {
    position: "fixed",
    bottom: "90px",
    right: "50%",
    transform: "translateX(calc(215px - 32px))",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)",
    color: "#ffffff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(91, 108, 244, 0.35)",
    zIndex: 45,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: 0.8,
  },
};
