import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user[0]) return null;

        const isValid = compareSync(
          credentials.password as string,
          user[0].password
        );
        if (!isValid) return null;

        return {
          id: String(user[0].id),
          name: user[0].name,
          email: user[0].email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});
