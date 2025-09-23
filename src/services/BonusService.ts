import Bonus, { IBonus } from "../models/Bonus";
import { playerBonusService } from "./PlayerBonusService";

export class BonusService {
    async drawRandomBonus(playerId: string): Promise<IBonus> {
        const hasAlreadyDrawn = await playerBonusService.hasPlayerDrawnBonus(playerId);

        if (hasAlreadyDrawn) throw new Error("Player has already drawn a bonus today");
        
        const bonus = await Bonus.find();
        const totalProbability = bonus.reduce((sum, b) => sum + b.probability, 0);
        const random = Math.random() * totalProbability;
        
        let cumulative = 0;
        for (const bonus_ of bonus) {
            cumulative += bonus_.probability;
            if (random <= cumulative) return bonus_;
        }

        // If there is the problem, we return the first one...
        return bonus[0];
    }
}

export const bonusService = new BonusService();
