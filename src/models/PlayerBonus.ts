import { Schema, model } from 'mongoose';

export interface IPlayerBonus {
    playerId: string;
    bonusId: string;
    dateAcquired: Date;
    active: boolean;
    expiresAt?: Date;
}

const playerBonusSchema = new Schema<IPlayerBonus>({
    playerId: { type: String, required: true },
    bonusId: { type: String, required: true },
    dateAcquired: { type: Date, default: () => new Date() },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
});

export default model<IPlayerBonus>('PlayerBonus', playerBonusSchema);
