import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (uri = env.dbURL) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (!uri) {
      throw new Error('Database connection URL (dbURL) is not defined in environment variables.');
    }

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting reconnection...');
    });

    const conn = await mongoose.connect(uri);
    return conn;
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error(`Error closing MongoDB connection: ${error.message}`);
  }
};
