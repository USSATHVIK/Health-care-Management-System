require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User.js');

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({});
    console.log('\nAll Users:');
    console.log('==========');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log('---');
    });
    
    // Find admin users specifically
    const admins = await User.find({ role: 'admin' });
    console.log('\nAdmin Users:');
    console.log('============');
    if (admins.length === 0) {
      console.log('No admin users found');
    } else {
      admins.forEach(admin => {
        console.log(`Email: ${admin.email}`);
        console.log(`Name: ${admin.firstName} ${admin.lastName}`);
        console.log('---');
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

checkUsers();