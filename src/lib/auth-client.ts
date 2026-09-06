import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { authConfig } from "./auth-types";

const sanitizeUrl = (rawUrl?: string): string => {
  if (!rawUrl) return "https://testify-server-5ta4.onrender.com";
  let cleaned = rawUrl.trim().replace(/^["'\\]+|["'\\]+$/g, "").trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, "");
};

// Create typed auth client with inferred additional fields
export const authClient = createAuthClient({
  baseURL: sanitizeUrl(process.env.NEXT_PUBLIC_BETTER_AUTH_URL),
  plugins: [inferAdditionalFields<typeof authConfig>(), emailOTPClient()],
});

// Export hooks with proper typing
export const { signIn, signUp, signOut } = authClient;

// Create a typed useSession hook
export const useSession = () => {
  const session = authClient.useSession();
  return {
    ...session,
    data: session.data
      ? {
          ...session.data,
          user: session.data.user,
        }
      : null,
    isPending: session.isPending,
    refetch: session.refetch,
  };
};

// Export social authentication methods
export const socialSignIn = authClient.signIn.social;
export const linkSocialAccount = authClient.linkSocial;
export const changePassword = authClient.changePassword;
export const updateUser = authClient.updateUser;
