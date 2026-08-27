export const profileRoles = ["admin", "teacher", "student"] as const;

export type ProfileRole = (typeof profileRoles)[number];

export interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: ProfileRole;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  studentId?: string;
  teacherId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileInput = Pick<
  Profile,
  | "userId"
  | "name"
  | "email"
  | "role"
  | "bio"
  | "avatarUrl"
  | "phone"
  | "department"
  | "studentId"
  | "teacherId"
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
    typeof profile.id === "string" &&
    typeof profile.userId === "string" &&
    typeof profile.name === "string" &&
    typeof profile.email === "string" &&
    isProfileRole(profile.role) &&
    profile.createdAt instanceof Date &&
    profile.updatedAt instanceof Date
  );
}