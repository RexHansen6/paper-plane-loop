import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
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
  title: "Paper Plane Loop",
  description: "A lightweight onchain flight log mini app on Base.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="base:app_id" content="6a252f6095cfa95c11629bb4" />
        <meta
          name="talentapp:project_verification"
          content="a30c6d18d397e771f297cf2f5eb80af3bd5ff4fdc80d612a8db9afb6371bd0d3d7c699fd8df6b092cab75175b57bbbbd36cb4906884b46d2fae1b865ae641a62"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
