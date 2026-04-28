import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import OfflineProvider from "@/components/providers/OfflineProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strategic Connex | Document Management Console",
  description: "Advanced industrial document control and accreditation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <OfflineProvider />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
