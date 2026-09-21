// Vercel Serverless Function: /api/order
// Той самий функціонал, що й netlify/functions/order.js, у форматі Vercel.
// Використовуйте цей файл ЗАМІСТЬ папки netlify/, якщо деплоїте на Vercel,
// і поміняйте в index.html ORDER_ENDPOINT на '/api/order'.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не налаштовані' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const name = String(body.name || '').slice(0, 200).trim();
  const phone = String(body.phone || '').slice(0, 200).trim();
  const qty = String(body.qty || '').slice(0, 20).trim();
  const total = String(body.total || '').slice(0, 50).trim();

  if (!name || !phone || !qty) {
    return res.status(400).json({ ok: false, error: 'Заповніть усі поля' });
  }

  const text =
    `🛒 Нове замовлення — NFC-картка\n\n` +
    `Ім'я: ${name}\n` +
    `Телефон/Telegram: ${phone}\n` +
    `Кількість: ${qty} шт\n` +
    `Сума: ${total}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return res.status(502).json({ ok: false, error: tgData.description || 'Telegram API error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
