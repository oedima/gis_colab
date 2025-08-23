import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:8000/api/v1";

function DrawingLayer({ ws, token, polygons, setPolygons }) {
  const [current, setCurrent] = useState([]);

  useMapEvents({
    click(e) {
      const point = [e.latlng.lat, e.latlng.lng];
      setCurrent((c) => [...c, point]);
    },
    dblclick() {
      if (current.length < 3) return;
      const name = `Area ${polygons.length + 1}`;
      fetch(`${API_URL}/areas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ name, coordinates: current }),
      })
        .then((r) => r.json())
        .then((area) => {
          ws.current?.send(JSON.stringify({ type: "area", data: area }));
          setPolygons((p) => [...p, area]);
          setCurrent([]);
        });
    },
  });

  return (
    <>
      {polygons.map((p) => (
        <Polygon key={p.id} positions={p.coordinates} />
      ))}
      {current.length > 0 && (
        <Polygon
          positions={current}
          pathOptions={{ dashArray: "4", color: "red" }}
        />
      )}
    </>
  );
}

export default function MapView() {
  const [polygons, setPolygons] = useState([]);
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState([]);
  const ws = useRef(null);

  // login
  useEffect(() => {
    fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: `user-${Date.now()}` }),
    })
      .then((r) => r.json())
      .then((d) => setToken(d.token));
  }, []);

  // websocket
  useEffect(() => {
    if (!token) return;
    ws.current = new WebSocket(`ws://localhost:8000/api/v1/ws?token=${token}`);
    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "area") {
        setPolygons((p) => [...p, msg.data]);
      } else if (msg.type === "users") {
        setUsers(msg.users);
      }
    };
    return () => ws.current?.close();
  }, [token]);

  return (
    <div>
      <div style={{ height: "500px" }}>
        <MapContainer center={[32, 34.8]} zoom={8} doubleClickZoom={false}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OSM">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer url="https://map.govmap.gov.il/arcgis/rest/services/BaseMaps/Orthophoto/MapServer/tile/{z}/{y}/{x}" />
            </LayersControl.BaseLayer>
          </LayersControl>
          {token && (
            <DrawingLayer
              ws={ws}
              token={token}
              polygons={polygons}
              setPolygons={setPolygons}
            />
          )}
        </MapContainer>
      </div>
      <div>Active users: {users.join(", ")}</div>
    </div>
  );
}

