import { Router } from "express";
import Crystal from "../models/Crystal";
import CrystalHistory from "../models/CrystalHistory";

const router = Router()

router.get('/', async (req, res) => {
    try {
        // There is supposed to be only one Crystal (as every cristal are deleted after its broken or a session ends)
        // but we sort it to get the last one, in case there is a problem and a crystal is mistakenly not deleted from the MongoDB
        const crystal = await Crystal.findOne().sort({ sessionStart: -1 });
        if (!crystal) return res.status(404).json({ message: "Crystal not found!" });
        res.json(
            crystal
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

export default router;