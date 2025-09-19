import { Router } from 'express';
import Player from '../models/Player';
import PlayerScoreHistory from '../models/PlayerScoreHistory';
import RopeHistory from '../models/RopeHistory';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const lastRopeHistory = await RopeHistory.findOne().sort({ sessionStart: -1 });

    const players = await Player.find();

    const leaderboard = await Promise.all(
      players.map(async (player) => {
        const history = await PlayerScoreHistory.findOne({ 
          playerId: player.discordId,
          sessionStart: lastRopeHistory?.sessionStart
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

    res.json({
      rope: lastRopeHistory
        ? {
            durability: lastRopeHistory.finalDurability,
            broken: lastRopeHistory.broken,
            sessionStartDate: lastRopeHistory.sessionStart,
            breakerId: lastRopeHistory.breakerId
          }
        : null,
      leaderboard,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
