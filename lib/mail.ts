import nodemailer from "nodemailer"

export function mailSettings() {
  const user = process.env.SMTP_USER || process.env.NODEMAILER_USER
  const pass = process.env.SMTP_PASS || process.env.NODEMAILER_PASSWORD
  const to = process.env.NODEMAILER_TARGET
  if (!user || !pass || !to) throw new Error("Mail configuration is incomplete")
  const port = Number(process.env.SMTP_PORT || 465)
  const transport = process.env.SMTP_HOST
    ? { host: process.env.SMTP_HOST, port, secure: port === 465 }
    : { service: "gmail" }
  return {
    from: `"ВЫБОР+" <${user}>`,
    to,
    transporter: nodemailer.createTransport({
      ...transport,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    }),
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]!))
}
