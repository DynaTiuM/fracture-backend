import Crystal from '../models/Crystal';
import PlayerScoreHistory, { IBadge } from '../models/PlayerScoreHistory';

export class PlayerScoreHistoryService {
  async assignBadgeToSession(playerId: string, sessionStart: Date, badge: Partial<IBadge>) {
    const newBadge: IBadge = {
      name: badge.name!,
      type: badge.type!,
      dateEarned: new Date(),
      discordRoleId: badge.discordRoleId || undefined,
    };

    await PlayerScoreHistory.updateOne(
      { playerId, sessionStart },
      { badge: newBadge },
      { upsert: true }
    );

    console.log(`Badge "${newBadge.name}" attributed to the player ${playerId} for the session ${sessionStart}`);
  }

  async hasPlayerPlayedToday(playerId: string): Promise<{ played: boolean; action?: string }> {
    const crystal = await Crystal.findOne({ "have_played": playerId }).lean();
    // No crystal found with the player in have_played, which means that the player hasn't played today
    if (!crystal) return { played: false };

    // Retrieving the last action made by the player
    const playerHistory = await PlayerScoreHistory.findOne({ playerId }).sort({ "dailyScores.date": -1 }).lean();

    const lastScore = playerHistory?.dailyScores?.[0];

    return { 
      played: true, 
      action: lastScore?.action 
    };
  }

}
export const playerScoreHistoryService = new PlayerScoreHistoryService();
