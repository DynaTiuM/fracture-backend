import { ObjectId } from 'mongodb';
import type { BonusTrigger } from '../models/Bonus';
import { crystalService } from '../services/CrystalService'

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
            await crystalService.addPoints(playerId, 10);
            await crystalService.decreaseDurability(3);
        }
    },
    "2": {
        id: "Energy Potion",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
            await crystalService.addPoints(playerId, 5);
        }
    },
    "3": {
        id: "Guardian Bucket",
        trigger: "ON_PLAY",
        applyEffect: async ({ playerBonusId, playerId, targetIds, bonusId }) => {
            if (!targetIds || targetIds.length === 0) return;
            if(targetIds?.length > 2) {
                throw Error("The number of targets cannot be > 2!");
            }
            if(targetIds?.length === 1) {
                await crystalService.addPoints(playerId, 2);
            }
            for (const targetId of targetIds || [playerId]) {
                await crystalService.protectPlayer(playerBonusId, playerId, bonusId, targetId, 1);
            }
        }
    },

    // RARE
    /*"Thorns of Discord": {
        id: "Thorns of Discord",
        trigger: "ON_PLAY",
        applyEffect: async ({ targetId }) => {
        if (!targetId) return;
        await crystalService.nullifyNextAbsorb(targetId);
        await crystalService.decreaseDurability(5);
        }
    },
    "Hand of Forgetfulness": {
        id: "Hand of Forgetfulness",
        trigger: "ON_OPEN",
        applyEffect: async ({ targetId }) => {
        if (!targetId) return;
        await crystalService.eraseBestItem(targetId);
        }
    },
    "Revealing Shard": {
        id: "Revealing Shard",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId, targetId }) => {
        if (!targetId) return;
        await crystalService.revealAction(targetId);
        await crystalService.addPoints(playerId, 3);
        }
    },

    // EPIC
    "Lantern of Souls": {
        id: "Lantern of Souls",
        trigger: "ON_OPEN",
        applyEffect: async ({ targetId }) => {
        if (!targetId) return;
        await crystalService.showLastActions(targetId, 2);
        }
    },
    "Veil of Illusion": {
        id: "Veil of Illusion",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
        await crystalService.protectAction(playerId);
        }
    },
    "Seed of Chaos": {
        id: "Seed of Chaos",
        trigger: "ON_OPEN",
        applyEffect: async ({ targetId }) => {
        if (!targetId) return;
        await crystalService.addRandomPoints(targetId, 15); // +15 ou -15
        }
    },
    "Mirror of the Day": {
        id: "Mirror of the Day",
        trigger: "IMMEDIATE",
        applyEffect: async ({ playerId }) => {
        await crystalService.invertTodayPoints(playerId);
        }
    },

    // LEGENDARY
    "Seal of the Guardian": {
        id: "Seal of the Guardian",
        trigger: "NEXT_DAY",
        applyEffect: async ({ playerId }) => {
        await crystalService.protectCrystal(playerId);
        }
    },
    "Broken Clock": {
        id: "Broken Clock",
        trigger: "NEXT_DAY",
        applyEffect: async ({ playerId }) => {
        await crystalService.grantTwoActions(playerId);
        }
    },

    // MYTHIC
    "Totem of Immunity": {
        id: "Totem of Immunity",
        trigger: "NEXT_DAY",
        applyEffect: async ({ playerId }) => {
        await crystalService.immunizePoints(playerId);
        }
    },
    "Pact Link": {
        id: "Pact Link",
        trigger: "ON_OPEN",
        applyEffect: async ({ playerId }) => {
        await crystalService.forceSameAction(playerId, 3);
        }
    },
    "Crystal Eclipse": {
        id: "Crystal Eclipse",
        trigger: "ON_OPEN",
        applyEffect: async ({ playerId }) => {
        await crystalService.stealAllTodayPoints(playerId);
        }
    },
    "Ritual of the Void": {
        id: "Ritual of the Void",
        trigger: "ON_OPEN",
        applyEffect: async ({ playerId }) => {
        await crystalService.setScoreToZero(playerId);
        await crystalService.setCrystalDurability(1);
        }
    },*/
};
