import { BonusRegistry } from '../game/BonusRegistry';
import Bonus from '../models/Bonus';
import Crystal from '../models/Crystal';
import Player from '../models/Player';
import PlayerBonus from '../models/PlayerBonus';
import PlayerBonusUsage from '../models/PlayerBonusUsage';
import { io } from '../websocket/socket';
import { bonusService } from './BonusService';

import { Server } from 'socket.io';

export class PlayerBonusService {

  async addBonus(playerId: string, bonusId: string, dateAcquired?: Date) {
    const newPlayerBonus = await PlayerBonus.create({
        playerId,
        bonusId,
        active: false,
        dateAcquired: dateAcquired || new Date(),
    });

    return newPlayerBonus;
  }

  async hasPlayerDrawnBonus(playerId: string): Promise<boolean> {
    const currentSession = await Crystal.findOne().sort({ sessionStart: -1 });
    if (!currentSession) {
      throw new Error("No active crystal session");
    }

    const alreadyOpened = await PlayerBonus.findOne({
      playerId,
      dateAcquired: { $gte: currentSession.sessionStart }
    });

    if (alreadyOpened) {
      return true;
    }
    return false;

  }

  async useBonus(playerBonusId: string, playerId: string, targetIds: string[] = [], useTomorrow: boolean = false) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const playerBonus = await PlayerBonus.findOne({_id: playerBonusId, used: false, erasedBy: null});
    if (!playerBonus) throw new Error("PlayerBonus not found or already used (was the bonus deleted by someone else?)");
    if (playerBonus.playerId !== playerId) throw new Error("This bonus does not belong to the player!");


    let actualTargets: string[] = [];

    if (playerBonus.bonusId === "10" || playerBonus.bonusId === "11") {
      const allPlayers = await Player.find({}, "discordId");
      actualTargets = allPlayers.map(p => p.discordId);
    } else {
      actualTargets = targetIds.length ? targetIds : [playerId];
    }

    const usedAt = new Date();
    if (useTomorrow) usedAt.setDate(usedAt.getDate() + 1);
    usedAt.setHours(0, 0, 0, 0);

    if (!useTomorrow) {
      const alreadyUsedToday = await PlayerBonusUsage.findOne({
        playerId,
        usedAt: { $gte: usedAt }
      });
      if (alreadyUsedToday) {
        throw new Error("A bonus has already been used by the user today!");
      }
      
      if (["13", "14", "11", "10"].includes(playerBonus?.bonusId)) {
        const existing = await PlayerBonusUsage.findOne({
          bonusId: playerBonus.bonusId,
          usedAt: { $gte: startOfDay, $lte: endOfDay }
        });
        if (existing) {
          throw new Error(`Bonus ${playerBonus.bonusId} has already been used today!`);
        }
      }

      const crystal = await Crystal.findOne({});
      const alreadyPlayed = actualTargets.filter(t => crystal?.have_played.includes(t));
      if (alreadyPlayed.length && !["6", "7"].includes(playerBonus?.bonusId)) {
        return { success: false, message: `Targets already played today: ${alreadyPlayed.join(', ')}` };
      }
    }

    const bonusDef = BonusRegistry[playerBonus.bonusId];
    if (!bonusDef) throw new Error("Bonus Unknown!");

    const usageRecords = [];

    for (const targetId of actualTargets) {
      const usage = await PlayerBonusUsage.create({
        playerBonusId: playerBonus._id,
        bonusId: playerBonus.bonusId,
        playerId: playerBonus.playerId,
        targetId,
        usedAt,
      });

      usageRecords.push(usage);

      await bonusDef.applyEffect({
        playerBonusId: playerBonus._id,
        playerId: playerBonus.playerId,
        bonusId: playerBonus.bonusId,
        targetIds: actualTargets,
        date: usedAt
      });
    }
    
    playerBonus.used = true;
    playerBonus.save();

    return { success: true, usageRecords };
  }


  async getPlayerBonus(playerId: string) {
    const allBonuses = await PlayerBonus.find({
      playerId,
      used: false,
      erasedBy: null
    });

    const enrichedBonuses = await Promise.all(
      allBonuses.map(async (playerBonus) => {
        const bonus = await Bonus.findOne({ id: playerBonus.bonusId });
        return {
          ...playerBonus.toObject(),
          name: bonus?.name,
          description: bonus?.description,
          rarity: bonus?.rarity,
          targetMode: bonus?.targetMode
        };
      })
    );

    return enrichedBonuses;
  }

  async giveChestReward(playerId: string) {
    const randomBonus = await bonusService.drawRandomBonus(playerId);
    const playerBonus = await PlayerBonus.create({ playerId, bonusId: randomBonus.id, dateAcquired: new Date() });
    const bonus = await Bonus.findOne({ id: playerBonus.bonusId })

    io.to(playerId).emit("bonusDrawn", bonus);
    return { playerBonus, bonus };
  }

  async processOnOpen(playerId: string, io: Server) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const usages = await PlayerBonusUsage.find({
      targetId: playerId,
      usedAt: { $gte: startOfDay, $lt: endOfDay }
    });

    const bonusToNotify = [];

    for (const usage of usages) {
        const def = BonusRegistry[usage.bonusId];
        if (def?.trigger === 'ON_OPEN') {
          const bonus = await Bonus.findOne({ id: usage.bonusId });
          bonusToNotify.push({ from: usage.playerId, bonus });
        }
    }
    return bonusToNotify;
  }

  async processOnPlay(playerId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const usages = await PlayerBonusUsage.find({
      targetId: playerId,
      usedAt: { $gte: startOfDay, $lt: endOfDay }
    });

    const bonusToNotify = [];

    for (const usage of usages) {
      const def = BonusRegistry[usage.bonusId];
      if (def?.trigger === 'ON_PLAY') {
        const bonus = await Bonus.findOne({ id: usage.bonusId });
        bonusToNotify.push({ from: usage.playerId, bonus });
      }
    }
    return bonusToNotify;
  }
}

export const playerBonusService = new PlayerBonusService();
