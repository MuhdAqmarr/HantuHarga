import type { Metadata, Viewport } from "next";
import { GeistPixelCircle } from "geist/font/pixel";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { NavBar } from "@/components/layout/NavBar";
import { ReduceMotionProvider } from "@/components/ReduceMotionProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "HargaHantu — Malaysian Price Intel",
    template: "%s | HargaHantu",
  },
  description:
    "Scan your receipt. Track real grocery prices across Malaysia. Community-powered price intelligence.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HargaHantu",
  },
  openGraph: {
    type: "website",
    locale: "ms_MY",
    siteName: "HargaHantu",
    title: "HargaHantu — Malaysian Price Intel",
    description:
      "Scan your receipt. Track real grocery prices across Malaysia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HargaHantu — Malaysian Price Intel",
    description:
      "Scan your receipt. Track real grocery prices across Malaysia.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms" className={`${GeistPixelCircle.variable} ${sans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ReduceMotionProvider>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <main id="main-content">{children}</main>
          <NavBar />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#E8E8E8",
                border: "1px solid #2a2a2a",
                fontFamily: "var(--font-mono)",
              },
            }}
          />
          <ServiceWorkerRegistrar />
        </ReduceMotionProvider>
      </body>
    </html>
  );
}
