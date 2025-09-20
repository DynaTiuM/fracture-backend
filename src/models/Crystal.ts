import { Schema, model } from 'mongoose';


export interface ICrystal {
    durability: number;
    have_played: string[];
    broken: boolean;
    sessionStart: Date;
    breakerId?: string;
}

const crystalSchema = new Schema<ICrystal>({
    durability: { type: Number, default: 100},
    have_played : [ String ],
    broken: { type: Boolean, default: false },
    sessionStart: { type: Date, default: Date.now }
})

export default model<ICrystal>('Crystal', crystalSchema);