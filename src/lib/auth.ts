import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const mongoUri =
  process.env.MONGODB_URI ||
  "mongodb+srv://Testify-admin:qldkEJD7isbPQ2yQ@cluster013.ojpnf3t.mongodb.net/testify?retryWrites=true&w=majority";
const mongoDbName = process.env.MONGODB_DB_NAME || "testify";

const client = new MongoClient(mongoUri);
const db = client.db(mongoDbName);

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
      },
    },
  },
});
