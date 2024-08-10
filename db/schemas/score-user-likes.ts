import mongoose, { model, Schema, InferSchemaType } from 'mongoose';

const ScoreUserLike = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Score',
    required: true
  }
});

type IScoreUserLike = InferSchemaType<typeof ScoreUserLike>;

export const ScoreModel = model<IScoreUserLike>('ScoreUserLike', ScoreUserLike);
