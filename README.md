# gis_colab
Real time collaborative GIS platform: draw polygons together.

## Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the browser at `http://localhost:5173` and start drawing polygons. The
map supports switching between OpenStreetMap and the Israeli government aerial
imagery layer. Drawing actions are broadcast to connected users in real time
through a WebSocket connection and stored on the backend with basic
versioning.
