/**
 * Exam Access & Unique Identity Utilities
 * Generates secure public access tokens and human-friendly unique join codes
 */

export function generateJoinCode(subject?: string): string {
  let prefix = "TST";
  if (subject && subject.trim().length > 0) {
    const clean = subject.replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (clean.length >= 3) {
      prefix = clean.substring(0, 3);
    } else if (clean.length > 0) {
      prefix = clean.padEnd(3, "X");
    }
  }

  // Generate 4 uppercase alphanumeric characters (excluding ambiguous 0/O, 1/I)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${prefix}${randomPart}`;
}

export function generateAccessToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 16; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `tst_${Date.now().toString(36)}_${randomString}`;
}

export function getShareableExamUrl(accessTokenOrCode: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/exam/${accessTokenOrCode}`;
  }
  return `/exam/${accessTokenOrCode}`;
}
