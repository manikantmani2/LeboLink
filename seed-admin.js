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
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ['worker', 'customer', 'admin'], required: true },
    name: String,
    email: String,
    password: String,
    passwordHash: String,
  });
  
  const User = mongoose.model('users', userSchema);
  
  // Create admin user
  const hashedPassword = await bcrypt.hash('Hello@&1234', 10);
  
  const admin = await User.create({
    phone: '9155682599',
    role: 'admin',
    name: 'Admin User',
    passwordHash: hashedPassword,
  });
  
  console.log('✓ Admin user created:', {
    phone: admin.phone,
    role: admin.role,
    name: admin.name,
  });
  
  await mongoose.disconnect();
  await mongoServer.stop();
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
