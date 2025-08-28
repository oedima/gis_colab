import { useRef } from "react";
import { useMap } from "../hooks/useMap";

export default function MapView({ token, useGoogle, drawing, polygonPoints, setPolygonPoints }) {
  const polygonRef = useRef(null);

  useMap({ token, useGoogle, drawing, polygonPoints, setPolygonPoints, polygonRef });

  if (!token) return null;

  return (
    <div
      id="map"
      style={{ height: "60vh", width: "60vw", margin: "1rem auto", border: "2px solid #444" }}
    />
  );
}
