import { Schema, model } from 'mongoose';

export const rarity = ['common', 'rare', 'epic', 'legendary', 'mythic'] as const;
export type rarityType = typeof rarity[number];


export interface IBonus {
    name: string;
    probability: number;
    rarity: rarityType;
    description: string;
    duration?: number;  
}

const bonusSchema = new Schema<IBonus>({
    name: { type: String, required: true },
    probability: { type: Number, required: true, min: 0, max: 100 },
    rarity: { type: String, enum: rarity, required: true },
    description: { type: String, required: true },
    duration: { type: Number, min: 0 }
})

export default model<IBonus>('Bonus', bonusSchema);