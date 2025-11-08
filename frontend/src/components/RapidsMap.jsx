import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom marker icons based on difficulty
const getDifficultyColor = (difficulty) => {
  const colors = {
    'I': '#4ade80',     // Green - Easy
    'II': '#60a5fa',    // Blue - Novice
    'III': '#fbbf24',   // Yellow - Intermediate
    'IV': '#fb923c',    // Orange - Advanced
    'IV+': '#f97316',   // Dark Orange - Expert
    'V': '#ef4444',     // Red - Expert+
    'V+': '#dc2626',    // Dark Red - Extreme
    'VI': '#991b1b',    // Darkest Red - Unrunnable
  };
  return colors[difficulty] || '#8b5cf6'; // Purple - Unknown
};

const createDifficultyIcon = (difficulty) => {
  const color = getDifficultyColor(difficulty);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; color: white;">${difficulty}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const RapidsMap = ({ rapids, center = [39.8283, -98.5795], zoom = 5 }) => {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {rapids.map((rapid) => (
          <Marker
            key={rapid.id}
            position={[rapid.latitude, rapid.longitude]}
            icon={createDifficultyIcon(rapid.difficulty)}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                  {rapid.name}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  <strong>River:</strong> {rapid.river}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Difficulty:</strong>{' '}
                  <span style={{ color: getDifficultyColor(rapid.difficulty) }}>
                    Class {rapid.difficulty}
                  </span>
                </p>
                {rapid.optimal_flow_min && (
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    <strong>Optimal Flow:</strong> {rapid.optimal_flow_min}-
                    {rapid.optimal_flow_max} CFS
                  </p>
                )}
                <button
                  onClick={() => navigate(`/rapid/${rapid.id}`)}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RapidsMap;
