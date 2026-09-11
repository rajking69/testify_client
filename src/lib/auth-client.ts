import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { authConfig } from "./auth-types";
import { getAuthBaseUrl } from "./api-config";

// Create typed auth client with inferred additional fields and credentials enabled
export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
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
