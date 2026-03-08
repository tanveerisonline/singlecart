import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthContext from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Shop - Premium E-Commerce Platform",
    template: "%s | Shop"
  },
  description: "Discover the best products at unbeatable prices. Fast shipping and 24/7 support.",
  keywords: ["ecommerce", "shopping", "nextjs", "react", "mysql", "online store"],
  authors: [{ name: "Shop Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext>
          <Toaster position="top-center" richColors />
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </AuthContext>
      </body>
    </html>
  );
}
