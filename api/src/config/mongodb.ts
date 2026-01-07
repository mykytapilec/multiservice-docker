import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/multiservice';

const mongoClient = new MongoClient(MONGODB_URI);

export async function connectMongoDB(): Promise<void> {
  await mongoClient.connect();

  console.log('Connected to MongoDB');
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoClient.close();

  console.log('Disconnected from MongoDB');
}
