import { NextRequest, NextResponse } from "next/server";
import { createContactMessage } from "@/lib/ginza-db";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const type = payload.type;
    const data = payload.data;

    console.log(`[Webhook Resend] Event ${type} received:`, data?.email_id || data?.id);

    // Event email.delivered, email.bounced, dll.
    if (type === "email.delivered") {
      console.log(`[Webhook Resend] Email delivered to ${data?.to}`);
    }

    // Apabila menerima in-bound email event (Resend Inbound Email)
    if (type === "email.created" && data?.from) {
      await createContactMessage({
        name: data?.from_name || data?.from?.split("<")[0]?.trim() || "Inbound Resend User",
        email: data?.from || "inbound@resend.dev",
        message: data?.text || data?.html || "Email masuk melalui webhook Resend",
        resendId: data?.id,
        forwardedTo: process.env.FORWARD_EMAIL_TO || "indonesianvisas@gmail.com",
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Webhook Resend] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
