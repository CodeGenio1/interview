import { model, Schema, InferSchemaType } from 'mongoose';

const Score = new Schema({
  title: String,
  privacy: { type: String, enum: ['public', 'private'] },
});

type IScore = InferSchemaType<typeof Score>;

export const ScoreModel = model<IScore>('Score', Score);
