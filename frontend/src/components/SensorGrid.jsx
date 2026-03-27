export default function SensorGrid() {
  const sensors = [
    { name: 'Seismic Activity',         sub: '5 stations',       value: '439',    color: 'var(--accent-cyan)' },
    { name: 'Weather Stations (Live)',   sub: '5,000 night det.', value: '19,784', color: 'var(--accent-orange)' },
    { name: 'Flood Sensors',            sub: '922 online',       value: '922',    color: 'var(--accent-blue)' },
    { name: 'Satellite Imagery Feed',   sub: 'Active',           value: '8',      color: 'var(--accent-purple)' },
    { name: 'Local Alerts Feed',        sub: 'M-reports',        value: '173',    color: 'var(--accent-green)' },
    { name: 'Active Responders',        sub: 'NADMA / Bomba',    value: '46',     color: 'var(--accent-gold)' },
    { name: 'River Level Monitors',     sub: 'DID Stations',     value: '312',    color: 'var(--accent-cyan)' },
    { name: 'Air Quality Index',        sub: 'DOE Stations',     value: '68',     color: 'var(--accent-red)' },
  ];

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span className="panel-header__title">Sensor Grid</span>
        <span className="panel-header__badge panel-header__badge--live">LIVE</span>
      </div>
      <div className="panel-body">
        {sensors.map((s, i) => (
          <div className="sensor-item" key={i}>
            <div className="sensor-item__label">
              <span className="sensor-item__dot" style={{ background: s.color }} />
              <div>
                {s.name}
                <div className="sensor-item__sub">{s.sub}</div>
              </div>
            </div>
            <span className="sensor-item__value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
