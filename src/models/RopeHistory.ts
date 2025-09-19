import { Schema, model } from 'mongoose';

const ropeHistorySchema = new Schema({
  sessionStart: { type: Date, required: true },
  sessionEnd: { type: Date, required: true },
  broken: { type: Boolean, default: false },
  breakerId: { type: String, default: null },
  finalDurability: { type: Number, required: true }
});

export default model('RopeHistory', ropeHistorySchema);
