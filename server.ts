import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent cloud storage folder
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');
const BACKUP_FILE = path.resolve(DATA_DIR, 'db_backup.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read database
function readDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading db.json:', e);
    }
  }
  if (fs.existsSync(BACKUP_FILE)) {
    try {
      const content = fs.readFileSync(BACKUP_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading db_backup.json:', e);
    }
  }
  return null;
}

// Write database atomically
function writeDb(data: any) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing db.json:', e);
    return false;
  }
}

// API Routes
app.get('/api/data', (req: Request, res: Response) => {
  const db = readDb();
  if (db) {
    return res.json(db);
  }
  return res.status(404).json({ error: 'Database not initialized' });
});

app.post('/api/data', (req: Request, res: Response) => {
  const newData = req.body;
  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({ error: 'Invalid data' });
  }

  // Purge any deleted workers from database
  if (Array.isArray(newData.deletedWorkerIds) && Array.isArray(newData.workers)) {
    const deletedSet = new Set(newData.deletedWorkerIds);
    newData.workers = newData.workers.filter((w: any) => !deletedSet.has(w.id));
  }

  writeDb(newData);
  return res.json({ success: true, timestamp: new Date().toISOString() });
});

app.delete('/api/workers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();
  if (db && Array.isArray(db.workers)) {
    db.workers = db.workers.filter((w: any) => w.id !== id);
    if (!Array.isArray(db.deletedWorkerIds)) {
      db.deletedWorkerIds = [];
    }
    if (!db.deletedWorkerIds.includes(id)) {
      db.deletedWorkerIds.push(id);
    }
    writeDb(db);
    return res.json({ success: true, message: 'Worker deleted permanently' });
  }
  return res.json({ success: true });
});

app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const db = readDb();
  if (!db || !Array.isArray(db.users)) {
    return res.status(500).json({ error: 'Users database unavailable' });
  }

  const user = db.users.find(
    (u: any) => u.username.toLowerCase() === (username || '').toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە' });
  }

  if (user.active === false) {
    return res.status(403).json({ error: 'ئەم هەژمارە ناچالاک کراوە' });
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  writeDb(db);

  const { password: _, ...userSafe } = user;
  return res.json({ success: true, user: userSafe });
});

// Start server and attach Vite middleware in development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (isProduction: ${isProduction})`);
  });
}

startServer();
