// Netlify Function: /.netlify/functions/order
// Приймає замовлення з форми на сайті і безпечно пересилає його в Telegram.
// Токен бота і chat_id беруться з змінних середовища Netlify — ніколи з коду.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не налаштовані' }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) };
  }

  const name = String(data.name || '').slice(0, 200).trim();
  const phone = String(data.phone || '').slice(0, 200).trim();
  const qty = String(data.qty || '').slice(0, 20).trim();
  const total = String(data.total || '').slice(0, 50).trim();

  if (!name || !phone || !qty) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Заповніть усі поля' }) };
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
      return { statusCode: 502, body: JSON.stringify({ ok: false, error: tgData.description || 'Telegram API error' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Server error' }) };
  }
};
