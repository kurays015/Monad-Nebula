import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import Header from "@/components/Header";
import Audio from "@/components/Audio";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monad Nebula",
  description: "Monad Blockchain Data Realtime Visualization",
  creator: "kurayss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${inter.variable} antialiased`}>
        <Header />
        <Providers>{children}</Providers>
        <p className="absolute text-slate-400 bottom-4 left-4 hidden lg:block">
          Use shift or control to explore the Monad Nebula!
        </p>
        <Audio />
      </body>
    </html>
  );
}
