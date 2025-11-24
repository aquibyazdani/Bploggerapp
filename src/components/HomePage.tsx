import React, { useState } from "react";
import { Reading } from "../App";
import { ReadingForm } from "./ReadingForm";
import { ReadingsList } from "./ReadingsList";
import { Plus, X } from "lucide-react";

interface HomePageProps {
  readings: Reading[];
  setReadings: React.Dispatch<React.SetStateAction<Reading[]>>;
}

export function HomePage({ readings, setReadings }: HomePageProps) {
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddReading = (reading: Reading) => {
    setReadings([reading, ...readings]);
    setShowForm(false);
  };

  const handleUpdateReading = (updatedReading: Reading) => {
    setReadings(
      readings.map((r) => (r.id === updatedReading.id ? updatedReading : r))
    );
    setEditingReading(null);
    setShowForm(false);
  };

  const handleDeleteReading = (id: string) => {
    if (window.confirm("Are you sure you want to delete this reading?")) {
      setReadings(readings.filter((r) => r.id !== id));
      if (editingReading?.id === id) {
        setEditingReading(null);
        setShowForm(false);
      }
    }
  };

  const handleEdit = (reading: Reading) => {
    setEditingReading(reading);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
    setShowForm(false);
  };

  const handleAddClick = () => {
    setEditingReading(null);
    setShowForm(!showForm);
    if (!showForm) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Blood Pressure Readings</h1>
          <p style={styles.subtitle}>
            Track and monitor your blood pressure over time
          </p>
        </div>
      </div>

      {showForm && (
        <ReadingForm
          onSubmit={editingReading ? handleUpdateReading : handleAddReading}
          editingReading={editingReading}
          onCancel={handleCancelEdit}
        />
      )}

      <ReadingsList
        readings={readings}
        onEdit={handleEdit}
        onDelete={handleDeleteReading}
        editingId={editingReading?.id}
      />

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
  addButton: {
    display: "none",
  },
  fab: {
    position: "fixed",
    bottom: "120px", // Adjusted from 90px to account for branding footer
    right: "50%",
    transform: "translateX(calc(215px - 32px))",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)",
    color: "#ffffff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(107, 124, 245, 0.4)",
    zIndex: 45,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
};
