import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isRateLimited } from "@/lib/utils/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    // Rate limit by email: max 3 notification emails per email per hour
    if (isRateLimited(`notify-login:${email}`, 3, 60 * 60_000)) {
      return NextResponse.json({ ok: true }); // Silent — don't expose rate limit to client
    }

    await resend.emails.send({
      from: "PokerGoat <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL!,
      subject: `Nuevo usuario en PokerGoat: ${name}`,
      html: `
        <p><strong>${name}</strong> se acaba de registrar en PokerGoat.</p>
        <p>Email: ${email}</p>
        <p>Hora: ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
