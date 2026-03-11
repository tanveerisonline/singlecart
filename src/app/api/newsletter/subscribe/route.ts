import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return new NextResponse("Valid email is required", { status: 400 });
    }

    // Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate
        await db.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true },
        });
        return NextResponse.json({ message: "Subscription reactivated successfully!" });
      }
      return NextResponse.json({ message: "You are already subscribed!" });
    }

    await db.newsletterSubscriber.create({
      data: { email },
    });

    return NextResponse.json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error("[NEWSLETTER_SUBSCRIBE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
