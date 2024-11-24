import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export const connectDB = async () => {
  if (client) return db;

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};
