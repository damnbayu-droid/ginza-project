import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createContactMessage } from "@/lib/ginza-db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

import { renderEmailHtml } from "@/lib/email-templates";

const resendApiKey = process.env.RESEND_API_KEY || "";
const forwardEmailTo = process.env.FORWARD_EMAIL_TO || "indonesianvisas@gmail.com";
const developerEmail = process.env.DEVELOPER_EMAIL || "developer@mongondowpedia.com";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Rate limit: Max 5 pesan per 15 menit per IP
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.LOGIN);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak pesan terkirim. Silakan tunggu beberapa saat lagi." },
      { status: 429 }
    );
  }

  try {
    const { name, email, whatsapp, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nama, Email, dan Pesan wajib diisi." },
        { status: 400 }
      );
    }

    let resendId: string | undefined = undefined;

    // Forward email via Resend if API key is provided
    if (resend) {
      try {
        const recipients = [forwardEmailTo, developerEmail, "cvtunasraya@gmail.com"].filter(
          (item, pos, self) => self.indexOf(item) === pos
        );

        const adminEmailHtml = renderEmailHtml({
          title: `Pesan Masuk Baru dari ${name}`,
          badge: "Pesan Masuk",
          bodyContent: `
            <div style="background-color: #161822; border: 1px solid #232736; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 4px 0;"><strong>Nama:</strong> ${name}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
              <p style="margin: 4px 0;"><strong>WhatsApp:</strong> ${whatsapp || '-'}</p>
            </div>
            <div style="background-color: #12141d; border: 1px solid #202433; border-radius: 12px; padding: 16px;">
              <h4 style="margin-top: 0; color: #34d399;">Isi Pesan:</h4>
              <p style="white-space: pre-wrap; font-size: 14px; color: #e2e8f0; line-height: 1.6;">${message}</p>
            </div>
          `,
          footerNote: `Diteruskan ke indonesianvisas@gmail.com & developer@mongondowpedia.com`
        });

        let resendResponse = await resend.emails.send({
          from: "MongondowPedia Contact <onboarding@resend.dev>",
          to: recipients,
          subject: `[Pesan Masuk MongondowPedia] dari ${name}`,
          replyTo: email,
          html: adminEmailHtml,
        });

        // Fallback for Resend test mode before domain verification at resend.com/domains
        if (resendResponse.error && resendResponse.error.message?.includes("testing emails")) {
          resendResponse = await resend.emails.send({
            from: "MongondowPedia Contact <onboarding@resend.dev>",
            to: ["cvtunasraya@gmail.com"],
            subject: `[Pesan Masuk Testing] dari ${name}`,
            replyTo: email,
            html: adminEmailHtml,
          });
        }

        resendId = resendResponse.data?.id;

        // Auto-reply confirmation email to the sender
        try {
          const autoReplyHtml = renderEmailHtml({
            title: `Pesan Anda Telah Kami Terima!`,
            badge: "Konfirmasi Pesan",
            bodyContent: `
              <p>Halo <strong>${name}</strong>,</p>
              <p>Terima kasih telah menghubungi <strong>MongondowPedia & Bogani AI</strong>. Pesan Anda telah berhasil diterima oleh Tim Pengembang kami.</p>
              <div style="background-color: #161822; border: 1px solid #232736; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8; font-weight: bold;">Ringkasan Pesan Anda:</p>
                <p style="margin: 0; white-space: pre-wrap; font-size: 13px; color: #cbd5e1; font-style: italic;">"${message}"</p>
              </div>
              <p>Tim kami akan segera meninjau dan merespons pesan Anda melalui email (<strong>${email}</strong>) atau nomor WhatsApp yang Anda cantumkan.</p>
            `,
            footerNote: "MongondowPedia — Portal Kebudayaan & Bahasa Bolaang Mongondow Raya"
          });

          await resend.emails.send({
            from: "MongondowPedia Support <onboarding@resend.dev>",
            to: [email],
            subject: `Pesan Anda Telah Diterima — MongondowPedia`,
            html: autoReplyHtml,
          });
        } catch (autoReplyErr) {
          console.warn("[public/messages] Auto-reply email warning:", autoReplyErr);
        }
      } catch (emailErr) {
        console.warn("[public/messages] Resend email dispatch warning:", emailErr);
      }
    }

    // Save real message to database
    const savedRecord = await createContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp?.trim() || undefined,
      message: message.trim(),
      resendId,
      forwardedTo: forwardEmailTo,
    });

    return NextResponse.json({
      success: true,
      message: "Pesan Anda telah berhasil dikirim ke tim pengembang!",
      id: savedRecord.id,
    });
  } catch (err: any) {
    console.error("[public/messages] Error:", err);
    return NextResponse.json({ error: err.message || "Gagal mengirim pesan" }, { status: 500 });
  }
}
