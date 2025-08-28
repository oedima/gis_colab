// src/components/Controls.jsx
export default function Controls({ useGoogle, toggleLayer, drawing, toggleDrawing }) {
  return (
    <div className="controls">
      <button onClick={toggleLayer}>
        {useGoogle ? "Use OpenStreetMap" : "Use Google Maps"}
      </button>
      <button onClick={toggleDrawing}>
        {drawing ? "Finish Polygon" : "Draw Polygon"}
      </button>
    </div>
  );
}
