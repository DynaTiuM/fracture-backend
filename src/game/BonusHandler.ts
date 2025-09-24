import Bonus from "../models/Bonus";
import Crystal from "../models/Crystal";
import PlayerBonus from "../models/PlayerBonus";
import PlayerBonusUsage from "../models/PlayerBonusUsage";
import PlayerScoreHistory, { CrystalActionType } from "../models/PlayerScoreHistory";
import { io } from "../websocket/socket";

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
                    effect.scoreDelta += scoreDeltaBase * 2;
                    // crystalDeltaBase = -5 so needs a positive addition in order to get a negative result
                    if(!hasGuardianSeal) {
                        effect.crystalDelta -= 3;
                    }
                }
                break;
            case "2": // Energy Potion
                if (playerId === targetId && action === "absorb") {
                    effect.scoreDelta += scoreDeltaBase;
                    effect.crystalDelta -= crystalDeltaBase;
                }
                break;
            case "3": // Guardian Bucket
                if (playerId === sourceId) {
                    
                    const startOfDay = new Date();
                    startOfDay.setUTCHours(0, 0, 0, 0);
                    const endOfDay = new Date();
                    endOfDay.setUTCHours(23, 59, 59, 999);

                    const nbTargets = playerBonusUsages.filter(
                        u => u.playerId === sourceId && u.bonusId === "3" && u.usedAt >= startOfDay && u.usedAt <= endOfDay
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
                // External Calculation
                break;
            case "6": // Revealing Shard
                if (playerId === sourceId) {
                    effect.scoreDelta += 3;
                }
                break;

            // EPIC
            case "7": // Lantern of Souls
                if (playerId === sourceId && !effect.notes.includes("7_applied")) {
                    effect.scoreDelta += 3;
                    effect.notes.push("7_applied");
                }
                break;
            case "8": // Veil of Illusion
                // Passive Bonus, no specific Action needed
                break;
            case "9": // Seed of Chaos
                // TODO: Maybe activate this directly even if the player still didnt play...
                if (playerId === targetId) {
                    const delta = Math.random() < 0.5 ? 20 : -20;
                    effect.scoreDelta += delta;
                }
                break;
            case "10": // Mirror of the Day
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
                // TODO: verify if it works: add all targets?
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
                    effect.scoreDelta += scoreDeltaBase * 10;
                    // crystalDeltaBase = -5 so needs a positive addition in order to get a negative result
                    if(!hasGuardianSeal) {
                        effect.crystalDelta += crystalDeltaBase * 45;
                    }
                }
                break;

            default:
                break;
            }
        }

        return effect;
    }

    static async stealAllYesterdayPoints() {
        const crystal = await Crystal.findOne();
        if (!crystal) throw new Error("No crystal found!");
        
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const yesterdayStart = new Date(today);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const yesterdayEnd = new Date(today);
        yesterdayEnd.setMilliseconds(-1);
        
        const sessionStart = new Date(crystal.sessionStart);

        const crystalEclipseUsages = await PlayerBonusUsage.find({
            bonusId: "13",
            usedAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
        });

        for (const usage of crystalEclipseUsages) {
            const thiefId = usage.playerId;
            let totalStolen = 0;

            const allPlayers = await PlayerScoreHistory.find({});
            for (const playerHistory of allPlayers) {
                if (playerHistory.playerId === thiefId) continue;

                const lastDailyScore = playerHistory.dailyScores
                    .filter(ds => ds.date >= sessionStart)
                    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

                if (lastDailyScore) {
                    totalStolen += lastDailyScore.score;
                    lastDailyScore.score = 0;
                    await playerHistory.save();
                }
            }

            let thiefHistory = await PlayerScoreHistory.findOne({ playerId: thiefId });
            if (!thiefHistory) {
                thiefHistory = new PlayerScoreHistory({
                    playerId: thiefId,
                    sessionStart: new Date(),
                    dailyScores: [],
                    weeklyScore: 0,
                    badge: null
                });
            }

            let thiefDaily = thiefHistory.dailyScores
                .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

            if (!thiefDaily) {
                thiefDaily = {
                    date: yesterdayEnd,
                    score: totalStolen,
                    action: 'absorb'
                };
                thiefHistory.dailyScores.push(thiefDaily);
            } else {
                thiefDaily.score += totalStolen;
            }

            await thiefHistory.save();

            console.log(`Player ${thiefId} stole ${totalStolen} points from session starting ${sessionStart}`);
        }
    }

    static async setScoreToZeroAndDurability(playerId: string) {
        const crystal = await Crystal.findOne();
        if (!crystal) throw new Error("No crystal found!");

        let playerHistory = await PlayerScoreHistory.findOne({
            playerId,
            sessionStart: crystal.sessionStart
        });

        if (!playerHistory) {
            playerHistory = new PlayerScoreHistory({
                playerId,
                sessionStart: crystal.sessionStart,
                dailyScores: [],
                weeklyScore: 0,
                badge: null
            });
        }

        if (playerHistory.dailyScores && playerHistory.dailyScores.length > 0) {
            playerHistory.dailyScores.forEach(ds => {
                ds.score = 0;
            });
            playerHistory.markModified('dailyScores');
        }
        playerHistory.weeklyScore = 0;
        await playerHistory.save();

        crystal.durability = 1;
        await crystal.save();
    }


    static async erasePlayerBestItem(targetId: string, eraserId: string) {
        
        const inventory = await PlayerBonus.find({ playerId: targetId, used: false });
        if (inventory.length === 0) return;

        const bonusDetails = await Bonus.find({
            id: { $in: inventory.map(b => b.bonusId) }
        });

        const removableItems = inventory.filter(pb => {
            const bonusInfo = bonusDetails.find(b => b.id === pb.bonusId);
            return bonusInfo && (bonusInfo.rarity === 'common' || bonusInfo.rarity === 'rare' || bonusInfo.rarity === 'epic');
        });

        if (removableItems.length === 0) return;

        const rarityOrder: Record<string, number> = {
            common: 1,
            rare: 2,
            epic: 3
        };

        removableItems.sort((a, b) => {
            const getRarityValue = (bonusId: string) => {
                const bonusInfo = bonusDetails.find(b => b.id === bonusId);
                return bonusInfo ? rarityOrder[bonusInfo.rarity] || 0 : 0;
            };
            return getRarityValue(b.bonusId) - getRarityValue(a.bonusId);
        });

        const bestItem = removableItems[0];

        await PlayerBonus.updateOne(
            { _id: bestItem._id },
            { $set: { erasedBy: eraserId } }
        );

        const bonusInfo = bonusDetails.find(b => b.id === bestItem.bonusId);

        return {
            ...bestItem.toObject(),
            bonusName: bonusInfo?.name || null,
            bonusRarity: bonusInfo?.rarity || null
        };
    }

    static async revealPlayerAction(targetId: string, playerId: string) {
        const playerHistory = await PlayerScoreHistory.findOne({ playerId: targetId });
        if (!playerHistory || playerHistory.dailyScores.length === 0) return;
        
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        const playerBonusUsage = await PlayerBonusUsage.findOne( {playerId: playerId, usedAt: { $gte: startOfDay, $lte: endOfDay }, bonusId: "8" });
        if(playerBonusUsage) {
            io.to(playerId).emit("revealAction", {
                playerId: targetId,
                action: "hidden"
            });
            return null;
        }
        const lastAction = playerHistory.dailyScores
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        io.to(playerId).emit("revealAction", {
            playerId: targetId,
            date: lastAction.date,
            action: lastAction.action,
            score: lastAction.score
        });

        return lastAction;
    }



}