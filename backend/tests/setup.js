import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.PORT = '8085';
process.env.JWT_SECRET = 'test_jwt_secret_key_at_least_32_chars_long_for_security';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.CLOUDINARY_CLOUD_NAME = 'mock_cloud';
process.env.CLOUDINARY_API_KEY = 'mock_api_key';
process.env.CLOUDINARY_API_SECRET = 'mock_api_secret';
process.env.RAZORPAY_KEY_ID = 'rzp_test_mockkey';
process.env.RAZORPAY_KEY_SECRET = 'mock_secret_key';

let replSet = null;

beforeAll(async () => {
  try {
    replSet = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
      instanceOpts: [{ launchTimeout: 60000 }],
    });
    const uri = replSet.getUri();
    process.env.dbURL = uri;
    await mongoose.connect(uri);
  } catch (err) {
    console.error('Failed to start MongoMemoryReplSet:', err);
    throw err;
  }
}, 90000);

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (replSet) {
    await replSet.stop();
  }
}, 30000);
