import { useState } from "react";
import { signin, signup } from "./api/auth";
import AuthForm from "./components/AuthForm";
import Controls from "./components/Controls";
import MapView from "./components/MapView";


export default function App() {
  const [token, setToken] = useState(null);
  const [useGoogle, setUseGoogle] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);

  async function handleAuth(type, email, password) {
    try {
      const token = type === "signin" ? await signin(email, password) : await signup(email, password);
      setToken(token);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  }

  if (!token) return <AuthForm onAuth={handleAuth} />;

  return (
    <div className="map-container">
      <Controls
        useGoogle={useGoogle}
        toggleLayer={() => setUseGoogle((g) => !g)}
        drawing={drawing}
        toggleDrawing={() => {
          if (drawing) setDrawing(false);
          else { setPolygonPoints([]); setDrawing(true); }
        }}
      />
      <MapView
        token={token}
        useGoogle={useGoogle}
        drawing={drawing}
        polygonPoints={polygonPoints}
        setPolygonPoints={setPolygonPoints}
      />
    </div>
  );
}
