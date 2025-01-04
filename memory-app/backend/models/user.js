import mongoose from 'mongoose';

// Define the schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  highScore: { type: Number, default: 0 }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create the model
const User = mongoose.model('User', userSchema);

export default User;
