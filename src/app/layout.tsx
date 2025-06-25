import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VHFix from "./components/VHFix.tsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reveal the Wheels",
  description: "Daily game for car fans. Remove the tiles to reveal clues about the car and make a guess. Compete with your friends by sharing your results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-100 min-h-screen` } style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
        <VHFix />
        {children}
      </body>
    </html>
  );
}