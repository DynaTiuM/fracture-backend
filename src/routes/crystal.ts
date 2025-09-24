import { Router } from "express";
import Crystal from "../models/Crystal";
import CrystalHistory from "../models/CrystalHistory";

const router = Router()

router.get('/status', async (req, res) => {
    try {
        // There is supposed to be only one Crystal (as every cristal are deleted after its broken or a session ends)
        // but we sort it to get the last one, in case there is a problem and a crystal is mistakenly not deleted from the MongoDB
        const crystal = await Crystal.findOne().sort({ sessionStart: -1 });
        
        if (!crystal) return res.status(404).json({ message: "Crystal not found!" });
        let crystalStatus = "healthy";
        if(crystal?.durability <= 0) {
            crystalStatus = "broken";
        } else if(crystal?.durability < 33) {
            crystalStatus = "critical";
        } else if(crystal?.durability < 66) {
            crystalStatus = "damaged";
        } else {
            crystalStatus = "healthy";
        }

        res.json(
            crystalStatus
        );
    } catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

router.get('/history', async (req, res) => {
    try {
        const crystalHistory = await CrystalHistory.findOne().sort({ sessionStart: -1 });

        if (!crystalHistory) {
        return res.status(404).json({ message: "No active crystal session" });
        }

        res.json( {
            crystalHistory
        })
    }
    catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

router.get('/session-day', async (req, res) => {
    try {
        const crystal = await Crystal.findOne().sort({ sessionStart: -1 });
        if (!crystal) {
            return res.status(404).json({ message: "No active crystal session" });
        }
        const today = new Date();
        const sessionStart = new Date(crystal.sessionStart);
        const diffDays = Math.floor((today.getTime() - sessionStart.getTime()) / (1000 * 60 * 60 * 24));
        // Adding 1 because the first day is day 1, not day 0
        res.json({ sessionDay: diffDays + 1 });
    } catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});


router.get('/already-played-players', async (req, res) => {
    try {
        const crystal = await Crystal.findOne().sort({ sessionStart: -1 });
        if (!crystal) {
            return res.status(404).json({ message: "No active crystal session" });
        }
        res.json({ alreadyPlayedPlayers: crystal.have_played });
    } catch (err: any) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

export default router;