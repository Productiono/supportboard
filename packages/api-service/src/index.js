import express from 'express';
import { config } from './config.js';
import { requireAuth, requireRole } from './auth.js';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/private', requireAuth(), (req, res) => {
  res.json({ ok: true, user: req.user });
});

app.get('/admin', requireAuth(), requireRole('admin'), (req, res) => {
  res.json({ ok: true, admin: true });
});

app.listen(config.port, () => {
  console.log(`API service listening on port ${config.port}`);
});
