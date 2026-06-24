// src/infrastructure/auth/auth.options.ts
import { NextAuthOptions, User } from "next-auth"; // Importamos User para el tipado
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
        // 1. Validación de seguridad para evitar el error de 'undefined'
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Instanciamos la arquitectura limpia
        const authRepository = new PgAuthRepository();
        const loginUseCase = new LoginUserUseCase(authRepository);

        try {
          // 3. Ejecutamos la lógica de negocio
          const result = await loginUseCase.execute(credentials.email, credentials.password);
          
          // 4. Retornamos el objeto respetando la interfaz User de next-auth.d.ts
          // Convertimos el ID a string para asegurar compatibilidad y evitar errores de UUID
          return {
            id: String(result.id),
            name: result.name,
            role: result.role,
            email: credentials.email,
          };
        } catch (error) {
          // 5. Propagamos el mensaje exacto para que la UI pueda distinguir el motivo
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
    // Guarda los datos en el token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; 
      }
      return token;
    },
    // Pasa los datos del token a la sesión accesible desde la UI
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role; 
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