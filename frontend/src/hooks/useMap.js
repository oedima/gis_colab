import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function useMap({ token, useGoogle, drawing, polygonPoints, setPolygonPoints, polygonRef }) {
  const mapRef = useRef(null);
  const layersRef = useRef({});

  // Init map
  useEffect(() => {
    if (!token || mapRef.current) return;
    const map = L.map("map", { center: [31.7683, 35.2137], zoom: 10 });
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
    const googleSat = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}");
    layersRef.current = { osm, googleSat };
    mapRef.current = map;
    osm.addTo(map);
  }, [token]);

  // Switch layers
  useEffect(() => {
    if (!mapRef.current) return;
    const { osm, googleSat } = layersRef.current;
    const map = mapRef.current;
    map.removeLayer(osm);
    map.removeLayer(googleSat);
    (useGoogle ? googleSat : osm).addTo(map);
  }, [useGoogle]);

  // Handle clicks while drawing
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    function handleClick(e) {
      if (drawing) setPolygonPoints((pts) => [...pts, [e.latlng.lat, e.latlng.lng]]);
    }
    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [drawing]);

  // Draw polygon
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (polygonRef.current) map.removeLayer(polygonRef.current);
    if (polygonPoints.length > 0) {
      polygonRef.current = L.polygon(polygonPoints, { color: "red" }).addTo(map);
    }
  }, [polygonPoints]);
}
