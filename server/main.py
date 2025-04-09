from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization
def init_db():
    conn = sqlite3.connect('assets.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS asset_entries (
            id TEXT PRIMARY KEY,
            asset_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            location TEXT NOT NULL,
            remarks TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class AssetEntry(BaseModel):
    id: str
    asset_id: str
    timestamp: str
    type: str
    location: str
    remarks: Optional[str] = None

@app.post("/api/entries")
async def create_entry(entry: AssetEntry):
    conn = sqlite3.connect('assets.db')
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO asset_entries (id, asset_id, timestamp, type, location, remarks)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (entry.id, entry.asset_id, entry.timestamp, entry.type, entry.location, entry.remarks))
        conn.commit()
        return {"message": "Entry created successfully"}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/assets")
async def get_assets():
    conn = sqlite3.connect('assets.db')
    c = conn.cursor()
    try:
        c.execute('''
            SELECT asset_id, GROUP_CONCAT(json_object(
                'id', id,
                'asset_id', asset_id,
                'timestamp', timestamp,
                'type', type,
                'location', location,
                'remarks', remarks
            )) as entries
            FROM asset_entries
            GROUP BY asset_id
        ''')
        rows = c.fetchall()
        
        assets = []
        for row in rows:
            asset_id, entries_json = row
            entries = [json.loads(entry) for entry in entries_json.split(',')]
            assets.append({
                "id": asset_id,
                "entries": entries
            })
        
        return assets
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)