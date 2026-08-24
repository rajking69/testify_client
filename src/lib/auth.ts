import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP, customSession } from "better-auth/plugins";
import { Resend } from "resend";

const mongoUri =
  process.env.MONGODB_URI ||
  "mongodb+srv://Testify-admin:qldkEJD7isbPQ2yQ@cluster013.ojpnf3t.mongodb.net/testify?retryWrites=true&w=majority";
const mongoDbName = process.env.MONGODB_DB_NAME || "testify";

const client = new MongoClient(mongoUri);
const db = client.db(mongoDbName);

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY as string)
  : null;
const fromEmail = process.env.RESEND_FROM_EMAIL as string;

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["student", "teacher", "admin"],
        required: false,
        defaultValue: "student",
        input: false,
        returned: true,
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user,
        session,
        roles: [user.role],
      };
    }),
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
