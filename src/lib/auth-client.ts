import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string,
  plugins: [inferAdditionalFields<typeof auth>(), emailOTPClient()],
});
export const { signIn, signUp, signOut, useSession } = authClient;

// Export social authentication methods
export const socialSignIn = authClient.signIn.social;
export const linkSocialAccount = authClient.linkSocial;
export const changePassword = authClient.changePassword;
export const updateUser = authClient.updateUser;
