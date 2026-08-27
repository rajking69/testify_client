import { betterAuth } from "better-auth";
import { roles } from "./role-schema";

// Shared auth type definition for client-side type inference
export const authConfig = {
  user: {
    additionalFields: {
      role: {
        type: roles,
        required: false,
        defaultValue: "student",
        input: false,
        returned: true,
      },
    },
  },
};

export type Auth = ReturnType<typeof betterAuth>;
