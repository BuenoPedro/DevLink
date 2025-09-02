import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import skillRoutes from './routes/skills.routes';
import connectionRoutes from './routes/connections.routes';
import experienceRoutes from './routes/experiences.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
  })
);

// BigInt -> string no JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/experiences', experienceRoutes);

// fallback de erro simples
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Erro interno',
    details: err.details ?? undefined,
  });
});

export default app;
