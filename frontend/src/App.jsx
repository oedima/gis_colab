import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./main.css";

export default function App() {
  const mapRef = useRef(null);
  const [useGoogle, setUseGoogle] = useState(false);

  useEffect(() => {
    if (mapRef.current) return; // init only once

    const map = L.map("map", {
      center: [32.069, 34.776], // Tel Aviv
      zoom: 13,
    });

    // OSM
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

    // Google Satellite
    const googleSat = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
    );

    mapRef.current = { map, layers: { osm, googleSat } };

    // Add default layer
    osm.addTo(map);
  }, []);

  // Switch between OSM and Google when state changes
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, layers } = mapRef.current;

    // remove all
    Object.values(layers).forEach((layer) => map.removeLayer(layer));

    // add chosen
    if (useGoogle) layers.googleSat.addTo(map);
    else layers.osm.addTo(map);
  }, [useGoogle]);

  return (
    <div className="map-wrapper">
      <div className="controls">
        <button onClick={() => setUseGoogle(!useGoogle)}>
          {useGoogle ? "Use OpenStreetMap" : "Use Google Maps"}
        </button>
      </div>
      <div
        id="map"
        style={{
          height: "60vh",
          width: "60vw",
          margin: "1rem auto",
          border: "2px solid #444",
        }}
      />
    </div>
  );
}
