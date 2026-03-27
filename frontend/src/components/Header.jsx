import { useState, useEffect } from 'react';

export default function Header({ onLoginClick, onThemeToggle, isDark }) {
  const [time, setTime] = useState(new Date());
  const [activeRegion, setActiveRegion] = useState('REGIONS');

  // Auto-update timestamp every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleString('en-MY', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });

  const regions = ['REGIONS', 'DISTRICT', 'MY LOCATIONS'];

  return (
    <header className="header">
      {/* Logo */}
      <div className="header__logo">
        <div className="header__logo-icon" />
        DISASTER MONITOR
      </div>

      {/* Region Filter Buttons */}
      <nav className="header__nav">
        {regions.map(r => (
          <button
            key={r}
            className={`header__nav-btn ${activeRegion === r ? 'header__nav-btn--active' : ''}`}
            onClick={() => setActiveRegion(r)}
          >
            {r}
          </button>
        ))}
      </nav>

      {/* Right Section: Timestamp, Status, Login, Theme */}
      <div className="header__right">
        <span className="header__timestamp">LAST SYNC: {formattedTime}</span>
        <span className="header__status header__status--high">HIGH ALERT</span>
        <button className="header__login-btn" onClick={onLoginClick}>
          LOGIN / REGISTER
        </button>
        <button className="header__theme-btn" onClick={onThemeToggle} title="Toggle theme">
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
