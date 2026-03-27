import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in webpack/vite bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored marker icons
function createIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid rgba(255,255,255,0.8);
      box-shadow:0 0 8px ${color}, 0 0 16px ${color}44;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const icons = {
  earthquake: createIcon('#ff4757'),
  flood: createIcon('#0099ff'),
  monsoon: createIcon('#d4a843'),
  station: createIcon('#00e676'),
};

// Malaysia-focused disaster pins (sample data)
const markers = [
  { pos: [3.139, 101.6869], type: 'flood',      label: 'Kuala Lumpur — Urban Flooding',          severity: 'High' },
  { pos: [5.4164, 100.3327], type: 'monsoon',    label: 'Penang — Monsoon Warning',               severity: 'Medium' },
  { pos: [1.4927, 103.7414], type: 'flood',      label: 'Johor Bahru — River Overflow Risk',       severity: 'High' },
  { pos: [5.9804, 116.0735], type: 'earthquake', label: 'Kota Kinabalu — Minor Seismic Activity',  severity: 'Low' },
  { pos: [4.5841, 103.4248], type: 'flood',      label: 'Kuantan — Flash Flood Alert',             severity: 'High' },
  { pos: [2.1896, 102.2501], type: 'monsoon',    label: 'Melaka — Heavy Rainfall Advisory',        severity: 'Medium' },
  { pos: [6.1254, 102.2381], type: 'flood',      label: 'Kota Bharu — Kelantan River Surge',       severity: 'High' },
  { pos: [4.2105, 101.9758], type: 'station',    label: 'Cameron Highlands — Weather Station',     severity: 'Active' },
  { pos: [3.8077, 103.326],  type: 'station',    label: 'Cherating — Coastal Monitor',             severity: 'Active' },
  { pos: [2.7456, 101.7072], type: 'flood',      label: 'Shah Alam — Drainage Overflow',           severity: 'Medium' },
];

// Connection arcs between related events
const arcs = [
  { from: [3.139, 101.6869], to: [2.7456, 101.7072] },
  { from: [6.1254, 102.2381], to: [4.5841, 103.4248] },
  { from: [5.4164, 100.3327], to: [2.1896, 102.2501] },
  { from: [4.2105, 101.9758], to: [3.8077, 103.326] },
];

// Component to fly to searched location
function FlyTo({ center }) {
  const map = useMap();
  if (center) map.flyTo(center, 12, { duration: 1.5 });
  return null;
}

export default function MapView() {
  const [searchVal, setSearchVal] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);

  // Simple geocoding via Nominatim (free, no key required)
  const handleSearch = useCallback(async () => {
    if (!searchVal.trim()) return;
    try {
      // NOTE: For production, use a proper geocoding API (Google, Mapbox, etc.)
      // Nominatim is free but has rate limits. Add your own geocoding key if needed.
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchVal)}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        setFlyTarget([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  }, [searchVal]);

  // Dark-styled CartoDB tile layer (free, no API key needed)
  // ALTERNATIVE: If you want to use Mapbox, replace the URL below with:
  // https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_TOKEN
  const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="map-area">
      {/* Search Overlay */}
      <div className="map-search">
        <input
          className="map-search__input"
          placeholder="ENTER ADDRESS OR PIN LOCATION"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="map-search__btn" onClick={handleSearch}>SEARCH</button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={[4.2105, 103.5]} // Center of Malaysia
        zoom={7}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url={DARK_TILES}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Fly to searched location */}
        <FlyTo center={flyTarget} />

        {/* Disaster markers */}
        {markers.map((m, i) => (
          <Marker key={i} position={m.pos} icon={icons[m.type]}>
            <Popup>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <strong>{m.label}</strong><br />
                <span style={{ color: m.severity === 'High' ? '#ff4757' : m.severity === 'Medium' ? '#ff9f43' : '#00e676' }}>
                  Severity: {m.severity}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Connection arcs */}
        {arcs.map((a, i) => (
          <Polyline
            key={i}
            positions={[a.from, a.to]}
            pathOptions={{
              color: '#00d4ff',
              weight: 1,
              opacity: 0.35,
              dashArray: '6 4',
            }}
          />
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="map-legend__item">
          <span className="map-legend__dot" style={{ background: '#ff4757' }} /> Earthquake
        </div>
        <div className="map-legend__item">
          <span className="map-legend__dot" style={{ background: '#0099ff' }} /> Flood
        </div>
        <div className="map-legend__item">
          <span className="map-legend__dot" style={{ background: '#d4a843' }} /> Monsoon
        </div>
        <div className="map-legend__item">
          <span className="map-legend__dot" style={{ background: '#00e676' }} /> Station
        </div>
      </div>
    </div>
  );
}
