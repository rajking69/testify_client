import { betterAuth } from "better-auth";

// Shared auth type definition for client-side type inference
export const authConfig = {
  user: {
    additionalFields: {
      role: {
        required: false,
        defaultValue: "student",
        input: false,
        returned: true,
      },
    },
  },
};

export type Auth = ReturnType<typeof betterAuth>;
