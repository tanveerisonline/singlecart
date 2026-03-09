import { db } from "@/lib/db";
import ContactClient from "@/components/ContactClient";

export const metadata = {
  title: "Contact Us | Shop",
  description: "Get in touch with our team for any questions or support.",
};

export default async function ContactPage() {
  const theme = await db.themeSetting.findFirst({
    where: { id: "default" }
  }).catch(() => null);

  return <ContactClient theme={theme} />;
}
