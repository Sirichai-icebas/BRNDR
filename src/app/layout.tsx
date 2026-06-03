import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BRNDR — Custom Merch Design Studio",
  description: "ออกแบบเสื้อ custom ได้เอง เหมือน Canva เห็นราคาทันที",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 bg-[var(--color-surface)]/90 backdrop-blur-sm border-b border-[var(--color-border)]">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="BRNDR"
              width={120}
              height={40}
              priority
              className="h-6 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
              Design
            </Link>
          </nav>
        </header>
        <div className="pt-14 flex flex-col flex-1">{children}</div>
      </body>
    </html>
  );
}
