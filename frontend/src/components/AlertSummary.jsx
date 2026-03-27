export default function AlertSummary() {
  const alerts = [
    {
      type: 'FLASH FLOOD WARNING',
      desc: 'Klang Valley — Water rising rapidly. Residents near Sungai Klang advised to evacuate.',
      time: '3H AGO',
      urgency: 'urgent',
    },
    {
      type: 'MONSOON SURGE ADVISORY',
      desc: 'East coast states — Heavy continuous rain expected for 48 hours.',
      time: '5H AGO',
      urgency: 'warning',
    },
    {
      type: 'LANDSLIDE RISK',
      desc: 'Cameron Highlands — Slope instability detected near Brinchang.',
      time: '8H AGO',
      urgency: 'warning',
    },
    {
      type: 'SEISMIC ACTIVITY',
      desc: 'Ranau, Sabah — Magnitude 2.1 tremor detected. No damage reported.',
      time: '12H AGO',
      urgency: 'info',
    },
    {
      type: 'HAZE ALERT',
      desc: 'Muar, Johor — API reading 158 (Unhealthy). Limit outdoor activities.',
      time: '14H AGO',
      urgency: 'warning',
    },
    {
      type: 'RIVER LEVEL CRITICAL',
      desc: 'Sungai Kelantan at Guillemard Bridge — 8.2m (Danger: 9.0m). Monitoring active.',
      time: '1D AGO',
      urgency: 'urgent',
    },
  ];

  return (
    <div className="panel" style={{ flex: 0 }}>
      <div className="panel-header">
        <span className="panel-header__title">Alert Summary</span>
        <span className="panel-header__badge panel-header__badge--alert">
          {alerts.filter(a => a.urgency === 'urgent').length} URGENT
        </span>
      </div>
      <div className="panel-body">
        {alerts.map((a, i) => (
          <div className="alert-item fade-in" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="alert-item__header">
              <span className="alert-item__type">{a.type}</span>
              <span className="alert-item__time">{a.time}</span>
            </div>
            <div className="alert-item__desc">{a.desc}</div>
            <span className={`alert-item__urgency alert-item__urgency--${a.urgency}`}>
              {a.urgency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
