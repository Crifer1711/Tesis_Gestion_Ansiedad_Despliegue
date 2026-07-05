// src/infrastructure/auth/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      lastname?: string; // ✅ AGREGAR
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    lastname?: string; // ✅ AGREGAR
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    lastname?: string; // ✅ AGREGAR
  }
}