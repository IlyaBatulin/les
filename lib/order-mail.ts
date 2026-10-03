import { mailSettings, escapeHtml } from "./mail"

export interface OrderDetails {
  orderId: number | string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  deliveryAddress?: string | null
  comment?: string | null
  totalAmount: number
  items: { product: { name: string; price: number; unit?: string }; quantity: number }[]
}

export async function sendOrderNotification(orderDetails: OrderDetails) {
    // Форматируем время для отображения
    const orderDate = new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow'
    });

    // Создаем HTML для списка товаров
    const productsHTML = orderDetails.items.map((item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(item.product.name)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity} ${escapeHtml(item.product.unit || "шт")}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.product.price ? item.product.price.toLocaleString() : 'Цена по запросу'} ₽</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.product.price ? (item.product.price * item.quantity).toLocaleString() : 'Цена по запросу'} ₽</td>
      </tr>
    `).join('');

    const { transporter, from, to } = mailSettings()
    const result = await transporter.sendMail({
      from,
      to,
      subject: `Новый заказ #${escapeHtml(orderDetails.orderId)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #16a34a; color: white; padding: 16px; text-align: center;">
            <h1 style="margin: 0;">Новый заказ #${escapeHtml(orderDetails.orderId)}</h1>
            <p style="margin: 8px 0 0 0;">${orderDate}</p>
          </div>

          <div style="padding: 16px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="margin-top: 0;">Информация о клиенте</h2>
            <p><strong>Имя:</strong> ${escapeHtml(orderDetails.customerName)}</p>
            <p><strong>Телефон:</strong> ${escapeHtml(orderDetails.customerPhone)}</p>
            ${orderDetails.customerEmail ? `<p><strong>Email:</strong> ${escapeHtml(orderDetails.customerEmail)}</p>` : ''}
            ${orderDetails.deliveryAddress ? `<p><strong>Адрес доставки:</strong> ${escapeHtml(orderDetails.deliveryAddress)}</p>` : ''}
            ${orderDetails.comment ? `<p><strong>Комментарий:</strong> ${escapeHtml(orderDetails.comment)}</p>` : ''}

            <h2>Товары</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Товар</th>
                  <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">Кол-во</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">Цена</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
              <tfoot>
                <tr style="font-weight: bold;">
                  <td colspan="3" style="padding: 8px; text-align: right;">Итого:</td>
                  <td style="padding: 8px; text-align: right;">${orderDetails.totalAmount ? orderDetails.totalAmount.toLocaleString() : '0'} ₽</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `
    });

    if (!result.accepted?.length || result.rejected?.length) {
      throw new Error("Order notification was rejected by SMTP")
    }
    return result
}
