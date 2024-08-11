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
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Unique Filter
ScoreUserLike.index({ userId: 1, scoreId: 1 }, { unique: true });

type IScoreUserLike = InferSchemaType<typeof ScoreUserLike>;

export const ScoreUserLikeModel = model<IScoreUserLike>('ScoreUserLike', ScoreUserLike);
