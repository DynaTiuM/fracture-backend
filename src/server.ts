import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import './bot/DiscordBot';
import { initSocket } from './websocket/socket';
import { SchedulerService } from './services/SchedulerService';
import actionLeaderboard from './routes/leaderboard';
import actionPing from './routes/ping';
import actionCrystal from './routes/crystal';
import actionBonus from './routes/bonus';
import actionToken from './routes/token';
import actionPlayer from './routes/players';
import cors from "cors";

import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' https://cdn.ngrok.com; " +
    "connect-src 'self' https://d5ad26664ebd.ngrok-free.app/ https://discord.com https://cdn.ngrok.com; " +
    "img-src 'self' data: blob: https://cdn.ngrok.com; " +
    "style-src 'self' 'unsafe-inline' https://cdn.ngrok.com;"
  );
  next();
});

const httpServer = createServer(app);

initSocket(httpServer);
app.use(express.json());

app.use('/api/leaderboard', actionLeaderboard);
app.use('/api/ping', actionPing);
app.use('/api/crystal', actionCrystal);
app.use('/api/bonus', actionBonus);
app.use('/api/token', actionToken);
app.use('/api/players', actionPlayer);

const FRONTEND_PORT = 5173;
app.use(
  '/',
  createProxyMiddleware({
    target: `http://localhost:${FRONTEND_PORT}`,
    changeOrigin: true,
  })
);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  const scheduler = new SchedulerService();
  scheduler.startDailyTasks();

  httpServer.listen(PORT, () => {
    console.log(`Server + Front running on http://localhost:${PORT}`);
  });
});
