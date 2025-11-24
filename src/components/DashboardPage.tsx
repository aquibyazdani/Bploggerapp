import React from 'react';
import { Reading } from '../App';
import { Heart, TrendingUp, TrendingDown, Activity, Armchair, User, Bed, Plus } from 'lucide-react';

interface DashboardPageProps {
  readings: Reading[];
  onAddClick: () => void;
}

export function DashboardPage({ readings, onAddClick }: DashboardPageProps) {
  // Calculate statistics
  const stats = React.useMemo(() => {
    if (readings.length === 0) {
      return null;
    }

    const avgSystolic = Math.round(
      readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length
    );
    const avgDiastolic = Math.round(
      readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length
    );

    const highest = readings.reduce((max, r) => 
      (r.systolic > max.systolic) ? r : max
    );

    const lowest = readings.reduce((min, r) => 
      (r.systolic < min.systolic) ? r : min
    );

    const readingsWithPulse = readings.filter(r => r.pulse);
    const avgPulse = readingsWithPulse.length > 0
      ? Math.round(readingsWithPulse.reduce((sum, r) => sum + (r.pulse || 0), 0) / readingsWithPulse.length)
      : null;

    // Count readings by position
    const positionCounts = readings.reduce((acc, r) => {
      acc[r.bodyPosition] = (acc[r.bodyPosition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      avgSystolic,
      avgDiastolic,
      highest,
      lowest,
      avgPulse,
      positionCounts,
      totalReadings: readings.length,
    };
  }, [readings]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.greeting}>Hello, Aquib</h1>
        <p style={styles.subGreeting}>Here's your blood pressure overview</p>
      </div>

      {stats ? (
        <>
          {/* Main Stats Grid */}
          <div style={styles.statsGrid}>
            {/* Average BP Card */}
            <div style={styles.statCard}>
              <div style={styles.cardHeader}>
                <div style={{...styles.iconCircle, backgroundColor: '#EEF2FF'}}>
                  <Heart size={20} color="#6B7CF5" />
                </div>
                <span style={styles.cardTitle}>Average BP</span>
              </div>
              <div style={styles.cardValue}>
                <span style={styles.bpLarge}>{stats.avgSystolic}</span>
                <span style={styles.bpSlash}>/</span>
                <span style={styles.bpLarge}>{stats.avgDiastolic}</span>
              </div>
              <span style={styles.cardUnit}>mmHg</span>
            </div>

            {/* Highest Reading Card */}
            <div style={styles.statCard}>
              <div style={styles.cardHeader}>
                <div style={{...styles.iconCircle, backgroundColor: '#FEF2F2'}}>
                  <TrendingUp size={20} color="#EF4444" />
                </div>
                <span style={styles.cardTitle}>Highest</span>
              </div>
              <div style={styles.cardValue}>
                <span style={styles.bpLarge}>{stats.highest.systolic}</span>
                <span style={styles.bpSlash}>/</span>
                <span style={styles.bpLarge}>{stats.highest.diastolic}</span>
              </div>
              <span style={styles.cardUnit}>mmHg</span>
            </div>

            {/* Lowest Reading Card */}
            <div style={styles.statCard}>
              <div style={styles.cardHeader}>
                <div style={{...styles.iconCircle, backgroundColor: '#ECFDF5'}}>
                  <TrendingDown size={20} color="#10B981" />
                </div>
                <span style={styles.cardTitle}>Lowest</span>
              </div>
              <div style={styles.cardValue}>
                <span style={styles.bpLarge}>{stats.lowest.systolic}</span>
                <span style={styles.bpSlash}>/</span>
                <span style={styles.bpLarge}>{stats.lowest.diastolic}</span>
              </div>
              <span style={styles.cardUnit}>mmHg</span>
            </div>

            {/* Average Pulse Card */}
            {stats.avgPulse && (
              <div style={styles.statCard}>
                <div style={styles.cardHeader}>
                  <div style={{...styles.iconCircle, backgroundColor: '#FDF2F8'}}>
                    <Activity size={20} color="#EC4899" />
                  </div>
                  <span style={styles.cardTitle}>Avg Pulse</span>
                </div>
                <div style={styles.cardValue}>
                  <span style={styles.bpLarge}>{stats.avgPulse}</span>
                </div>
                <span style={styles.cardUnit}>bpm</span>
              </div>
            )}
          </div>

          {/* Body Position Card */}
          <div style={styles.positionCard}>
            <div style={styles.positionHeader}>
              <h3 style={styles.positionTitle}>Readings by Body Position</h3>
              <span style={styles.totalBadge}>{stats.totalReadings} total</span>
            </div>
            <div style={styles.positionGrid}>
              {/* Seated */}
              <div style={styles.positionItem}>
                <div style={{...styles.positionIconCircle, backgroundColor: '#EEF2FF'}}>
                  <Armchair size={24} color="#6B7CF5" />
                </div>
                <span style={styles.positionLabel}>Seated</span>
                <span style={styles.positionCount}>{stats.positionCounts.seated || 0}</span>
              </div>

              {/* Leaning */}
              <div style={styles.positionItem}>
                <div style={{...styles.positionIconCircle, backgroundColor: '#EFF6FF'}}>
                  <User size={24} color="#3B82F6" />
                </div>
                <span style={styles.positionLabel}>Leaning</span>
                <span style={styles.positionCount}>{stats.positionCounts.leaning || 0}</span>
              </div>

              {/* Laying */}
              <div style={styles.positionItem}>
                <div style={{...styles.positionIconCircle, backgroundColor: '#ECFDF5'}}>
                  <Bed size={24} color="#10B981" />
                </div>
                <span style={styles.positionLabel}>Laying</span>
                <span style={styles.positionCount}>{stats.positionCounts.laying || 0}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <Heart size={64} color="#A5B4FC" strokeWidth={1.5} />
          </div>
          <h3 style={styles.emptyTitle}>No data yet</h3>
          <p style={styles.emptyText}>
            Start tracking your blood pressure by adding your first reading
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={onAddClick}
        style={styles.fab}
        aria-label="Add new reading"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingBottom: '20px',
  },
  header: {
    marginBottom: '8px',
  },
  greeting: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #6B7CF5 0%, #8B5CF6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.02em',
  },
  subGreeting: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#737373',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 2px 12px rgba(107, 124, 245, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#525252',
    letterSpacing: '-0.01em',
  },
  cardValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginTop: '4px',
  },
  bpLarge: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0a0a0a',
    lineHeight: '1',
  },
  bpSlash: {
    fontSize: '24px',
    fontWeight: '300',
    color: '#d4d4d4',
  },
  cardUnit: {
    fontSize: '12px',
    color: '#a3a3a3',
    fontWeight: '500',
  },
  positionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 2px 12px rgba(107, 124, 245, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
  },
  positionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  positionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#0a0a0a',
    letterSpacing: '-0.01em',
  },
  totalBadge: {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7CF5',
    backgroundColor: '#f0f0ff',
    borderRadius: '12px',
  },
  positionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  positionItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  positionIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#525252',
    textAlign: 'center',
  },
  positionCount: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0a0a0a',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '60px 24px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 2px 12px rgba(107, 124, 245, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#0a0a0a',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#a3a3a3',
    lineHeight: '1.5',
    maxWidth: '280px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  fab: {
    position: 'fixed',
    bottom: '90px',
    right: '50%',
    transform: 'translateX(calc(215px - 32px))',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6B7CF5 0%, #5B6CF4 100%)',
    color: '#ffffff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(107, 124, 245, 0.4)',
    zIndex: 45,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};