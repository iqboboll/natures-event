import { useState, useEffect } from 'react';

// Severity color map
const SEVERITY_STYLES = {
  High:    { bg: 'rgba(255,71,87,0.15)',  color: 'var(--accent-red)' },
  Medium:  { bg: 'rgba(255,159,67,0.15)', color: 'var(--accent-orange)' },
  Low:     { bg: 'rgba(0,230,118,0.15)',  color: 'var(--accent-green)' },
  Unknown: { bg: 'rgba(0,212,255,0.12)',  color: 'var(--accent-cyan)' },
};

// Capitalize first letter
function capitalize(str) {
  if (!str) return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format Firestore timestamp to readable date/time
function formatTimestamp(ts) {
  if (!ts) return { date: '--', time: 'JUST NOW' };
  
  // Firestore Timestamp object (seconds + nanoseconds)
  const ms = ts.seconds ? ts.seconds * 1000 : (ts._seconds ? ts._seconds * 1000 : null);
  if (!ms) return { date: '--', time: 'JUST NOW' };
  
  const d = new Date(ms);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  
  // Relative time for recent entries
  let timeStr;
  if (diffMin < 1) timeStr = 'JUST NOW';
  else if (diffMin < 60) timeStr = `${diffMin}m ago`;
  else if (diffHr < 24) timeStr = `${diffHr}h ago`;
  else timeStr = d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });
  
  // Absolute time
  const dateStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return { date: dateStr, time: timeStr };
}

// Resolve location display from pos array or location string
function resolveLocation(report) {
  // If a location string exists, use it
  if (report.location && typeof report.location === 'string') return report.location;
  
  // Fall back to coordinates
  if (Array.isArray(report.pos) && report.pos.length === 2) {
    return `${report.pos[0].toFixed(3)}°N, ${report.pos[1].toFixed(3)}°E`;
  }
  
  return 'Unknown location';
}

export default function NewsFeed({ reports = [] }) {
  const [displayReports, setDisplayReports] = useState([]);

  useEffect(() => {
    // Take Top 8 most recent community incidents
    if (reports && reports.length > 0) {
      setDisplayReports(reports.slice(0, 8));
    }
  }, [reports]);

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span className="panel-header__title">Community Incidents</span>
        <span className="panel-header__badge panel-header__badge--live">
          {reports.length > 0 ? 'USER REPORTED' : 'SCANNING...'}
        </span>
      </div>
      <div className="panel-body">
        {displayReports.length > 0 ? (
          displayReports.map((r, i) => {
            const { date, time } = formatTimestamp(r.timestamp);
            const severity = r.severity || 'Unknown';
            const sevStyle = SEVERITY_STYLES[severity] || SEVERITY_STYLES.Unknown;
            const typeName = capitalize(r.hazard || r.type);
            const description = r.text || r.description || '';
            const location = resolveLocation(r);

            return (
              <div className="news-item fade-in" key={r.id || i} style={{ animationDelay: `${i * 0.08}s` }}>
                {/* Row 1: Time + Severity */}
                <div className="news-item__meta">
                  <span className="news-item__time">{date}</span>
                  <span className="news-item__relative">{time}</span>
                </div>
                
                {/* Row 2: Type + Location */}
                <div className="news-item__text">
                  <strong style={{ color: 'var(--accent-cyan)' }}>{typeName}:</strong>{' '}
                  {location}
                </div>
                
                {/* Row 3: Description (if provided) */}
                {description && (
                  <div className="news-item__desc">{description}</div>
                )}
                
                {/* Row 4: Severity badge */}
                <span
                  className="news-item__tag"
                  style={{ background: sevStyle.bg, color: sevStyle.color }}
                >
                  {severity.toUpperCase()}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-muted" style={{ fontSize: '10px', textAlign: 'center', marginTop: '20px' }}>
            No community incidents reported in the last 24h.
          </div>
        )}
      </div>
    </div>
  );
}
