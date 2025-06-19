import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Audio from "@/components/Audio";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import MonadContextProvider from "@/context/MonadContext";

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
        <MonadContextProvider>{children}</MonadContextProvider>
        <div className="fixed left-1 right-1 bottom-2 z-40 flex flex-col items-center text-center text-xs sm:left-4 sm:right-auto sm:bottom-4 sm:items-start sm:text-left sm:text-xs text-slate-400">
          <span>Use shift or control to explore the Monad Nebula!</span>
          <span className="flex items-center gap-1 mt-1">
            Made By:
            <Link
              href="https://x.com/constkurays"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <FaXTwitter />
              <span className="underline">@constkurays</span>
            </Link>
          </span>
        </div>
        <Audio />
      </body>
    </html>
  );
}
