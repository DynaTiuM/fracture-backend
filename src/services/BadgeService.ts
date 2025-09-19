import PlayerScoreHistory, { IBadge } from '../models/PlayerScoreHistory';

export class BadgeService {
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
}
