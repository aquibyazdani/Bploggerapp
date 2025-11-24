import React from 'react';
import { Reading } from '../App';
import { TrendingUp, BarChart3, ArrowUp, ArrowDown, Heart, Armchair, User, Bed } from 'lucide-react';

interface TrendsPageProps {
  readings: Reading[];
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function calculateTrends(readings: Reading[]): {
  averageSystolic: number;
  averageDiastolic: number;
  averagePulse: number;
  highestSystolic: number;
  lowestSystolic: number;
  highestDiastolic: number;
  lowestDiastolic: number;
} {
  if (readings.length === 0) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      averagePulse: 0,
      highestSystolic: 0,
      lowestSystolic: 0,
      highestDiastolic: 0,
      lowestDiastolic: 0,
    };
  }

  const systolicValues = readings.map((r) => r.systolic);
  const diastolicValues = readings.map((r) => r.diastolic);
  const pulseValues = readings.filter((r) => r.pulse).map((r) => r.pulse!);

  return {
    averageSystolic: Math.round(
      systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
    ),
    averageDiastolic: Math.round(
      diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length
    ),
    averagePulse:
      pulseValues.length > 0
        ? Math.round(pulseValues.reduce((a, b) => a + b, 0) / pulseValues.length)
        : 0,
    highestSystolic: Math.max(...systolicValues),
    lowestSystolic: Math.min(...systolicValues),
    highestDiastolic: Math.max(...diastolicValues),
    lowestDiastolic: Math.min(...diastolicValues),
  };
}

function getBodyPositionStats(readings: Reading[]): {
  seated: number;
  leaning: number;
  laying: number;
} {
  return {
    seated: readings.filter((r) => r.bodyPosition === 'seated').length,
    leaning: readings.filter((r) => r.bodyPosition === 'leaning').length,
    laying: readings.filter((r) => r.bodyPosition === 'laying').length,
  };
}

export function TrendsPage({ readings }: TrendsPageProps) {
  const trends = calculateTrends(readings);
  const positionStats = getBodyPositionStats(readings);

  if (readings.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Trends & Analysis</h1>
          <p style={styles.subtitle}>Visualize your blood pressure patterns over time</p>
        </div>
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <TrendingUp size={64} color="#94a3b8" />
            </div>
            <h3 style={styles.emptyTitle}>No data to display</h3>
            <p style={styles.emptyText}>
              Add some readings to see trends and patterns in your blood pressure
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Trends & Analysis</h1>
        <p style={styles.subtitle}>Visualize your blood pressure patterns over time</p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><BarChart3 size={32} color="#3b82f6" /></div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Average BP</span>
            <span style={styles.statValue}>
              {trends.averageSystolic}/{trends.averageDiastolic}
            </span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}><ArrowUp size={32} color="#ef4444" /></div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Highest Reading</span>
            <span style={styles.statValue}>
              {trends.highestSystolic}/{trends.highestDiastolic}
            </span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}><ArrowDown size={32} color="#10b981" /></div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Lowest Reading</span>
            <span style={styles.statValue}>
              {trends.lowestSystolic}/{trends.lowestDiastolic}
            </span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}><Heart size={32} color="#ec4899" /></div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Average Pulse</span>
            <span style={styles.statValue}>
              {trends.averagePulse > 0 ? `${trends.averagePulse} bpm` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Body Position Distribution */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Readings by Body Position</h2>
        </div>
        <div style={styles.positionStats}>
          <div style={styles.positionItem}>
            <div style={styles.positionIcon}><Armchair size={32} color="#3b82f6" /></div>
            <div style={styles.positionContent}>
              <span style={styles.positionLabel}>Seated</span>
              <div style={styles.positionBar}>
                <div
                  style={{
                    ...styles.positionBarFill,
                    width: `${(positionStats.seated / readings.length) * 100}%`,
                    backgroundColor: '#3b82f6',
                  }}
                />
              </div>
              <span style={styles.positionCount}>{positionStats.seated} readings</span>
            </div>
          </div>

          <div style={styles.positionItem}>
            <div style={styles.positionIcon}><User size={32} color="#8b5cf6" /></div>
            <div style={styles.positionContent}>
              <span style={styles.positionLabel}>Leaning</span>
              <div style={styles.positionBar}>
                <div
                  style={{
                    ...styles.positionBarFill,
                    width: `${(positionStats.leaning / readings.length) * 100}%`,
                    backgroundColor: '#8b5cf6',
                  }}
                />
              </div>
              <span style={styles.positionCount}>{positionStats.leaning} readings</span>
            </div>
          </div>

          <div style={styles.positionItem}>
            <div style={styles.positionIcon}><Bed size={32} color="#06b6d4" /></div>
            <div style={styles.positionContent}>
              <span style={styles.positionLabel}>Laying Down</span>
              <div style={styles.positionBar}>
                <div
                  style={{
                    ...styles.positionBarFill,
                    width: `${(positionStats.laying / readings.length) * 100}%`,
                    backgroundColor: '#06b6d4',
                  }}
                />
              </div>
              <span style={styles.positionCount}>{positionStats.laying} readings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    marginBottom: '4px',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '22px',
    fontWeight: '600',
    color: '#0a0a0a',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#737373',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #f0f0f0',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#a3a3a3',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0a0a0a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
    position: 'relative',
  },
  cardHeader: {
    padding: '20px',
    borderBottom: '1px solid #f5f5f5',
    backgroundColor: 'transparent',
  },
  cardTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '600',
    color: '#0a0a0a',
    letterSpacing: '-0.01em',
  },
  positionStats: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  positionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  positionIcon: {
    fontSize: '28px',
  },
  positionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  positionLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0a0a0a',
  },
  positionBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f5f5f5',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  positionBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  positionCount: {
    fontSize: '12px',
    color: '#a3a3a3',
  },
  emptyState: {
    padding: '60px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#0a0a0a',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#a3a3a3',
  },
};