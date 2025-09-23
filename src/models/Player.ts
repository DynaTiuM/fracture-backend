import { Schema, model } from 'mongoose';

export interface IPlayer {
    discordId: string;
    username: string;
    createdAt: Date;
}

const playerSchema = new Schema<IPlayer>({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    createdAt: { type: Date, required: true },
});

export default model<IPlayer>('Player', playerSchema);