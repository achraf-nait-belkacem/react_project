import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const testUser = new User({
      name: 'Achraf',
      email: 'achrafoonb@gmail.com',
      password: 'azeqsdwxc123',
      highScore: 0
    });

    await testUser.save();
    console.log('Test user created successfully');
    
    const users = await User.find();
    console.log('All users:', users);
    
  } catch (error) {
    if (error.code === 11000) {
      console.error('User with this email already exists');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await mongoose.connection.close();
  }
}

createTestUser(); 