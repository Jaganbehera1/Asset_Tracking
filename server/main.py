from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
import os

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://asset-tracking-eight.vercel.app"],  # your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Determine absolute DB path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "assets.db")


# Asset Model
class Asset(BaseModel):
    name: str
    model: str
    condition: str
    last_activity: Optional[str]
    status: str
    location: str


# Root API
@app.get("/")
def read_root():
    return {"message": "Asset Tracking API is Running 🚀 Boom 🔥"}


# Get All Assets
@app.get("/api/assets")
def get_assets():
    try:
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
                "location": row[6],
            })
        return assets

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Add Asset
@app.post("/api/assets")
def add_asset(asset: Asset):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO assets (name, model, condition, last_activity, status, location)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (asset.name, asset.model, asset.condition, asset.last_activity, asset.status, asset.location))
        conn.commit()
        conn.close()
        return {"message": "Asset added successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete Asset
@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: int):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM assets WHERE id=?", (asset_id,))
        conn.commit()
        conn.close()
        return {"message": "Asset deleted successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
