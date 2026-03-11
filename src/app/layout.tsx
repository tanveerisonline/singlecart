import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthContext from "@/context/AuthContext";
import { Toaster } from "sonner";
import { db } from "@/lib/db";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: {
    default: "Shop - Premium E-Commerce Platform",
    template: "%s | Shop"
  },
  description: "Discover the best products at unbeatable prices. Fast shipping and 24/7 support.",
  keywords: ["ecommerce", "shopping", "nextjs", "react", "mysql", "online store"],
  authors: [{ name: "Shop Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shop",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme settings for global CSS variables
  const theme = await db.themeSetting.findFirst({
    where: { id: "default" }
  }).catch(() => null);

  const storeSettings = await db.storeSetting.findFirst({
    where: { id: "default" }
  }).catch(() => null);

  const primaryColor = theme?.primaryColor || "#4f46e5";
  const favicon = theme?.faviconUrl || "/favicon.ico";

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={favicon} sizes="any" />
        {theme?.faviconUrl && <link rel="shortcut icon" href={theme.faviconUrl} />}
        {theme?.faviconUrl && <link rel="apple-touch-icon" href={theme.faviconUrl} />}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${primaryColor} !important;
          }
        `}} />
        
        {/* Analytics & Tracking Scripts */}
        {storeSettings?.hotjarId && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${storeSettings.hotjarId},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}} />
        )}
        
        {storeSettings?.clarityId && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${storeSettings.clarityId}");
          `}} />
        )}
      </head>
      <body className={inter.className}>
        <AuthContext>
          <Toaster position="top-center" richColors />
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
