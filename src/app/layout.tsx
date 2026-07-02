import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "@/presentation/providers/AuthProvider";
import { ConfirmProvider } from '@/presentation/components/common/ConfirmProvider';
import { AccessibilityProvider } from "@/presentation/context/AccessibilityContext";
import { AccessibilityLauncher } from '@/presentation/components/accessibility/AccessibilityLauncher';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindPeace",
  description: "Plataforma de salud mental",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AccessibilityProvider>
          <ConfirmProvider>
            <AuthProvider>
              {children}
              {/* ✅ AccessibilityLauncher global - se oculta automáticamente en home y saber-mas */}
              <AccessibilityLauncher />
              <Toaster position="top-right" containerStyle={{ top: 84, right: 16 }} />
            </AuthProvider>
          </ConfirmProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}