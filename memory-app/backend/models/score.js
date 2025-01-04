import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  moves: {
    type: Number,
    required: true
  },
  timeCompleted: {
    type: Date,
    required: true
  },
  matchedPairs: {
    type: Number,
    required: true
  },
  totalPairs: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Score = mongoose.model('Score', scoreSchema);

export default Score; 