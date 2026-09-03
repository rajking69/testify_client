import { betterAuth } from "better-auth";

// Shared auth type definition for client-side type inference
export const authConfig = {
  user: {
    additionalFields: {
      role: {
        type: "string" as const,
        required: false,
        defaultValue: "student",
        input: true,
        returned: true,
      },
    },
  },
};

export type Auth = ReturnType<typeof betterAuth>;
