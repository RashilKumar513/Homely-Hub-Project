import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet icon marker assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const knownCoordinates = {
  goa: [15.2993, 74.124],
  mumbai: [19.076, 72.8777],
  bandra: [19.0596, 72.8295],
  jaipur: [26.9124, 75.7873],
  ooty: [11.4102, 76.695],
  chikmagalur: [13.3161, 75.772],
  ladakh: [34.1526, 77.5771],
  leh: [34.1526, 77.5771],
  manali: [32.2432, 77.1892],
  bangalore: [12.9716, 77.5946],
  munnar: [10.0889, 77.0595],
  chennai: [13.0827, 80.2707],
  delhi: [28.6139, 77.209],
};

const MapComponent = ({ address = {} }) => {
  const cityName = address.city || "Goa";
  const stateName = address.state || "Goa";
  const fullAddress = `${address.area ? address.area + ', ' : ''}${cityName}, ${stateName}`;

  const getFallbackCoords = () => {
    const key = (cityName || '').toLowerCase().trim();
    if (knownCoordinates[key]) return knownCoordinates[key];
    const stateKey = (stateName || '').toLowerCase().trim();
    if (knownCoordinates[stateKey]) return knownCoordinates[stateKey];
    return [15.2993, 74.124]; // Default Goa
  };

  const [coordinates, setCoordinates] = useState(getFallbackCoords());

  useEffect(() => {
    let isMounted = true;
    const fetchCoords = async () => {
      try {
        const query = encodeURIComponent(`${cityName}, ${stateName}, India`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        const data = await res.json();

        if (isMounted && data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            setCoordinates([lat, lon]);
          }
        }
      } catch (err) {
        console.warn("Geocoding API fallback to known coords:", err);
      }
    };

    fetchCoords();
    return () => {
      isMounted = false;
    };
  }, [cityName, stateName]);

  return (
    <div style={{ height: "340px", width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
      <MapContainer
        center={coordinates}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        key={`${coordinates[0]}-${coordinates[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates}>
          <Popup>
            <div style={{ padding: "0.2rem" }}>
              <strong style={{ display: "block", color: "#ff385c" }}>📍 Homely Hub Stay</strong>
              <span>{fullAddress}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
