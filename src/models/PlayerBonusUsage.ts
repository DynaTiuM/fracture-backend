import { Schema, model } from 'mongoose';

export interface IPlayerBonusUsage {
    playerBonusId: string;
    bonusId: string;
    playerId: string;
    targetId: string;
    usedAt: Date;
}

const playerBonusUsageSchema = new Schema<IPlayerBonusUsage>({
    playerBonusId: { type: String, required: true },
    bonusId: { type: String, required: true },
    playerId: { type: String, required: true },
    targetId: { type: String, required: true },
    usedAt: { type: Date, required: true }
});

export default model<IPlayerBonusUsage>('PlayerBonusUsage', playerBonusUsageSchema);
