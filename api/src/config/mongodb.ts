import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/multiservice';

const usernameFile = process.env.MONGODB_USERNAME_FILE;
const passwordFile = process.env.MONGODB_PASSWORD_FILE;

let mongoUri = MONGODB_URI;

if (Boolean(usernameFile) !== Boolean(passwordFile)) {
  throw new Error(
    'Both MONGODB_USERNAME_FILE and MONGODB_PASSWORD_FILE must be provided',
  );
}

if (usernameFile && passwordFile) {
  const username = readFileSync(usernameFile, 'utf8').trim();
  const password = readFileSync(passwordFile, 'utf8').trim();

  const authenticatedUri = new URL(MONGODB_URI);

  authenticatedUri.username = username;
  authenticatedUri.password = password;
  authenticatedUri.searchParams.set('authSource', 'admin');

  mongoUri = authenticatedUri.toString();
}

const mongoClient = new MongoClient(mongoUri);

export async function connectMongoDB(): Promise<void> {
  await mongoClient.connect();

  console.log('Connected to MongoDB');
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoClient.close();

  console.log('Disconnected from MongoDB');
}
