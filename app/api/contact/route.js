import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,    // ← use “gmail”
  auth: {
    user: process.env.SMTP_USER,         // your rectrix21@gmail.com
    pass: process.env.SMTP_PASS,         // your app password
  },
});

export async function POST(request) {
  try {
    const { email, subject, message } = await request.json();
    await transporter.sendMail({
      from: email,
      to: process.env.SMTP_USER,
      subject,
      text: `From: ${email}\n\n${message}`,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Mail failed" }), { status: 500 });
  }
}