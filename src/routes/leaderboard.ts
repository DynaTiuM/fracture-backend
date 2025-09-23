import { Router } from 'express';
import Player from '../models/Player';
import PlayerScoreHistory from '../models/PlayerScoreHistory';
import CrystalHistory from '../models/CrystalHistory';
import { leaderBoardService } from '../services/LeaderBoardService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const leaderboard = await leaderBoardService.getLeaderboard();
    res.json({ leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
