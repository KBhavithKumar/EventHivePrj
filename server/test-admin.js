import mongoose from 'mongoose';
import { config } from 'dotenv';
import Admin from './models/Admin.js';

config();

const testAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhive');
    console.log('Connected to MongoDB');

    const admin = await Admin.findOne({ email: 'admin@gmail.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }

    console.log('✅ Admin found:', {
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      employeeId: admin.employeeId,
      accountStatus: admin.accountStatus,
      isEmailVerified: admin.isEmailVerified
    });

    // Test password comparison
    const isPasswordValid = await admin.comparePassword('AdminPass123');
    console.log('Password valid:', isPasswordValid);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdmin();
