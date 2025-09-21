import { Router } from 'express';
import Bonus from '../models/Bonus';
import PlayerBonus from '../models/PlayerBonus';
import { playerBonusService } from '../services/PlayerBonusService';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const bonuses = await Bonus.find();
        const rarityOrder = ['common', 'rare', 'epic', 'legendary', 'mythic'];

        bonuses.sort((a, b) => {
            return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        });

        res.json(bonuses);

    }
    catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

router.get('/player-bonuses/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const player_bonuses = await PlayerBonus.find({ playerId });
        if(!player_bonuses) {
            res.status(404).json({ message: "No player bonus found"});
        }
        res.json(player_bonuses);
    }
    catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

router.post('/', async (req, res) => {
  const { playerId, bonusId } = req.body;
  try {
    const playerBonus = await playerBonusService.addBonusToPlayer(playerId, bonusId);
    res.status(200).json(playerBonus);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;