import { ObjectId } from 'mongodb';
import Crystal from "../models/Crystal";
import CrystalHistory from "../models/CrystalHistory";
import Player from "../models/Player";
import PlayerBonusUsage from "../models/PlayerBonusUsage";
import PlayerScoreHistory, { CrystalActionType, IBadge } from "../models/PlayerScoreHistory";
import { io } from '../websocket/socket';
import { playerScoreHistoryService } from './PlayerScoreHistoryService';
import { ACTIONS_EFFECTS } from '../game/ActionHandler';

export class CrystalService {

  async addAction(playerId: string, action: CrystalActionType) {
    const crystal = await Crystal.findOne();
    if (!crystal) throw new Error("Crystal not found");

    const player = await Player.findOne({ discordId: playerId });
    if (!player) throw new Error("Player not found");

    if (crystal.have_played.includes(playerId)) {
      throw new Error("The player already acted today");
    }

    crystal.have_played.push(playerId);

    const effects = await ACTIONS_EFFECTS[action](playerId);
    
    crystal.durability += effects.crystalDelta;
    await crystal.save();

    const todayScore = effects.scoreDelta;

    await PlayerScoreHistory.findOneAndUpdate(
      { playerId, sessionStart: crystal.sessionStart },
      {
        $push: { dailyScores: { date: new Date(), score: todayScore, action } },
        $inc: { weeklyScore: todayScore },
        $setOnInsert: { badge: null },
      },
      { upsert: true, new: true }
    );

    io.emit("actionAdded", { crystal, player, action, effects });

    return { crystal, player, effects };
  }


  async enableAction() {
      const crystal = await Crystal.findOne();
      if (!crystal) return;
  
      // Clearing actions so that users can act again for the desired day
      crystal.have_played = [];
      await crystal.save();
  
      io.emit('dailyReset', crystal);
  }

  async checkCrystalBreak() {
      const crystal = await Crystal.findOne();
      if (!crystal || !crystal.broken) return false;
  
      const players = await Player.find();
  
      // If the crystal broke, we put scores of every players to 0
      for (const player of players) {
        // We also put the dailyScores to 0
        await PlayerScoreHistory.updateOne(
          { playerId: player.discordId, sessionStart: crystal.sessionStart },
          {
            $push: { dailyScores: { date: new Date(), score: 0 } },
            $set: { weeklyScore: 0 },
          },
          { upsert: true }
        );
  
        io.emit('sessionEnded', { crystal, message: 'The crystal broke! Scores set to 0.' });
  
        return true;
      }
  }

  async assignEndOfSessionBadges() {
      const crystal = await Crystal.findOne();
      if (!crystal) return;
  
      const players = await Player.find();
      const histories = await PlayerScoreHistory.find({ sessionStart: crystal.sessionStart });
  
      for (const player of players) {
        const history = histories.find(h => h.playerId === player.discordId);
        if (!history) continue;
  
        const absorbCount = history.dailyScores.filter(ds => ds.action === 'absorb').length;
        const holdCount = history.dailyScores.filter(ds => ds.action === 'hold').length;
        const repairCount = history.dailyScores.filter(ds => ds.action === 'repair').length;
  
        let badge: Partial<IBadge> | null = null;
  
        if (holdCount > absorbCount) {
          badge = { name: 'Cooperator', type: 'cooperator' };
        } else if (absorbCount > holdCount && !crystal.broken) {
          badge = { name: 'Opportunist', type: 'opportunist' };
        } else if (crystal.broken && player.discordId === crystal.breakerId) {
          badge = { name: 'Traitor', type: 'traitor' };
        } else if (repairCount > Math.max(holdCount, absorbCount)) {
          badge = { name: 'Guardian', type: 'guardian' };
        }
  
        if (badge) {
          await playerScoreHistoryService.assignBadgeToSession(player.discordId, crystal.sessionStart, badge);
        }
      }
  }

  async startNewSession() {
    const crystal = await Crystal.findOne();
    if (!crystal) return;
    
    await CrystalHistory.create({
        sessionStart: crystal.sessionStart,
        sessionEnd: new Date(),
        broken: crystal.broken,
        breakerId: crystal.breakerId,
        finalDurability: crystal.durability
      });

    const newCrystal = this.createNewCrystal();

    io.emit('newSession', newCrystal);
    console.log('New Session beginning!');
  }

  async createNewCrystal() {
      await Crystal.deleteMany({});
      const newCrystal = new Crystal({
      durability: 100,
      broken: false,
      actions: [],
      sessionStartDate: new Date(),
      });
      await newCrystal.save();
  
      return newCrystal;
  }

  async addPoints(playerId: string, points: number) {
    const crystal = await Crystal.findOne();
    if (!crystal) {
      throw new Error('Crystal not found');
    }
    
    const player = await Player.findOne({ discordId: playerId });
    if(!player) {
      throw Error("Player not found while adding points!");
    }
    
    await PlayerScoreHistory.findOneAndUpdate(
      { playerId: playerId, sessionStart: crystal.sessionStart },
      { 
          $push: { dailyScores: { date: new Date(), score: points } },
          $inc: { weeklyScore: points },
          $setOnInsert: { badge: null }
      },
      { upsert: true, new: true }
    );
  }

  async decreaseDurability(amount: number) {
    const crystal = await Crystal.findOne();
    if (!crystal) {
      throw new Error('Crystal not found');
    }

    crystal.durability -= amount;

    if (crystal.durability < 0) {
      crystal.durability = 0;
      crystal.broken = true;
    }

    await crystal.save();
    
    io.emit('crystalUpdated', { durability: crystal.durability, broken: crystal.broken });
  }

  async protectPlayer(playerBonusId: ObjectId, protectorId: string, bonusId: string, targetId: string, duration: number = 1) {
    const now = new Date();

    await PlayerBonusUsage.create({
        playerBonusId: playerBonusId,
        bonusId,
        playerId: protectorId,
        targetId: targetId,
        usedAt: now
    });

    io.emit('PlayerProtected', { protectorId: protectorId, targetId: targetId });
  }

}

export const crystalService = new CrystalService();