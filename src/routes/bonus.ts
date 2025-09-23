import { Router } from 'express';
import Bonus from '../models/Bonus';
import { playerBonusService } from '../services/PlayerBonusService';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const bonus = await Bonus.find();
        const rarityOrder = ['common', 'rare', 'epic', 'legendary', 'mythic'];

        bonus.sort((a, b) => {
            return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        });

        res.json(bonus);

    }
    catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

router.get('/player-bonus/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const player_bonus = await playerBonusService.getPlayerBonus(playerId);
        if(!player_bonus) {
            res.status(404).json({ message: "No player bonus found"});
        }
        res.json(player_bonus);
    }
    catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

router.post('/add', async (req, res) => {
    const { playerId, bonusId } = req.body;
    try {
        const playerBonus = await playerBonusService.addBonus(playerId, bonusId);
        res.status(200).json(playerBonus);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/use', async (req, res) => {
    const { playerBonusId, playerId, targetIds, useTomorrow = false } = req.body;
    try {
        const playerBonus = await playerBonusService.useBonus(playerBonusId, playerId, targetIds, useTomorrow);

        if (playerBonus.success === false) {
            return res.status(409).json({ message: playerBonus.message });
        }

        res.status(200).json(playerBonus);
    }
    catch (err: any) {
        res.status(500).json({ message: err.message });
    }

});

router.post('/draw', async (req, res) => {
    const { playerId } = req.body;
    try {
        const playerBonus = await playerBonusService.giveChestReward(playerId);
        res.status(200).json(playerBonus);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;