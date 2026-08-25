import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { database, mongoClient } from "./mongodb";
import { userAdditionalFields } from "./user-schema";

const authSecret = process.env.BETTER_AUTH_SECRET;

if (!authSecret) {
  throw new Error("Missing BETTER_AUTH_SECRET. Add it to .env.local before starting the server.");
}

export const auth = betterAuth({
  database: mongodbAdapter(database, { client: mongoClient }),
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: userAdditionalFields,
  },
});
