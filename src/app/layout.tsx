import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import OfflineProvider from "@/components/providers/OfflineProvider";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <OfflineProvider />
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
