"use client";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

const routesWithoutSession = new Set(["/", "/saber-mas", "/login", "/register"]);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  if (routesWithoutSession.has(pathname)) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
};
