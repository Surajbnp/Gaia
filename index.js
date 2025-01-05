require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser("surja4"));

const BOT_TOKEN = "7949109647:AAGCsnEf4EpjcT7pB-orOXjPv-bP76h9Ao0";
const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    interval: 1000,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

const greetings = ["hi", "hii", "hey", "hello", "gm"];
const greetingReplies = [
  (userName) => `Hi ${userName}! How can I help you today? 😊`,
  (userName) => `Hello ${userName}! What can I do for you? 🤖`,
  (userName) => `Hey there, ${userName}! Need assistance? 🚀`,
];

const savedMessages = {};

bot.on("message", async (msg) => {
  const userName = msg.from.first_name;
  const userMessage = msg.text?.toLowerCase();
  const chatId = msg.chat.id;

  if (!userMessage) return;

  if (msg.entities) {
    const mentionEntity = msg.entities.find(
      (entity) => entity.type === "mention"
    );

    if (mentionEntity) {
      const mentionedText = msg.text.substring(
        mentionEntity.offset,
        mentionEntity.offset + mentionEntity.length
      );

      if (mentionedText === "@gaia") {
        if (userMessage.includes("ca")) {
          await bot.sendMessage(
            chatId,
            "📝 **Contract Address:**\n`0x9eb54E00863b6e12eed39B6081E018fec8336EBc`\n\n📌 You can copy this address for reference.",
            { parse_mode: "Markdown" }
          );
          return;
        }

        if (userMessage.includes("help")) {
          await bot.sendAnimation(
            chatId,
            "https://res.cloudinary.com/dddnxiqpq/video/upload/v1735885389/Gaia__the_angel_of_nature_with_Green_hair__green_eyes__elvish_clothes_hfx3d5.mp4",
            {
              caption:
                "**GAIA 🌱🤖**\n\nGaia is a nurturing AI agent inspiring sustainability through creativity, engagement, and Regenerative Finance, creating abundance for the whole planet. 🌎",
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Buy Link 💰",
                      web_app: {
                        url: "https://fun.virtuals.io/agents/0x9eb54E00863b6e12eed39B6081E018fec8336EBc",
                      },
                    },
                  ],
                  [
                    {
                      text: "Contract Address 📝",
                      callback_data: "contract_address",
                    },
                  ],
                  [
                    {
                      text: "Follow Community 📡",
                      url: "https://t.me/gaiaawake",
                    },
                    {
                      text: "Follow X 🚀",
                      url: "https://x.com/GAIA",
                    },
                  ],
                ],
              },
            }
          );
          return;
        }
      }
    }
  }

  if (msg.reply_to_message && userMessage.includes("save this")) {
    const replyMessage =
      msg.reply_to_message.text || msg.reply_to_message.caption;
    if (replyMessage) {
      if (!savedMessages[chatId]) savedMessages[chatId] = [];
      savedMessages[chatId].push(replyMessage);
      bot.sendMessage(chatId, "✅ Message saved successfully!");
    } else {
      bot.sendMessage(chatId, "❌ Unable to save the message, no text found.");
    }
    return;
  }

  if (greetings.includes(userMessage)) {
    const reply =
      greetingReplies[Math.floor(Math.random() * greetingReplies.length)];
    bot.sendMessage(chatId, reply(userName));
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const action = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  if (action === "contract_address") {
    await bot.sendMessage(
      chatId,
      "📝 **Contract Address:**\n`0x9eb54E00863b6e12eed39B6081E018fec8336EBc`\n\n📌 You can copy this address for reference.",
      { parse_mode: "Markdown" }
    );
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

app.get("/", (req, res) => {
  res.send("<a>Hello Google</a>");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
