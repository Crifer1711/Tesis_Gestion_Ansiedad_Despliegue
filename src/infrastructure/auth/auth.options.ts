// src/infrastructure/auth/auth.options.ts
import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { LoginUserUseCase } from "@/application/use-cases/auth/login-user.use-case";
import { PgAuthRepository } from "@/infrastructure/repositories/pg-auth.repository";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const authRepository = new PgAuthRepository();
        const loginUseCase = new LoginUserUseCase(authRepository);

        try {
          const result = await loginUseCase.execute(credentials.email, credentials.password);
          
          return {
            id: String(result.id),
            name: result.name,
            lastname: result.lastname || '', // ✅ AGREGAR
            role: result.role,
            email: credentials.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.lastname = (user as any).lastname || ''; // ✅ AGREGAR
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.lastname = token.lastname as string; // ✅ AGREGAR
      }
      return session;
    }
  },
  pages: { 
    signIn: "/login" 
  },
  session: { 
    strategy: "jwt" 
  }
};