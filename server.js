// ========================================
// EarnBD Telegram Bot - Updated server.js
// ========================================

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ---- CONFIG ----
const BOT_TOKEN = process.env.BOT_TOKEN || 'আপনার_BOT_TOKEN_এখানে';
const MINI_APP_URL = 'https://earnbd-bot.onrender.com'; // আপনার অ্যাপ লিঙ্ক সেট করা হয়েছে
const ADMIN_ID = process.env.ADMIN_ID || ''; 

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
          { text: '📢 চ্যানেল', url: 'https://t.me/ayan2446' }, // আপনার চ্যানেল লিঙ্ক
          { text: '💬 সাপোর্ট', url: 'https://t.me/Ownerearnbd' } // আপনার সাপোর্ট ইউজারনেম
        ]
      ]
    }
  };

  bot.sendMessage(chatId,
    `👋 স্বাগতম ${firstName}!\n\n` +
    `<b>EarnBD</b> ফ্যামিলিতে আপনাকে স্বাগতম! আপনার অবসর সময়কে আয়ে রূপান্তর করুন 🚀\n\n` +
    `💰 সহজ কিছু টাস্ক পূরণ করে টাকা আয় করুন।\n` +
    `✅ ধৈর্য সহকারে কাজ করুন, ইনশাআল্লাহ ভালো কিছু করতে পারবেন।\n` +
    `🏆 লিডারবোর্ডে নিজের নাম লেখান এবং বোনাস বুঝে নিন।\n` +
    `🎁 বন্ধুদের রেফার করে বোনাস নিন।\n\n` +
    `নিচের বাটন চাপুন এবং শুরু করুন! 👇`,
    { parse_mode: 'HTML', ...keyboard } // সুন্দর দেখানোর জন্য HTML মোড ব্যবহার করা হয়েছে
  );
});

// ---- HELP COMMAND ----
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `🆘 <b>সাহায্য মেনু</b>\n\n` +
    `/start - অ্যাপ শুরু করুন\n` +
    `/help - সাহায্য নিন\n\n` +
    `সরাসরি সাপোর্টের জন্য: @Ownerearnbd`,
    { parse_mode: 'HTML' }
  );
});

// ---- ADMIN COMMANDS (আপনার আগের কোড অনুযায়ী রাখা হয়েছে) ----
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
  bot.sendMessage(msg.chat.id, '🔐 <b>অ্যাডমিন প্যানেল</b>', { parse_mode: 'HTML', ...keyboard });
});

// ---- CALLBACK QUERIES ----
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  if (query.data === 'admin_users') {
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, '👥 ব্যবহারকারী তথ্য: ফিচারটি ডেটাবেসের সাথে সংযুক্ত করুন।');
  }
  if (query.data === 'admin_withdraws') {
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, '💸 উইথড্র তালিকা: ফিচারটি ডেটাবেসের সাথে সংযুক্ত করুন।');
  }
});

// ---- API ROUTES ----
app.post('/api/notify-withdraw', (req, res) => {
  const { userName, amount, method, number } = req.body;
  if (ADMIN_ID) {
    bot.sendMessage(ADMIN_ID,
      `💸 <b>নতুন উইথড্র অনুরোধ!</b>\n\n👤 নাম: ${userName}\n💰 পরিমাণ: ৳${amount}\n📱 পদ্ধতি: ${method}\n📞 নম্বর: ${number}`,
      { parse_mode: 'HTML' }
    );
  }
  res.json({ success: true });
});

app.post('/api/notify-register', (req, res) => {
  const { userName, referredBy } = req.body;
  if (ADMIN_ID) {
    bot.sendMessage(ADMIN_ID,
      `🆕 <b>নতুন ব্যবহারকারী!</b>\n\n👤 নাম: ${userName}\n` + (referredBy ? `🎁 রেফার: ${referredBy}` : ''),
      { parse_mode: 'HTML' }
    );
  }
  res.json({ success: true });
});

// ---- SERVER START ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ EarnBD সার্ভার চালু হয়েছে।`);
});
