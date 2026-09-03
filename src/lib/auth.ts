import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1", "1.0.0.1"]);
} catch {
  // Ignore DNS config failure
}

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { database, mongoClient } from "./mongodb";
import { userAdditionalFields } from "./user-schema";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { authConfig } from "./auth-types";

const authSecret = process.env.BETTER_AUTH_SECRET;

if (!authSecret) {
  throw new Error("Missing BETTER_AUTH_SECRET. Add it to .env.local before starting the server.");
}

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY as string)
  : null;
const fromEmail = process.env.RESEND_FROM_EMAIL as string;

const authBaseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  "http://localhost:3000";

export const auth = betterAuth({
  database: mongodbAdapter(database, { client: mongoClient }),
  secret: authSecret,
  baseURL: authBaseURL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[],
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  ...authConfig,
  user: {
    additionalFields: {
      ...authConfig.user.additionalFields,
      ...userAdditionalFields,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "forget-password") {
          // Try to send email via Resend if configured
          if (resend) {
            try {
              await resend.emails.send({
                from: fromEmail,
                to: email,
                subject: "Reset your Testify password",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #152234 0%, #0092E3 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">Testify</h1>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
                      <h2 style="color: #152234; margin-top: 0;">Password Reset Request</h2>
                      <p style="color: #475569; line-height: 1.6;">You recently requested to reset your password for your Testify account. Use the verification code below to proceed:</p>
                      <div style="background: white; border: 2px solid #0092E3; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #152234; letter-spacing: 5px;">${otp}</span>
                      </div>
                      <p style="color: #475569; line-height: 1.6;">This code will expire in 10 minutes for your security.</p>
                      <p style="color: #696984; font-size: 14px; margin-top: 20px;">If you didn't request this password reset, please ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #696984; font-size: 12px;">
                      <p>&copy; 2025 Testify. All rights reserved.</p>
                    </div>
                  </div>
                `,
              });
              console.log(`Email sent successfully to ${email}`);
            } catch (error) {
              console.error("Failed to send email via Resend:", error);
              // Fallback to console log if email sending fails
              console.log(`Password reset OTP for ${email}: ${otp}`);
            }
          } else {
            // Fallback to console log if Resend is not configured
            console.log(`Password reset OTP for ${email}: ${otp}`);
            console.log(
              "Note: Configure RESEND_API_KEY in environment variables to enable email sending",
            );
          }
        }
      },
      expiresIn: 600, // 10 minutes
      otpLength: 6,
      allowedAttempts: 3,
    }),
  ],
});
