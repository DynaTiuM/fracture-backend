import { Router } from 'express';
import Bonus from '../models/Bonus';
import { playerBonusService } from '../services/PlayerBonusService';
import { playerScoreHistoryService } from '../services/PlayerScoreHistoryService';

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
        const result = await playerScoreHistoryService.hasPlayerPlayedToday(playerId);
        if(result.played) {
            return res.status(403).json({ message: "The player has already played today. Cannot use a bonus afterwards." });
        }
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
        const hasDrown = await playerBonusService.hasPlayerDrawnBonus(playerId);
        if (hasDrown) {
            throw Error("The player has already drawn a chest for this session.");
        }
        const playerBonus = await playerBonusService.giveChestReward(playerId);
        res.status(200).json(playerBonus);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;