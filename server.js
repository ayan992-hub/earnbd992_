// ========================================
// EarnBD Telegram Bot - server.js
// ========================================
// প্রয়োজনীয় প্যাকেজ ইনস্টল করুন:
// npm install node-telegram-bot-api express cors dotenv
// ========================================

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // index.html এখানে রাখুন

// ---- CONFIG ----
const BOT_TOKEN = process.env.BOT_TOKEN || 'আপনার_BOT_TOKEN_এখানে';
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://আপনার-ডোমেইন.com';
const ADMIN_ID = process.env.ADMIN_ID || ''; // আপনার Telegram User ID

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ---- START COMMAND ----
bot.onText(/\/start(.*)/, (msg, match) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'বন্ধু';
  const referParam = match[1]?.trim();

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🚀 EarnBD অ্যাপ খুলুন',
          web_app: { url: MINI_APP_URL + (referParam ? `?ref=${referParam}` : '') }
        }],
        [
          { text: '📢 চ্যানেল', url: 'https://t.me/earnbd_channel' },
          { text: '💬 সাপোর্ট', url: 'https://t.me/earnbd_support' }
        ]
      ]
    }
  };

  bot.sendMessage(chatId,
    `👋 স্বাগতম ${firstName}!\n\n` +
    `💰 *EarnBD* তে আপনাকে স্বাগত জানাই!\n\n` +
    `✅ টাস্ক করুন\n` +
    `💸 টাকা আয় করুন\n` +
    `🏆 লিডারবোর্ডে উঠুন\n` +
    `🎁 বন্ধুদের রেফার করুন\n\n` +
    `নিচের বাটন চাপুন এবং শুরু করুন! 👇`,
    { parse_mode: 'Markdown', ...keyboard }
  );
});

// ---- HELP COMMAND ----
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `🆘 *সাহায্য মেনু*\n\n` +
    `/start - অ্যাপ শুরু করুন\n` +
    `/balance - ব্যালেন্স দেখুন\n` +
    `/refer - রেফার কোড পান\n` +
    `/support - সাপোর্টে যোগাযোগ করুন\n\n` +
    `আরো সাহায্যের জন্য: @earnbd_support`,
    { parse_mode: 'Markdown' }
  );
});

// ---- ADMIN COMMANDS ----
bot.onText(/\/admin/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) {
    bot.sendMessage(msg.chat.id, '❌ আপনার অ্যাডমিন অ্যাক্সেস নেই।');
    return;
  }

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📊 সকল উইথড্র দেখুন', callback_data: 'admin_withdraws' }],
        [{ text: '👥 ব্যবহারকারী সংখ্যা', callback_data: 'admin_users' }],
        [{ text: '📢 ব্রডকাস্ট মেসেজ', callback_data: 'admin_broadcast' }]
      ]
    }
  };

  bot.sendMessage(msg.chat.id, '🔐 *অ্যাডমিন প্যানেল*', { parse_mode: 'Markdown', ...keyboard });
});

// ---- CALLBACK QUERIES ----
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'admin_users') {
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, '👥 ব্যবহারকারী তথ্য: ফিচারটি ডেটাবেসের সাথে সংযুক্ত করুন।');
  }

  if (data === 'admin_withdraws') {
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, '💸 উইথড্র তালিকা: ফিচারটি ডেটাবেসের সাথে সংযুক্ত করুন।');
  }
});

// ---- API ROUTES (Mini App থেকে ডেটা পাঠাতে) ----

// উইথড্র নোটিফিকেশন অ্যাডমিনকে পাঠান
app.post('/api/notify-withdraw', (req, res) => {
  const { userName, amount, method, number } = req.body;

  if (ADMIN_ID) {
    bot.sendMessage(ADMIN_ID,
      `💸 *নতুন উইথড্র অনুরোধ!*\n\n` +
      `👤 নাম: ${userName}\n` +
      `💰 পরিমাণ: ৳${amount}\n` +
      `📱 পদ্ধতি: ${method}\n` +
      `📞 নম্বর: ${number}\n\n` +
      `✅ অনুমোদন দিতে অ্যাডমিন প্যানেল ব্যবহার করুন।`,
      { parse_mode: 'Markdown' }
    );
  }

  res.json({ success: true });
});

// নতুন ব্যবহারকারী নোটিফিকেশন
app.post('/api/notify-register', (req, res) => {
  const { userName, referredBy } = req.body;

  if (ADMIN_ID) {
    bot.sendMessage(ADMIN_ID,
      `🆕 *নতুন ব্যবহারকারী যোগ দিয়েছেন!*\n\n` +
      `👤 নাম: ${userName}\n` +
      (referredBy ? `🎁 রেফার: ${referredBy}` : ''),
      { parse_mode: 'Markdown' }
    );
  }

  res.json({ success: true });
});

// ---- SERVER START ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ EarnBD সার্ভার চালু হয়েছে: http://localhost:${PORT}`);
  console.log(`🤖 টেলিগ্রাম বট চালু আছে...`);
});
