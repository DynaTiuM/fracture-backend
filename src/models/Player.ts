import { Schema, model } from 'mongoose';

export interface IPlayer {
    discordId: string;
    username: string;
}


const playerSchema = new Schema<IPlayer>({
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true }
});

export default model<IPlayer>('Player', playerSchema);