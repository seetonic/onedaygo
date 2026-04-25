require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Connected to DB');

    const email = 'admin@onedaygo.com';
    const password = 'password123';

    // Check if exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update role
      user.role = 'admin';
      await user.save();
      console.log(`Updated existing user ${email} to admin role.`);
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      user = await User.create({
        name: 'Super Admin',
        email,
        passwordHash,
        role: 'admin'
      });
      console.log(`Created new admin: ${email} / ${password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
