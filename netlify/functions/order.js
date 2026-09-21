const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/api/order', async (req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      ok: false,
      error: 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не налаштовані',
    });
  }

  const data = req.body || {};

  const name = String(data.name || '').slice(0, 200).trim();
  const phone = String(data.phone || '').slice(0, 200).trim();
  const qty = String(data.qty || '').slice(0, 20).trim();
  const total = String(data.total || '').slice(0, 50).trim();

  if (!name || !phone || !qty) {
    return res.status(400).json({
      ok: false,
      error: 'Заповніть усі поля',
    });
  }

  const text =
    `🛒 Нове замовлення — NFC-картка\n\n` +
    `Ім'я: ${name}\n` +
    `Телефон/Telegram: ${phone}\n` +
    `Кількість: ${qty} шт\n` +
    `Сума: ${total}`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      }
    );

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return res.status(502).json({
        ok: false,
        error: tgData.description || 'Telegram API error',
      });
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: 'Server error',
    });
  }
});

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});