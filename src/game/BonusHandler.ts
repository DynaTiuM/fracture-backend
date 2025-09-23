import PlayerBonusUsage from "../models/PlayerBonusUsage";
import { CrystalActionType } from "../models/PlayerScoreHistory";

export interface ActionEffect {
  crystalDelta: number;
  scoreDelta: number;
  notes: string[];
  extraScore?: { playerId: string; delta: number }[];
}

export class BonusHandler {
    static async getActiveBonuses(playerId: string) {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        const playerBonusUsages = await PlayerBonusUsage.find({
        $or: [
            { targetId: playerId },
            { playerId: playerId },
            { bonusId: "11" }
        ],
        usedAt: { $gte: startOfDay, $lte: endOfDay },
        }).lean();

        return { playerBonusUsages };
    }

    static async getGlobalBonuses() {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        return await PlayerBonusUsage.find({
            bonusId: { $in: ["11", "10"] },
            usedAt: { $gte: startOfDay, $lte: endOfDay },
        }).lean();
    }


    static async calculateBonusEffect(
        playerId: string,
        action: CrystalActionType,
        crystalDeltaBase: number,
        scoreDeltaBase: number
    ): Promise<ActionEffect> {
        const effect: ActionEffect = { crystalDelta: 0, scoreDelta: 0, notes: [], extraScore: [] };
        const { playerBonusUsages } = await this.getActiveBonuses(playerId);

        const globalBonuses = await this.getGlobalBonuses();
        const hasGuardianSeal = globalBonuses.some(u => u.bonusId === "11");

        if(hasGuardianSeal) {
            effect.crystalDelta = (-crystalDeltaBase);
        }

        for (const usage of playerBonusUsages) {
            const targetId = usage.targetId;
            const sourceId = usage.playerId;

            switch (usage.bonusId) {
            // COMMON
            case "1": // Crystal Shard
                if (playerId === targetId && action === "absorb") {
                    effect.scoreDelta += scoreDeltaBase;
                    // crystalDeltaBase = -5 so needs a positive addition in order to get a negative result
                    if(!hasGuardianSeal) {
                        effect.crystalDelta += crystalDeltaBase;
                    }
                }
                break;
            case "2": // Energy Potion
                if (playerId === targetId && action === "absorb") {
                    effect.scoreDelta += scoreDeltaBase * 2;
                }
                break;
            case "3": // Guardian Bucket
                if (playerId === sourceId) {
                    const nbTargets = playerBonusUsages.filter(
                        u => u.playerId === sourceId && u.bonusId === "3"
                    ).length;

                    if (nbTargets === 1) {
                        effect.scoreDelta += 2;
                    }
                }
                else if (playerId === targetId && action === "absorb") {
                    effect.crystalDelta += (-crystalDeltaBase);
                }
                break;

            // RARE
            case "4": // Thorns of Discord
                if (playerId === targetId && action === "absorb") {
                    effect.scoreDelta = 0;
                    if(!hasGuardianSeal) {
                        effect.crystalDelta -= 2;
                    }
                }
                break;
            case "5": // Hand of Forgetfulness
                // ON_OPEN: The best item of the player must not be deleted directly
                break;
            case "6": // Revealing Shard
                if (playerId === sourceId) {
                    effect.scoreDelta += 3;
                }
                break;

            // EPIC
            case "7": // Lantern of Souls
                if (playerId === sourceId && !effect.notes.includes("7_applied")) {
                    effect.scoreDelta += scoreDeltaBase;
                    effect.notes.push("7_applied");
                }
                break;
            case "8": // Veil of Illusion
                // Protection only, not direct bonus
                break;
            case "9": // Seed of Chaos
             if (playerId === targetId) {
                    const delta = Math.random() < 0.5 ? 20 : -20;
                    effect.scoreDelta += delta;
                }
                break;
            case "10": // Mirror of the Day
                // Target all players!!!
                if(playerId === targetId) {
                    if(action === "absorb") {
                        effect.scoreDelta -= 5;
                    }
                    else if(action === "repair") {
                        effect.scoreDelta += (-scoreDeltaBase * 2);
                    }
                    else if (action === "hold") {
                        effect.scoreDelta += 5;
                    }
                }
                break;

            // LEGENDARY
            case "11": // Seal of the Guardian
                // Target all players!!!
                if (action === "absorb") {
                    if (playerId !== sourceId) {
                        effect.extraScore?.push({
                            playerId: sourceId,
                            delta: scoreDeltaBase
                        });
                    }
                }
                break;
            case "12": // Power Spike
                if (playerId === targetId && action === "absorb") {
                    effect.scoreDelta += scoreDeltaBase * 6;
                    // crystalDeltaBase = -5 so needs a positive addition in order to get a negative result
                    if(!hasGuardianSeal) {
                        effect.crystalDelta += crystalDeltaBase * 3;
                    }
                }
                break;

            // MYTHIC
            case "13": // Crystal Eclipse
                // External Calculation
                break;
            case "14": // Ritual of the Void
                // External Calculation
                break;

            case "15": // All or Nothing
                if (playerId === targetId && action === "absorb") {
                    effect.scoreDelta += scoreDeltaBase * 6;
                    // crystalDeltaBase = -5 so needs a positive addition in order to get a negative result
                    if(!hasGuardianSeal) {
                        effect.crystalDelta += crystalDeltaBase * 3;
                    }
                }
                break;

            default:
                break;
            }
        }

        return effect;
    }
}
