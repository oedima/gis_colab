import { useEffect, useRef, useState } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./main.css";

const API_URL = "http://localhost:3000"; 

export default function App() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useGoogle, setUseGoogle] = useState(false);

  const mapRef = useRef(null);
  const layersRef = useRef({});

  async function handleAuth(endpoint) {
    try {
      const path = `${API_URL}/${endpoint}`
      const res = await axios.post(path, { email, password });
      setToken(res.data.token);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  }

  // Init Leaflet map after login
  useEffect(() => {
    if (!token) return; // only run when logged in
    if (mapRef.current) return; // already initialized

    const map = L.map("map", {
      center: [31.7683, 35.2137], // Jerusalem
      zoom: 10,
    });

    // OSM base
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    });

    // Google Satellite base
    const googleSat = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
      attribution: "© Google Maps – Satellite",
      maxZoom: 20,
    });

    layersRef.current = { osm, googleSat };
    mapRef.current = map;

    // Default to OSM
    osm.addTo(map);
  }, [token]);

  // Switch layers when `useGoogle` changes
  useEffect(() => {
    if (!mapRef.current) return;
    const { osm, googleSat } = layersRef.current;
    const map = mapRef.current;

    // Remove both
    map.removeLayer(osm);
    map.removeLayer(googleSat);

    // Add the active one
    if (useGoogle) googleSat.addTo(map);
    else osm.addTo(map);
  }, [useGoogle]);

  // --- Render ---
  if (!token) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2>Login / Signup</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br />
          <button onClick={() => handleAuth("auth/signin")}>Login</button>
          <button onClick={() => handleAuth("auth/signup")}>Signup</button>
        </div>
      </div>
    );
  }

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
