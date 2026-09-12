import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || (isProd ? 5000 : 3001);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const MAX_WAVE = 999;
const MAX_SCORE_DB = 2_147_483_647;

function maxTheoreticalScore(maxWave: number): number {
  let totalEnemies = 0;
  let maxScore = 0;
  for (let w = 1; w <= maxWave; w++) {
    const count = 3 + Math.floor((w - 1) * 1.5);
    for (let k = 0; k < count; k++) {
      totalEnemies += 1;
      maxScore += 100 * totalEnemies;
    }
  }
  return maxScore;
}

app.use(cors());
app.use(express.json());

app.get('/api/leaderboard', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT name, score, wave, created_at FROM leaderboard ORDER BY score DESC LIMIT 10'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/scores', async (req, res) => {
  const { name, score, wave } = req.body;

  if (typeof name !== 'string' || typeof score !== 'number' || typeof wave !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (!Number.isInteger(score) || !Number.isInteger(wave)) {
    return res.status(400).json({ error: 'Score and wave must be integers' });
  }

  if (score < 0 || wave < 1) {
    return res.status(400).json({ error: 'Invalid score or wave' });
  }

  if (wave > MAX_WAVE) {
    return res.status(400).json({ error: 'Wave value out of range' });
  }

  if (score > MAX_SCORE_DB) {
    return res.status(400).json({ error: 'Score exceeds maximum storable value' });
  }

  const theoreticalMax = maxTheoreticalScore(wave);
  if (score > theoreticalMax) {
    return res.status(400).json({ error: 'Score exceeds maximum achievable for this wave' });
  }

  const cleanName = name.trim().toUpperCase().slice(0, 16) || 'ANON';

  try {
    await pool.query(
      'INSERT INTO leaderboard (name, score, wave) VALUES ($1, $2, $3)',
      [cleanName, score, wave]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Score submit error:', err);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
