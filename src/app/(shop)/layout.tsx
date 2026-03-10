import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await db.themeSetting.findFirst({
    where: { id: "default" }
  }).catch(() => null);

  return (
    <>
      <Navbar 
        logoUrl={theme?.logoUrl} 
        logoWidth={theme?.logoWidth || 128} 
        logoHeight={theme?.logoHeight || 40} 
      />
      <main>
        {children}
      </main>
      <Footer theme={theme} />
    </>
  );
}
