import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import { createHmac, timingSafeEqual } from 'crypto';
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
const SCORE_SUBMISSION_TTL_MS = 24 * 60 * 60 * 1000;
const SCORE_SUBMISSION_CLEANUP_MS = 15 * 60 * 1000;
const SCORE_RATE_LIMIT = 5;
const SCORE_RATE_WINDOW_MS = 60_000;
const scoreSecret = process.env.VITE_SCORE_SECRET ?? process.env.SCORE_SECRET ?? '';

type UsedScoreSubmission = {
  expiresAt: number;
};

const usedScoreSubmissions = new Map<string, UsedScoreSubmission>();
const scoreSubmissionCleanup = setInterval(() => {
  const now = Date.now();

  for (const [submissionId, entry] of usedScoreSubmissions) {
    if (entry.expiresAt <= now) {
      usedScoreSubmissions.delete(submissionId);
    }
  }
}, SCORE_SUBMISSION_CLEANUP_MS);
scoreSubmissionCleanup.unref?.();

type ScoreRateLimitEntry = {
  count: number;
  resetAt: number;
};

const scoreRateLimitStore = new Map<string, ScoreRateLimitEntry>();
const scoreRateLimitCleanup = setInterval(() => {
  const now = Date.now();

  for (const [ip, entry] of scoreRateLimitStore) {
    if (entry.resetAt <= now) {
      scoreRateLimitStore.delete(ip);
    }
  }
}, SCORE_RATE_WINDOW_MS);
scoreRateLimitCleanup.unref?.();

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

function isValidScoreToken(
  token: string,
  score: number,
  wave: number,
  submissionId: string
): boolean {
  if (!scoreSecret || !/^[a-f0-9]{64}$/i.test(token)) {
    return false;
  }

  const expected = createHmac('sha256', scoreSecret)
    .update(`${score}:${wave}:${submissionId}`)
    .digest('hex');

  return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'));
}

function claimScoreSubmission(submissionId: string): boolean {
  const now = Date.now();
  const existing = usedScoreSubmissions.get(submissionId);

  if (existing && existing.expiresAt > now) {
    return false;
  }

  usedScoreSubmissions.set(submissionId, {
    expiresAt: now + SCORE_SUBMISSION_TTL_MS,
  });
  return true;
}

app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

function scoreRateLimiter(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const now = Date.now();
  const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  let entry = scoreRateLimitStore.get(clientIp);

  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 1,
      resetAt: now + SCORE_RATE_WINDOW_MS,
    };
    scoreRateLimitStore.set(clientIp, entry);
  } else if (entry.count >= SCORE_RATE_LIMIT) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

    res.set({
      'Retry-After': String(retryAfterSeconds),
      'X-RateLimit-Limit': String(SCORE_RATE_LIMIT),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
    });
    return res.status(429).json({
      error: 'Too many score submissions, please try again later',
    });
  } else {
    entry.count += 1;
  }

  res.set({
    'X-RateLimit-Limit': String(SCORE_RATE_LIMIT),
    'X-RateLimit-Remaining': String(SCORE_RATE_LIMIT - entry.count),
    'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
  });
  next();
}

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

app.post('/api/scores', scoreRateLimiter, async (req, res) => {
  const { name, score, wave, submissionId, token } = req.body;

  if (
    typeof name !== 'string' ||
    typeof score !== 'number' ||
    typeof wave !== 'number' ||
    typeof submissionId !== 'string' ||
    typeof token !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      submissionId
    )
  ) {
    return res.status(400).json({ error: 'Invalid submission ID' });
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

  if (!isValidScoreToken(token, score, wave, submissionId)) {
    return res.status(400).json({ error: 'Invalid score token' });
  }

  if (!claimScoreSubmission(submissionId)) {
    return res.status(400).json({ error: 'Score submission has already been used' });
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
