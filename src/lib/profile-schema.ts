export const profileRoles = ["admin", "teacher", "student"] as const;

export type ProfileRole = (typeof profileRoles)[number];

export interface Profile {
  id: string;
  userId: string;
  bio?: string | null;
  image?: string | null;
  phone?: string | null;
  institution?: string | null;
  department?: string | null;
  studentId?: string | null;
  employeeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileInput = Omit<Profile, "id" | "createdAt" | "updatedAt">;

export type ProfileUpdateInput = Partial<
  Omit<Profile, "id" | "userId" | "createdAt" | "updatedAt">
>;

export function isProfileRole(value: unknown): value is ProfileRole {
  return (
    typeof value === "string" &&
    profileRoles.includes(value as ProfileRole)
  );
}

export function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const profile = value as Partial<Profile>;

  return (
    isNonEmptyString(profile.id) &&
    isNonEmptyString(profile.userId) &&
    profile.createdAt instanceof Date &&
    !Number.isNaN(profile.createdAt.getTime()) &&
    profile.updatedAt instanceof Date &&
    !Number.isNaN(profile.updatedAt.getTime()) &&
    isOptionalString(profile.bio) &&
    isOptionalString(profile.image) &&
    isOptionalString(profile.phone) &&
    isOptionalString(profile.institution) &&
    isOptionalString(profile.department) &&
    isOptionalString(profile.studentId) &&
    isOptionalString(profile.employeeId)
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}