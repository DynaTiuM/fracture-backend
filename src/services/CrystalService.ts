import Crystal from "../models/Crystal";
import CrystalHistory from "../models/CrystalHistory";
import Player from "../models/Player";
import PlayerScoreHistory, { CrystalActionType, IBadge } from "../models/PlayerScoreHistory";
import { io as defaultIo } from '../websocket/socket';
import { PlayerScoreHistoryService } from "./PlayerScoreHistoryService";

export class CrystalService {
    
    private playerScoreHistoryService = new PlayerScoreHistoryService();
    constructor(private io = defaultIo) {}
    private POINTS_PER_PULL = 5;
    

    async addAction(playerId: string, username: string, action: CrystalActionType) {
        const crystal = await Crystal.findOne();
        if (!crystal) throw new Error('Crystal not found');

        let player = await Player.findOne({ discordId: playerId });
        if (!player) {
        player = await Player.create({ discordId: playerId, username });
        console.warn(`Player not found, created a new one with player ID: ${playerId}`);
        }

        if (crystal.have_played.includes(playerId)) {
        throw new Error('Already acted today');
        }

        crystal.have_played.push(playerId);

        if (action === 'absorb') crystal.durability -= this.POINTS_PER_PULL;
        await crystal.save();
        const todayScore = action === 'absorb' ? this.POINTS_PER_PULL : 0;

        await PlayerScoreHistory.findOneAndUpdate(
        { playerId, sessionStart: crystal.sessionStart },
        { 
            $push: { dailyScores: { date: new Date(), score: todayScore, action } },
            $inc: { weeklyScore: todayScore },
            $setOnInsert: { badge: null }
        },
        { upsert: true, new: true }
        );

        this.io.emit('actionAdded', { crystal, player });
        return { crystal, player };
    }

    async enableAction() {
        const crystal = await Crystal.findOne();
        if (!crystal) return;
    
        // Clearing actions so that users can act again for the desired day
        crystal.have_played = [];
        await crystal.save();
    
        this.io.emit('dailyReset', crystal);
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
    
          this.io.emit('sessionEnded', { crystal, message: 'The crystal broke! Scores set to 0.' });
    
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
          const fixCount = history.dailyScores.filter(ds => ds.action === 'fix').length;
    
          let badge: Partial<IBadge> | null = null;
    
          if (holdCount > absorbCount) {
            badge = { name: 'Cooperator', type: 'cooperator' };
          } else if (absorbCount > holdCount && !crystal.broken) {
            badge = { name: 'Opportunist', type: 'opportunist' };
          } else if (crystal.broken && player.discordId === crystal.breakerId) {
            badge = { name: 'Traitor', type: 'traitor' };
          } else if (fixCount > Math.max(holdCount, absorbCount)) {
            badge = { name: 'Guardian', type: 'guardian' };
          }
    
          if (badge) {
            await this.playerScoreHistoryService.assignBadgeToSession(player.discordId, crystal.sessionStart, badge);
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

        this.io.emit('newSession', newCrystal);
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
}
