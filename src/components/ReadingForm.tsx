import React, { useState, useEffect } from "react";
import { Reading } from "../App";
import { Plus, Save, X, Armchair, User, Bed } from "lucide-react";

interface ReadingFormProps {
  onSubmit: (reading: Reading) => void;
  editingReading: Reading | null;
  onCancel: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function ReadingForm({
  onSubmit,
  editingReading,
  onCancel,
}: ReadingFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [bodyPosition, setBodyPosition] = useState<
    "seated" | "leaning" | "laying"
  >("seated");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{
    systolic?: string;
    diastolic?: string;
  }>({});

  // Helper to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  // Helper to get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  useEffect(() => {
    if (editingReading) {
      const readingDate = new Date(editingReading.timestamp);
      setDate(readingDate.toISOString().split("T")[0]);
      setTime(readingDate.toTimeString().slice(0, 5));
      setSystolic(String(editingReading.systolic));
      setDiastolic(String(editingReading.diastolic));
      setPulse(editingReading.pulse ? String(editingReading.pulse) : "");
      setBodyPosition(editingReading.bodyPosition);
      setNote(editingReading.note || "");
    } else {
      clearForm();
    }
  }, [editingReading]);

  const clearForm = () => {
    setDate(getCurrentDate());
    setTime(getCurrentTime());
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setBodyPosition("seated");
    setNote("");
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { systolic?: string; diastolic?: string } = {};

    const systolicNum = Number(systolic);
    const diastolicNum = Number(diastolic);

    if (!systolic || systolicNum <= 0 || !Number.isInteger(systolicNum)) {
      newErrors.systolic = "Systolic must be a positive whole number";
    }

    if (!diastolic || diastolicNum <= 0 || !Number.isInteger(diastolicNum)) {
      newErrors.diastolic = "Diastolic must be a positive whole number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Combine date and time into ISO timestamp
    const timestamp = new Date(`${date}T${time}`).toISOString();

    const reading: Reading = {
      _id: editingReading?._id || generateId(),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      pulse: pulse ? Number(pulse) : undefined,
      bodyPosition,
      note: note.trim() || undefined,
      timestamp,
    };

    onSubmit(reading);
    if (!editingReading) {
      clearForm();
    }
  };

  const handleCancelClick = () => {
    clearForm();
    onCancel();
  };

  return (
    <div style={styles.card} className="form-slide-in">
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>
          {editingReading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Save size={20} />
              Edit Reading
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={20} />
              Add New Reading
            </span>
          )}
        </h2>
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          {/* Date */}
          <div style={styles.formGroup}>
            <label htmlFor="date" style={styles.label}>
              Date <span style={styles.required}>*</span>
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
              aria-required="true"
            />
          </div>

          {/* Time */}
          <div style={styles.formGroup}>
            <label htmlFor="time" style={styles.label}>
              Time <span style={styles.required}>*</span>
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={styles.input}
              aria-required="true"
            />
          </div>

          {/* Systolic */}
          <div style={styles.formGroup}>
            <label htmlFor="systolic" style={styles.label}>
              Systolic (mmHg) <span style={styles.required}>*</span>
            </label>
            <input
              id="systolic"
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              style={{
                ...styles.input,
                ...(errors.systolic ? styles.inputError : {}),
              }}
              placeholder="120"
              aria-required="true"
              aria-invalid={!!errors.systolic}
            />
            {errors.systolic && (
              <span style={styles.errorText}>{errors.systolic}</span>
            )}
          </div>

          {/* Diastolic */}
          <div style={styles.formGroup}>
            <label htmlFor="diastolic" style={styles.label}>
              Diastolic (mmHg) <span style={styles.required}>*</span>
            </label>
            <input
              id="diastolic"
              type="number"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              style={{
                ...styles.input,
                ...(errors.diastolic ? styles.inputError : {}),
              }}
              placeholder="80"
              aria-required="true"
              aria-invalid={!!errors.diastolic}
            />
            {errors.diastolic && (
              <span style={styles.errorText}>{errors.diastolic}</span>
            )}
          </div>

          {/* Pulse */}
          <div style={styles.formGroup}>
            <label htmlFor="pulse" style={styles.label}>
              Pulse (bpm)
            </label>
            <input
              id="pulse"
              type="number"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              style={styles.input}
              placeholder="72"
            />
          </div>

          {/* Body Position */}
          <div style={styles.formGroup}>
            <label htmlFor="bodyPosition" style={styles.label}>
              Body Position <span style={styles.required}>*</span>
            </label>
            <select
              id="bodyPosition"
              value={bodyPosition}
              onChange={(e) =>
                setBodyPosition(
                  e.target.value as "seated" | "leaning" | "laying"
                )
              }
              style={styles.select}
              aria-required="true"
            >
              <option value="seated">Seated</option>
              <option value="leaning">Leaning</option>
              <option value="laying">Laying Down</option>
            </select>
          </div>
        </div>

        {/* Note */}
        <div style={styles.formGroup}>
          <label htmlFor="note" style={styles.label}>
            Note
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={styles.textarea}
            placeholder="Add any relevant notes (e.g., after exercise, feeling stressed, etc.)"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button type="submit" style={styles.buttonPrimary}>
            {editingReading ? (
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Save size={16} />
                Save Changes
              </span>
            ) : (
              <span
                style={{
                  alignItems: "center",
                }}
              >
                Submit
              </span>
            )}
          </button>
          {editingReading && (
            <button
              type="button"
              onClick={handleCancelClick}
              style={styles.buttonSecondary}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <X size={16} />
                Cancel
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #f0f0f0",
    overflow: "hidden",
    marginBottom: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
    background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
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
    color: "#0a0a0a",
    letterSpacing: "-0.01em",
  },
  form: {
    padding: "20px",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#525252",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    padding: "14px 16px",
    fontSize: "16px",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "#fafafa",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  select: {
    padding: "14px 16px",
    fontSize: "16px",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "#fafafa",
    cursor: "pointer",
  },
  textarea: {
    padding: "14px 16px",
    fontSize: "16px",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "#fafafa",
    fontFamily: "inherit",
    resize: "vertical",
  },
  errorText: {
    fontSize: "12px",
    color: "#ef4444",
  },
  infoBox: {
    padding: "10px 12px",
    backgroundColor: "#f1f5f9",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  infoText: {
    fontSize: "15px",
    color: "#1e293b",
    fontWeight: "500",
  },
  infoSubtext: {
    fontSize: "12px",
    color: "#64748b",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  buttonPrimary: {
    flex: 1,
    padding: "16px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(107, 124, 245, 0.25)",
  },
  buttonSecondary: {
    flex: 1,
    padding: "16px 24px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#525252",
    backgroundColor: "transparent",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};
