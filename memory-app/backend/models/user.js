import mongoose from 'mongoose';

// Define the schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  highScore: { type: Number, default: 0 },
});

// Create the model
const User = mongoose.model('User', userSchema);

export default User;
