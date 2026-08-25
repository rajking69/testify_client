export const userRoles = ["student", "teacher", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  institution?: string | null;
  department?: string | null;
  studentId?: string | null;
  employeeId?: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const userAdditionalFields = {
  role: {
    type: "string",
    required: false,
    defaultValue: "student",
    input: true,
  },
  institution: {
    type: "string",
    required: false,
    input: true,
  },
  department: {
    type: "string",
    required: false,
    input: true,
  },
  studentId: {
    type: "string",
    required: false,
    input: true,
  },
  employeeId: {
    type: "string",
    required: false,
    input: true,
  },
  phone: {
    type: "string",
    required: false,
    input: true,
  },
} as const;
