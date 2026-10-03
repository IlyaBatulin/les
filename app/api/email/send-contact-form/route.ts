import { NextResponse } from 'next/server';
import { mailSettings, escapeHtml } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, phone, email, message } = data;
    
    const { transporter, from, to } = mailSettings();

    // Форматируем время для отображения
    const contactDate = new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Отправляем email
    await transporter.sendMail({
      from,
      to,
      subject: `Новая заявка с сайта`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #16a34a; color: white; padding: 16px; text-align: center;">
            <h1 style="margin: 0;">Новая заявка с сайта</h1>
            <p style="margin: 8px 0 0 0;">${contactDate}</p>
          </div>
          
          <div style="padding: 16px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="margin-top: 0;">Информация о клиенте</h2>
            <p><strong>Имя:</strong> ${escapeHtml(name)}</p>
            <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
            ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ''}
            
            <h2>Сообщение</h2>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        </div>
      `
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
    return NextResponse.json(
      { error: 'Не удалось отправить email' },
      { status: 500 }
    );
  }
} 