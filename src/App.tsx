/**
 * BP Logger - Professional Blood Pressure Tracking Application
 * 
 * Multi-page app with:
 * - Dashboard: Overview of readings
 * - Readings: Data listing with add/edit/delete
 * - Trends: Visual charts and patterns
 * - Summary: Statistics and CSV export with date filtering
 */

import React, { useState, useEffect } from 'react';
import { DashboardPage } from './components/DashboardPage';
import { ReadingsPage } from './components/ReadingsPage';
import { TrendsPage } from './components/TrendsPage';
import { SummaryPage } from './components/SummaryPage';
import { Activity, Home, List, TrendingUp, FileBarChart } from 'lucide-react';

export interface Reading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  bodyPosition: 'seated' | 'leaning' | 'laying';
  note?: string;
  timestamp: string;
}

export const STORAGE_KEY = 'bp_readings_v1';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'readings' | 'trends' | 'summary'>('dashboard');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load readings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReadings(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading readings:', error);
    }
  }, []);

  // Save readings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
    } catch (error) {
      console.error('Error saving readings:', error);
    }
  }, [readings]);

  const handleAddReading = (reading: Omit<Reading, 'id'>) => {
    const newReading: Reading = {
      ...reading,
      id: Date.now().toString(),
    };
    setReadings(prev => [newReading, ...prev]);
    setShowForm(false);
  };

  const handleEditReading = (reading: Reading) => {
    setEditingReading(reading);
    setShowForm(true);
    setCurrentPage('readings');
  };

  const handleUpdateReading = (updatedReading: Reading) => {
    setReadings(prev =>
      prev.map(r => (r.id === updatedReading.id ? updatedReading : r))
    );
    setEditingReading(null);
    setShowForm(false);
  };

  const handleDeleteReading = (id: string) => {
    if (confirm('Are you sure you want to delete this reading?')) {
      setReadings(prev => prev.filter(r => r.id !== id));
      if (editingReading?.id === id) {
        setEditingReading(null);
        setShowForm(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
    setShowForm(false);
  };

  const handleDashboardAddClick = () => {
    setCurrentPage('readings');
    setEditingReading(null);
    setShowForm(true);
  };

  return (
    <div style={styles.app}>
      {/* Mobile App Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Activity size={24} style={styles.headerIcon} />
          <h1 style={styles.headerTitle}>BP Logger</h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {currentPage === 'dashboard' && (
          <DashboardPage readings={readings} onAddClick={handleDashboardAddClick} />
        )}
        {currentPage === 'readings' && (
          <ReadingsPage 
            readings={readings}
            onAdd={handleAddReading}
            onEdit={handleEditReading}
            onUpdate={handleUpdateReading}
            onDelete={handleDeleteReading}
            onCancelEdit={handleCancelEdit}
            editingReading={editingReading}
            showFormInitial={showForm}
          />
        )}
        {currentPage === 'trends' && <TrendsPage readings={readings} />}
        {currentPage === 'summary' && <SummaryPage readings={readings} />}
      </main>

      {/* Bottom Navigation */}
      <nav style={styles.bottomNav}>
        <button
          onClick={() => setCurrentPage('dashboard')}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === 'dashboard' ? styles.bottomNavButtonActive : {}),
          }}
        >
          <Home size={24} style={styles.bottomNavIcon} />
          <span style={styles.bottomNavLabel}>Dashboard</span>
        </button>
        <button
          onClick={() => setCurrentPage('readings')}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === 'readings' ? styles.bottomNavButtonActive : {}),
          }}
        >
          <List size={24} style={styles.bottomNavIcon} />
          <span style={styles.bottomNavLabel}>Readings</span>
        </button>
        <button
          onClick={() => setCurrentPage('trends')}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === 'trends' ? styles.bottomNavButtonActive : {}),
          }}
        >
          <TrendingUp size={24} style={styles.bottomNavIcon} />
          <span style={styles.bottomNavLabel}>Trends</span>
        </button>
        <button
          onClick={() => setCurrentPage('summary')}
          style={{
            ...styles.bottomNavButton,
            ...(currentPage === 'summary' ? styles.bottomNavButtonActive : {}),
          }}
        >
          <FileBarChart size={24} style={styles.bottomNavIcon} />
          <span style={styles.bottomNavLabel}>Summary</span>
        </button>
      </nav>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, #C7D2FE 0%, #DDD6FE 50%, #E9D5FF 100%)',
    maxWidth: '430px',
    margin: '0 auto',
    position: 'relative',
  },
  nav: {
    display: 'none',
  },
  navContainer: {
    display: 'none',
  },
  logo: {
    display: 'none',
  },
  logoIcon: {
    display: 'none',
  },
  logoText: {
    display: 'none',
  },
  navLinks: {
    display: 'none',
  },
  navLink: {
    display: 'none',
  },
  navLinkActive: {
    display: 'none',
  },
  navLinkIcon: {
    display: 'none',
  },
  header: {
    background: 'linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)',
    padding: '20px 20px 16px 20px',
    borderBottom: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    boxShadow: '0 4px 12px rgba(107, 124, 245, 0.15)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  headerIcon: {
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  main: {
    flex: 1,
    width: '100%',
    margin: '0',
    padding: '16px 16px 90px 16px',
    overflowY: 'auto',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '430px',
    backgroundColor: '#ffffff',
    borderTop: 'none',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
    zIndex: 50,
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.06)',
    borderRadius: '24px 24px 0 0',
  },
  bottomNavButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#a3a3a3',
  },
  bottomNavButtonActive: {
    color: '#6B7CF5',
  },
  bottomNavIcon: {
    transition: 'transform 0.2s',
  },
  bottomNavLabel: {
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '0.01em',
  },
  footer: {
    display: 'none',
  },
  footerText: {
    display: 'none',
  },
  footerIcon: {
    display: 'none',
  },
};