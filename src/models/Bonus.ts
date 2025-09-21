import { Schema, model } from 'mongoose';

export const rarity = ['common', 'rare', 'epic', 'legendary', 'mythic'] as const;
export type rarityType = typeof rarity[number];

export type BonusTrigger = 'IMMEDIATE' | 'ON_PLAY' | 'ON_OPEN' | 'NEXT_DAY';

export interface IBonus {
    id: string;
    name: string;
    probability: number;
    rarity: rarityType;
    description: string;
    duration?: number;
    trigger: BonusTrigger;
}

const bonusSchema = new Schema<IBonus>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    probability: { type: Number, required: true, min: 0, max: 100 },
    rarity: { type: String, enum: rarity, required: true },
    description: { type: String, required: true },
    duration: { type: Number, min: 0 },
    trigger: { type: String, enum: ['IMMEDIATE', 'ON_PLAY', 'ON_OPEN', 'NEXT_DAY'], required: true }
})

export default model<IBonus>('Bonus', bonusSchema);