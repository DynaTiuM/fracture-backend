import Rope from '../models/Rope';
import Player from '../models/Player';
import PlayerScoreHistory, { IBadge, RopeActionType } from '../models/PlayerScoreHistory';
import { BadgeService } from './BadgeService';
import { io as defaultIo } from '../websocket/socket';
import RopeHistory from '../models/RopeHistory';

export class GameService {
  constructor(private io = defaultIo) {}
  private badgeService = new BadgeService();
  private POINTS_PER_PULL = 5;

  async addAction(playerId: string, username: string, action: RopeActionType) {
    const rope = await Rope.findOne();
    if (!rope) throw new Error('Rope not found');

    let player = await Player.findOne({ discordId: playerId });
    if (!player) {
      player = await Player.create({ discordId: playerId, username });
      console.warn(`Player not found, created a new one with player ID: ${playerId}`);
    }

    if (rope.have_played.includes(playerId)) {
      throw new Error('Already acted today');
    }

    rope.have_played.push(playerId);

    if (action === 'pull') rope.durability -= this.POINTS_PER_PULL;
    await rope.save();
    const todayScore = action === 'pull' ? this.POINTS_PER_PULL : 0;

    await PlayerScoreHistory.findOneAndUpdate(
      { playerId, sessionStart: rope.sessionStart },
      { 
        $push: { dailyScores: { date: new Date(), score: todayScore, action } },
        $inc: { weeklyScore: todayScore },
        $setOnInsert: { badge: null }
      },
      { upsert: true, new: true }
    );

    this.io.emit('actionAdded', { rope, player });
    return { rope, player };
  }

  async enableAction() {
    const rope = await Rope.findOne();
    if (!rope) return;

    // Clearing actions so that users can act again for the desired day
    rope.have_played = [];
    await rope.save();

    this.io.emit('dailyReset', rope);
  }

  async checkRopeBreak() {
    const rope = await Rope.findOne();
    if (!rope || !rope.broken) return false;

    const players = await Player.find();

    // If the rope broke, we put scores of every players to 0
    for (const player of players) {

      // We also put the dailyScores to 0
      await PlayerScoreHistory.updateOne(
        { playerId: player.discordId, sessionStart: rope.sessionStart },
        {
          $push: { dailyScores: { date: new Date(), score: 0 } },
          $set: { weeklyScore: 0 },
        },
        { upsert: true }
      );

      this.io.emit('sessionEnded', { rope, message: 'The rope broke! Scores set to 0.' });

      return true;
    }
  }

  async assignEndOfSessionBadges() {
    const rope = await Rope.findOne();
    if (!rope) return;

    const players = await Player.find();
    const histories = await PlayerScoreHistory.find({ sessionStart: rope.sessionStart });

    for (const player of players) {
      const history = histories.find(h => h.playerId === player.discordId);
      if (!history) continue;

      const pullCount = history.dailyScores.filter(ds => ds.action === 'pull').length;
      const holdCount = history.dailyScores.filter(ds => ds.action === 'hold').length;
      const fixCount = history.dailyScores.filter(ds => ds.action === 'fix').length;

      let badge: Partial<IBadge> | null = null;

      if (holdCount > pullCount) {
        badge = { name: 'Cooperator', type: 'cooperator' };
      } else if (pullCount > holdCount && !rope.broken) {
        badge = { name: 'Opportunist', type: 'opportunist' };
      } else if (rope.broken && player.discordId === rope.breakerId) {
        badge = { name: 'Traitor', type: 'traitor' };
      } else if (fixCount > Math.max(holdCount, pullCount)) {
        badge = { name: 'Guardian', type: 'guardian' };
      }

      if (badge) {
        await this.badgeService.assignBadgeToSession(player.discordId, rope.sessionStart, badge);
      }
    }
  }

  async startNewSession() {
    const rope = await Rope.findOne();
    if (!rope) return;
    
    await RopeHistory.create({
      sessionStart: rope.sessionStart,
      sessionEnd: new Date(),
      broken: rope.broken,
      breakerId: rope.breakerId,
      finalDurability: rope.durability
    });

    const newRope = this.createNewRope();

    this.io.emit('newSession', newRope);
    console.log('New Session beginning!');
  }

  async createNewRope() {
    await Rope.deleteMany({});
    const newRope = new Rope({
      durability: 100,
      broken: false,
      actions: [],
      sessionStartDate: new Date(),
    });
    await newRope.save();
  
    return newRope;
  }
}