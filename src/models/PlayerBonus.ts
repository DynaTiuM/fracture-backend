import { Schema, model } from 'mongoose';

export interface IPlayerBonus {
    playerId: string;
    bonusId: string;
    dateAcquired: Date;
    used: boolean;
    erasedBy?: string;
}

const playerBonusSchema = new Schema<IPlayerBonus>({
    playerId: { type: String, required: true },
    bonusId: { type: String, required: true },
    dateAcquired: { type: Date, default: () => new Date() },
    used: { type: Boolean, required: true, default: false },
    erasedBy: {type: String, default: null }
});

export default model<IPlayerBonus>('PlayerBonus', playerBonusSchema);
