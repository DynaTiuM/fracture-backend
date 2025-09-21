import { Router } from 'express';
import Player from '../models/Player';
import PlayerScoreHistory from '../models/PlayerScoreHistory';
import CrystalHistory from '../models/CrystalHistory';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const lastCrystalHistory = await CrystalHistory.findOne().sort({ sessionStart: -1 });

    const players = await Player.find();

    const leaderboard = await Promise.all(
      players.map(async (player) => {
        const history = await PlayerScoreHistory.findOne({ 
          playerId: player.discordId,
          sessionStart: lastCrystalHistory?.sessionStart
        });

        const allTimeScoreAgg = await PlayerScoreHistory.aggregate([
          { $match: { playerId: player.discordId } },
          { $group: { _id: null, total: { $sum: "$weeklyScore" } } }
        ]);
        const allTimeScore = allTimeScoreAgg[0]?.total ?? 0;

        return {
          discordId: player.discordId,
          username: player.username,
          weeklyScore: history?.weeklyScore ?? 0,
          allTimeScore,
          badge: history?.badge ? { name: history.badge.name, type: history.badge.type } : null,
        };
      })
    );

    res.json({ leaderboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
