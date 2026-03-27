import { useState, useEffect, useRef, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import SensorGrid from './components/SensorGrid';
import RiskGauges from './components/RiskGauges';
import MapView from './components/MapView';
import NewsFeed from './components/NewsFeed';
import LocationData from './components/LocationData';
import ImageAnalyzer from './components/ImageAnalyzer';
import ChatBot from './components/ChatBot';
import AlertSummary from './components/AlertSummary';
import AuthModal from './components/AuthModal';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const dashRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Prevent the dashboard grid from scrolling (Leaflet/Plotly can trigger auto-scroll)
  useEffect(() => {
    const el = dashRef.current;
    if (!el) return;
    const preventScroll = () => { el.scrollTop = 0; el.scrollLeft = 0; };
    preventScroll();
    el.addEventListener('scroll', preventScroll);
    // Also reset after a brief delay for lazy-loaded components
    const timer = setTimeout(preventScroll, 500);
    return () => { el.removeEventListener('scroll', preventScroll); clearTimeout(timer); };
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // The user's idToken can be used to call protected backend routes:
    // e.g., getAuthenticatedUser(userData.idToken)
    console.log('Logged in:', userData.email);
  };

  return (
    <div className="dashboard" ref={dashRef}>
      {/* Top Header Bar — placed directly in grid (no ErrorBoundary wrapper to avoid breaking grid-area) */}
      <Header
        onLoginClick={() => setShowAuth(true)}
        onThemeToggle={() => setIsDark(prev => !prev)}
        isDark={isDark}
      />

      {/* Left Sidebar: Sensor Grid + Risk Gauges */}
      <div className="left-sidebar">
        <SensorGrid />
        <RiskGauges />
      </div>

      {/* Central Map View — ErrorBoundary must inherit grid-area */}
      <ErrorBoundary fallback="Map failed to load">
        <MapView />
      </ErrorBoundary>

      {/* Right Sidebar: Chatbot + Alert Summary */}
      <div className="right-sidebar">
        <ChatBot />
        <AlertSummary />
      </div>

      {/* Bottom Panel Group */}
      <div className="bottom-panels">
        <ErrorBoundary fallback="News Feed unavailable">
          <NewsFeed />
        </ErrorBoundary>
        <ErrorBoundary fallback="Location Data unavailable">
          <LocationData />
        </ErrorBoundary>
        <ErrorBoundary fallback="Image Analyzer unavailable">
          <ImageAnalyzer />
        </ErrorBoundary>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
