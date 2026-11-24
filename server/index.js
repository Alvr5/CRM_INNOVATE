import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, '..', 'crm.db'));
const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
db.exec(schema);

app.get('/api/roles', (req, res) => {
  const rows = db.prepare('SELECT * FROM roles').all();
  res.json(rows.map(r => ({ ...r, permissions: r.permissions ? JSON.parse(r.permissions) : [], isSystem: !!r.is_system })));
});

app.post('/api/roles', (req, res) => {
  const { name, description, permissions = [], isSystem = false } = req.body;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const now = new Date().toISOString();
  db.prepare('INSERT INTO roles (id,name,description,permissions,is_system,created_at,updated_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, name, description, JSON.stringify(permissions), isSystem ? 1 : 0, now, now);
  res.json({ id, name, description, permissions, isSystem, createdAt: now, updatedAt: now });
});

app.listen(3001, () => console.log('API on http://localhost:3001'));
