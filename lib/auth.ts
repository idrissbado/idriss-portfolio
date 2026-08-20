import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/admin-access";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        const user = await findUserByEmail(email);

        if (!user) {
          return null;
        }

        if (user.emailVerified === null || user.emailVerified === undefined) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: user.role ?? "member",
          emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "member";
        token.name = String(user.name ?? user.email ?? "");
        token.emailVerified = user.emailVerified
          ? typeof user.emailVerified === "string"
            ? user.emailVerified
            : new Date(user.emailVerified).toISOString()
          : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? session.user.email ?? "");
        session.user.name = String(token.name ?? session.user.name ?? "");
        session.user.role = String(token.role ?? "member");
        session.user.emailVerified = token.emailVerified ?? null;
      }
      return session;
    },
  },
};

export async function auth() {
  return getServerSession(authOptions);
}
