import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      emailVerified?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
    emailVerified?: Date | string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    name?: string;
    emailVerified?: string | null;
  }
}
