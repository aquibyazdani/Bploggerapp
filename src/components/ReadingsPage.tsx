import React, { useState, useEffect } from "react";
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

    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    paddingBottom: "20px",
  },
};
