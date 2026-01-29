import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Land Directorate Farm Management System",
  description: "Professional agricultural management dashboard for farm officers",
  generator: "LIMS",
  // Remove viewport from here
  icons: {
    icon: [
      {
        url: "/logooo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logooo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logoo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/logooo.png",
  },
};

// Create a separate viewport export
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}