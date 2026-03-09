import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthContext from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { db } from "@/lib/db";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme settings
  const theme = await db.themeSetting.findFirst({
    where: { id: "default" }
  }).catch(() => null);

  const primaryColor = theme?.primaryColor || "#4f46e5";
  const favicon = theme?.faviconUrl || "/favicon.ico";

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={favicon} sizes="any" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${primaryColor} !important;
          }
        `}} />
      </head>
      <body className={inter.className}>
        <AuthContext>
          <Toaster position="top-center" richColors />
          <Navbar logoUrl={theme?.logoUrl} />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </AuthContext>
      </body>
    </html>
  );
}
