import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_NAME || "testify";

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI. Add it to .env.local before starting the server.");
}

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

const mongoClient = globalForMongo.mongoClient || new MongoClient(mongoUri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = mongoClient;
}

export const database = mongoClient.db(mongoDbName);

export { mongoClient };
