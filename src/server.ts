import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import './bot/DiscordBot';
import { initSocket } from './websocket/socket';
import { SchedulerService } from './services/SchedulerService';

import actionRoute from './routes/action';
import actionLeaderboard from './routes/leaderboard';
import actionPing from './routes/ping';
import actionCrystal from './routes/crystal';
import actionBonus from './routes/bonus';
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));


const httpServer = createServer(app);

initSocket(httpServer);
app.use(express.json());

app.use('/api/action', actionRoute);
app.use('/api/leaderboard', actionLeaderboard);
app.use('/api/ping', actionPing);
app.use('/api/crystal', actionCrystal);
app.use('/api/bonus', actionBonus);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  const scheduler = new SchedulerService();
  scheduler.startDailyTasks();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
