"""API and WebSocket routes for collaborative GIS backend."""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from pydantic import BaseModel, Field, validator
from shapely.geometry import Polygon
from shapely.validation import explain_validity
from pyproj import Geod


logger = logging.getLogger(__name__)

router = APIRouter()


# In-memory stores ----------------------------------------------------------

areas: Dict[str, Dict] = {}
users: Dict[str, str] = {}
rate_limits: Dict[str, Dict[str, object]] = {}

# Connection manager to broadcast messages between WebSocket clients


class ConnectionManager:
    def __init__(self) -> None:
        self.active: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, token: str) -> None:
        await websocket.accept()
        if token not in users:
            await websocket.close(code=1008)
            return
        self.active[websocket] = users[token]
        await self.broadcast_users()

    def disconnect(self, websocket: WebSocket) -> None:
        self.active.pop(websocket, None)

    async def broadcast(self, message: str) -> None:
        for ws in list(self.active.keys()):
            try:
                await ws.send_text(message)
            except Exception:
                self.disconnect(ws)

    async def broadcast_users(self) -> None:
        msg = json.dumps({"type": "users", "users": list(self.active.values())})
        await self.broadcast(msg)


manager = ConnectionManager()


# Models --------------------------------------------------------------------


class AreaCreate(BaseModel):
    name: str = Field(..., example="My polygon")
    coordinates: List[List[float]] = Field(
        ..., description="[[lat, lng], ...] of polygon vertices"
    )
    id: str | None = None
    version: int | None = None

    @validator("coordinates")
    def _validate_coords(cls, v: List[List[float]]):  # type: ignore[override]
        if len(v) < 3:
            raise ValueError("Polygon requires at least three points")
        poly = Polygon([(lng, lat) for lat, lng in v])
        if not poly.is_valid:
            raise ValueError(f"Invalid polygon: {explain_validity(poly)}")
        return v


class Area(AreaCreate):
    id: str
    area_sq_km: float
    version: int
    history: List[Dict] = []
    updated_at: datetime


class LoginRequest(BaseModel):
    username: str


# Utilities -----------------------------------------------------------------


geod = Geod(ellps="WGS84")
lock = asyncio.Lock()
MAX_ACTIONS = 50
WINDOW = timedelta(minutes=1)


def _rate_limit(user: str) -> None:
    """Simple in-memory rate limiting per user."""
    now = datetime.utcnow()
    record = rate_limits.get(user)
    if not record or now - record["time"] > WINDOW:
        rate_limits[user] = {"count": 1, "time": now}
        return
    if record["count"] >= MAX_ACTIONS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    record["count"] += 1


def _get_user(token: str = Header(...)) -> str:
    if token not in users:
        raise HTTPException(status_code=401, detail="Invalid token")
    return users[token]


# REST endpoints -------------------------------------------------------------


@router.post("/login")
def login(payload: LoginRequest) -> Dict[str, str]:
    token = str(uuid.uuid4())
    users[token] = payload.username
    logger.info("%s logged in", payload.username)
    return {"token": token}


@router.post("/areas", response_model=Area)
async def save_area(data: AreaCreate, user: str = Depends(_get_user)) -> Area:
    _rate_limit(user)
    poly = Polygon([(lng, lat) for lat, lng in data.coordinates])
    area, _ = geod.geometry_area_perimeter(poly)
    area_sq_km = abs(area) / 1_000_000

    async with lock:
        if data.id and data.id in areas:
            existing = areas[data.id]
            if data.version != existing["version"]:
                raise HTTPException(status_code=409, detail="Version conflict")
            history = existing["history"] + [existing.copy()]
            version = existing["version"] + 1
            area_id = data.id
        else:
            history = []
            version = 1
            area_id = str(uuid.uuid4())

        record = {
            "id": area_id,
            "name": data.name,
            "coordinates": data.coordinates,
            "area_sq_km": area_sq_km,
            "version": version,
            "history": history,
            "updated_at": datetime.utcnow(),
            "user": user,
        }
        areas[area_id] = record
    logger.info("Area %s saved by %s", area_id, user)
    return record  # type: ignore[return-value]


@router.get("/areas", response_model=List[Area])
def get_areas(
    north: float,
    south: float,
    east: float,
    west: float,
    user: str = Depends(_get_user),
) -> List[Area]:
    bbox = Polygon([(west, south), (east, south), (east, north), (west, north)])
    result = []
    for area in areas.values():
        poly = Polygon([(lng, lat) for lat, lng in area["coordinates"]])
        if poly.intersects(bbox):
            result.append(area)
    return result  # type: ignore[return-value]


@router.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.get("/ping")
async def ping() -> Dict[str, str]:
    return {"message": "pong"}


# WebSocket endpoint --------------------------------------------------------


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str) -> None:
    await manager.connect(websocket, token)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast_users()


