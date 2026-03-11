import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_USERS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("[NEWSLETTER_ADMIN_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_USERS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subject, html } = body;

    if (!subject || !html) {
      return new NextResponse("Subject and Content are required", { status: 400 });
    }

    const subscribers = await db.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    if (subscribers.length === 0) {
      return new NextResponse("No active subscribers found", { status: 400 });
    }

    // Process in background or synchronously based on scale
    // For smaller lists, this is fine. For larger, a queue is needed.
    let successCount = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject,
          html,
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to send newsletter to ${sub.email}`, err);
      }
    }

    return NextResponse.json({ message: `Newsletter sent successfully to ${successCount} subscribers.` });
  } catch (error) {
    console.error("[NEWSLETTER_ADMIN_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
