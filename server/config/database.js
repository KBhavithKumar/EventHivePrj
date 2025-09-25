import mongoose from 'mongoose';
import { DB_CONFIG } from '../models/index.js';

const connectDB = async () => {
  try {
    // Set mongoose options
    mongoose.set('strictQuery', false);

    // Connect to MongoDB with enhanced options
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhive',
      DB_CONFIG.CONNECTION_OPTIONS
    );

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}`);

    // Create indexes for better performance
    try {
      await DB_CONFIG.createIndexes();
    } catch (indexError) {
      console.warn('Warning: Some indexes could not be created:', indexError.message);
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('📦 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('📦 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during MongoDB disconnection:', error);
        process.exit(1);
      }
    });

    return conn;

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Health check function
export const checkDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections)
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

export default connectDB;
