import { ObjectId } from 'mongodb';
import type { BonusTrigger } from '../models/Bonus';
import { BonusHandler } from "../game/BonusHandler";
import { io } from '../websocket/socket';

export interface BonusContext {
    playerBonusId: ObjectId;
    playerId: string;
    bonusId: string;
    targetIds?: string[];
    date: Date;
}

export interface BonusDefinition {
    id: string;
    trigger: BonusTrigger;
    applyEffect: (ctx: BonusContext) => Promise<void>;
}

export const BonusRegistry: Record<string, BonusDefinition> = {
    "1": {
        id: "Crystal Shard",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Crystal Shard activated: Choosing the absorb action will grant you 10 bonus points, but it will also inflict 3 extra damage to the crystal."
            });
        }
    },
    "2": {
        id: "Energy Potion",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Energy Potion activated: Choosing the absorb action will grant you 5 bonus points, without harming the crystal."
            });
        }
    },
    "3": {
        id: "Guardian Bucket",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId, targetIds }) => {
            if(targetIds?.length === 2) {
                io.to(playerId).emit("bonusPlayerMessage", {
                    message: "Guardian Bucket activated: You protected 2 players from crystal damage."
                });
            }
            else if(targetIds?.length === 1) {
                io.to(playerId).emit("bonusPlayerMessage", {
                    message: "Guardian Bucket activated: You protected 1 player from crystal damage. Your next action will grant you 2 bonus points."
                });
            }
        }
    },
    "4": {
        id: "Thorns of Discord",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Thorns of Discord activated: You cursed a player. If they choose the absorb action, it will grant them 0 points and inflict 2 extra damage to the crystal."
            });
        }
    },
    "5": {
        id: "Hand of Forgetfulness",
        trigger: "ON_OPEN",
        applyEffect: async ({ targetIds, playerId }) => {
            const targetId = targetIds ? targetIds[Math.floor(Math.random() * targetIds.length)] : undefined;
            if (!targetId) throw Error(`The targeted player hasn't been found! Targeted Player: ${targetId}`);
            const bonusItem = await BonusHandler.erasePlayerBestItem(targetId, playerId);
            if(bonusItem) {
                io.to(playerId).emit("bonusPlayerMessage", {
                    message: `Hand of Forgetfulness activated: You removed the following bonus from their inventory: ${bonusItem.bonusName} (rarity: ${bonusItem.bonusRarity}).`
                });
            }
            else {
                io.to(playerId).emit("bonusPlayerMessage", {
                    message: `An error occured while erasing a player bonus, please contact your administrator with the following information - TargetId: ${targetId}, PlayerId: ${playerId}`
                });
            }
        }
    },
    "6": {
        id: "Revealing Shard",
        trigger: "IMMEDIATE",
        applyEffect: async ({ targetIds, playerId }) => {
            const targetId = targetIds ? targetIds[Math.floor(Math.random() * targetIds.length)] : undefined;
            if (!targetId) throw Error(`The targeted player hasn't been found! Targeted Player: ${targetId}`);
            await BonusHandler.revealPlayerAction(targetId, playerId);
            io.to(playerId).emit("additionalBonusPlayerMessage", {
                playerId,
                message: "Revealing Shard activated: Your next action will grant 3 additional points."
            });
        }
    },
    "7": {
        id: "Lantern of Souls",
        trigger: "IMMEDIATE",
        applyEffect: async ({ targetIds, playerId }) => {
            if (!targetIds || targetIds.length === 0) return;
            for (const targetId of targetIds) {
                await BonusHandler.revealPlayerAction(targetId, playerId);
            }
            io.to(playerId).emit("additionalBonusPlayerMessage", {
                playerId,
                message: "Lantern of Souls activated: Your next action will grant 3 additional points."
            });
        }
    },
    "8": {
        id: "Veil of Illusion",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Veil of Illusion activated: Any attempt to reveal your action today will fail."
            });
        }
    },
    "9": {
        id: "Seed of Chaos",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Seed of Chaos activated: You will find out tomorrow whether the player gained or lost 20 points."
            });
        }
    },
    "10": {
        id: "Mirror of the Day",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Mirror of the Day activated: Today's points are reversed (absorb gives -5, repair gives 2, hold gives 5)."
            });
        }
    },
    "11": {
        id: "Seal of the Guardian",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Seal of the Guardian activated: Crystal is protected for today. Any points gained from the absorb action by other players will be transferred to you."
            });
        }
    },
    "12": {
        id: "Power Spike",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Power Spike activated: Choosing the absorb action will grant you 30 bonus points, but it will also inflict 15 extra damage to the crystal."
            });
        }
    },
    "13": {
        id: "Crystal Eclipse",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Crystal Eclipse activated: All points earned by other players today (even negative ones!) will be transferred to you."
            });
        }
    },
    "14": {
        id: "Ritual of the Void",
        trigger: "ON_OPEN",
        applyEffect: async ({ playerId }) => {
            await BonusHandler.setScoreToZeroAndDurability(playerId);
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "Ritual of the Void activated: Your session score has been reset to 0, and the crystal's durability is now equal to 1. As a consequence, the next absorption will destroy the crystal!"
            });
        }
    },
    "15": {
        id: "All or Nothing",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            io.to(playerId).emit("bonusPlayerMessage", {
                message: "All or Nothing activated: Choosing the absorb action will grant you 50 bonus points, but it will also inflict 45 extra damage to the crystal."
            });
        }
    },
    
};
