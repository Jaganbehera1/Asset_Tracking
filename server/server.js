import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure CORS
// Allow both the deployed origin and localhost for local development
app.use(cors({
  origin: [
    'https://asset-tracking-1.onrender.com', // deployed frontend
    'http://localhost:5173', // Vite dev server
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(join(__dirname, 'assets.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDb();
  }
});

function initDb() {
  // Create table with the full set of columns if it does not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS asset_entries (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      remarks TEXT,
      name TEXT,
      model TEXT,
      condition TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating asset_entries table:', err);
      return;
    }

    // Ensure compatibility with older DBs: add missing columns if any
    db.all("PRAGMA table_info(asset_entries)", [], (err, rows) => {
      if (err) {
        console.error('Error reading table info:', err);
        return;
      }

      const existing = rows.map(r => r.name);
      const toAdd = [];
      if (!existing.includes('name')) toAdd.push("ALTER TABLE asset_entries ADD COLUMN name TEXT");
      if (!existing.includes('model')) toAdd.push("ALTER TABLE asset_entries ADD COLUMN model TEXT");
      if (!existing.includes('condition')) toAdd.push("ALTER TABLE asset_entries ADD COLUMN condition TEXT");

      toAdd.forEach(sql => {
        db.run(sql, (err) => {
          if (err) {
            // It's safe to ignore 'duplicate column' style errors in case of race conditions
            console.error('Error adding column to asset_entries:', err);
          } else {
            console.log('Updated asset_entries schema:', sql);
          }
        });
      });
    });
  });
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Asset Management System API' });
});

// Create entry
app.post('/api/entries', (req, res) => {
  const { id, assetId, timestamp, type, location, remarks, name, model, condition } = req.body;
  
  db.run(
    'INSERT INTO asset_entries (id, asset_id, timestamp, type, location, remarks, name, model, condition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, assetId, timestamp, type, location, remarks || null, name || null, model || null, condition || null],
    (err) => {
      if (err) {
        console.error('Error creating entry:', err);
        res.status(500).json({ error: 'Failed to create entry' });
      } else {
        res.json({ message: 'Entry created successfully' });
      }
    }
  );
});

// Get all assets
app.get('/api/assets', (req, res) => {
  db.all('SELECT * FROM asset_entries', [], (err, rows) => {
    if (err) {
      console.error('Error fetching assets:', err);
      res.status(500).json({ error: 'Failed to fetch assets' });
      return;
    }

    // Group entries by asset_id and include name/model/condition in entries
    const assetsMap = new Map();
    rows.forEach(row => {
      const entry = {
        id: row.id,
        assetId: row.asset_id,
        timestamp: row.timestamp,
        type: row.type,
        location: row.location,
        remarks: row.remarks,
        name: row.name || null,
        model: row.model || null,
        condition: row.condition || null
      };

      if (!assetsMap.has(row.asset_id)) {
        assetsMap.set(row.asset_id, {
          id: row.asset_id,
          entries: []
        });
      }
      assetsMap.get(row.asset_id).entries.push(entry);
    });

    // For each asset, attempt to infer latest name/model/condition from its last entry
    const assets = Array.from(assetsMap.values()).map(asset => {
      const sorted = asset.entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const last = sorted[sorted.length - 1] || {};
      return {
        id: asset.id,
        entries: sorted.map(e => ({
          ...e,
          timestamp: e.timestamp
        })),
        name: last.name || null,
        model: last.model || null,
        condition: last.condition || null
      };
    });

    res.json(assets);
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
