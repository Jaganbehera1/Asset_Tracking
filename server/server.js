import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
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
  db.run(`
    CREATE TABLE IF NOT EXISTS asset_entries (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      remarks TEXT
    )
  `);
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Asset Management System API' });
});

// Create entry
app.post('/api/entries', (req, res) => {
  const { id, assetId, timestamp, type, location, remarks } = req.body;
  
  db.run(
    'INSERT INTO asset_entries (id, asset_id, timestamp, type, location, remarks) VALUES (?, ?, ?, ?, ?, ?)',
    [id, assetId, timestamp, type, location, remarks],
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

    // Group entries by asset_id
    const assetsMap = new Map();
    rows.forEach(row => {
      const entry = {
        id: row.id,
        assetId: row.asset_id,
        timestamp: row.timestamp,
        type: row.type,
        location: row.location,
        remarks: row.remarks
      };

      if (!assetsMap.has(row.asset_id)) {
        assetsMap.set(row.asset_id, {
          id: row.asset_id,
          entries: []
        });
      }
      assetsMap.get(row.asset_id).entries.push(entry);
    });

    res.json(Array.from(assetsMap.values()));
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
