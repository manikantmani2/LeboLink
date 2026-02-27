const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

(async () => {
  // Create in-memory MongoDB
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri('lebolink');
  
  await mongoose.connect(mongoUri);
  
  // Define schema inline
  const userSchema = new mongoose.Schema({
    phone: String,
    email: String,
    role: { type: String, enum: ['worker', 'customer', 'admin'], required: true },
    name: String,
    password: String,
    passwordHash: String,
  });
  
  const User = mongoose.model('users', userSchema);
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('Hello@&1234', 10);
  
  const admin = await User.create({
    email: 'admin@lebolink.com',
    role: 'admin',
    name: 'Admin User',
    passwordHash: hashedPassword,
  });
  
  console.log('✓ Admin user created:', {
    email: admin.email,
    role: admin.role,
    name: admin.name,
  });
  
  await mongoose.disconnect();
  await mongoServer.stop();
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
