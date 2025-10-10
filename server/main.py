from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
import os

app = FastAPI()

# Allow CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://asset-tracking-eight.vercel.app",
        "http://localhost:5173"  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB Path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "assets.db")

# Asset Schema
class Asset(BaseModel):
    name: str
    model: str
    condition: str
    last_activity: Optional[str] = None
    status: str
    location: str

# DB Initialization
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            model TEXT NOT NULL,
            condition TEXT NOT NULL,
            last_activity TEXT,
            status TEXT NOT NULL,
            location TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup():
    init_db()

# Root API
@app.get("/")
def root():
    return {"message": "Asset Tracking API is Running 🚀 Boom 🔥"}

# Get All Assets
@app.get("/api/assets")
def get_assets():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assets")
    rows = cursor.fetchall()
    conn.close()

    assets = []
    for row in rows:
        assets.append({
            "id": row[0],
            "name": row[1],
            "model": row[2],
            "condition": row[3],
            "last_activity": row[4],
            "status": row[5],
            "location": row[6]
        })

    return assets

# Insert Asset
@app.post("/api/assets")
def create_asset(asset: Asset):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO assets (name, model, condition, last_activity, status, location)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (asset.name, asset.model, asset.condition, asset.last_activity, asset.status, asset.location))
    conn.commit()
    conn.close()

    return {"message": "Asset Added Successfully"}

# Delete Asset
@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM assets WHERE id = ?", (asset_id,))
    conn.commit()
    conn.close()

    return {"message": "Asset Deleted Successfully"}

# Update Asset
@app.put("/api/assets/{asset_id}")
def update_asset(asset_id: int, asset: Asset):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE assets SET name = ?, model = ?, condition = ?, last_activity = ?, status = ?, location = ?
        WHERE id = ?
    """, (asset.name, asset.model, asset.condition, asset.last_activity, asset.status, asset.location, asset_id))
    conn.commit()
    conn.close()

    return {"message": "Asset Updated Successfully"}
