import { Schema, model } from 'mongoose';

export const badges = ['cooperator', 'traitor', 'opportunist', 'guardian'] as const;
export type BadgesType = typeof badges[number];

export const crystalActions = ['absorb', 'hold', 'repair'] as const;
export type CrystalActionType = typeof crystalActions[number];

export interface IBadge {
  name: string;
  type: BadgesType;
  dateEarned: Date;
  discordRoleId?: string;
}

export interface IDailyScore {
  date: Date;
  score: number;
  action: CrystalActionType;
}

export interface IPlayerScoreHistory {
  playerId: string;
  sessionStart: Date;
  dailyScores: IDailyScore[];
  weeklyScore: number;
  badge?: IBadge;
}

const badgeSchema = new Schema<IBadge>({
  name: { type: String, required: true},
  type: { type: String, enum: badges, required: true },
  dateEarned: { type: Date, default: Date.now },
  discordRoleId: { type: String, default: null}
})

const dailyScoreSchema = new Schema<IDailyScore>({
  date: { type: Date, required: true },
  score: { type: Number, required: true },
  action: { type: String, enum: crystalActions, required: true}
});

const playerScoreHistorySchema = new Schema<IPlayerScoreHistory>({
  playerId: { type: String, required: true },
  sessionStart: { type: Date, required: true },
  dailyScores: { type: [dailyScoreSchema], default: [] },
  weeklyScore: { type: Number, default: 0 },
  badge: { type: badgeSchema, default: null }
});

export default model<IPlayerScoreHistory>('PlayerScoreHistory', playerScoreHistorySchema);
