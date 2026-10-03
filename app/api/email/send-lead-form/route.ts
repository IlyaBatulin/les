import { NextRequest, NextResponse } from "next/server"
import { mailSettings, escapeHtml } from "@/lib/mail"

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, message } = await request.json()

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Укажите имя и телефон" },
        { status: 400 }
      )
    }

    const { transporter, from, to } = mailSettings()

    const html = `
      <h2>Новая заявка с сайта vyborplus.ru</h2>
      <p><strong>Имя:</strong> ${escapeHtml(name)}</p>
      <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
      ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
      ${message ? `<p><strong>Сообщение:</strong> ${escapeHtml(message)}</p>` : ""}
      <hr />
      <p style="color:#666;font-size:12px">${new Date().toLocaleString("ru-RU")}</p>
    `

    const result = await transporter.sendMail({
      from,
      to,
      subject: `Заявка с сайта: ${escapeHtml(name)}`,
      html,
    })

    console.log("Email отправлен:", result.messageId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка отправки заявки:", error)
    return NextResponse.json(
      { error: "Не удалось отправить заявку" },
      { status: 500 }
    )
  }
}
