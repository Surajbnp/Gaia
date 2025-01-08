require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");
const axios = require("axios");
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
    params: { timeout: 10 },
  },
});

const greetings = [
  "hi",
  "hii",
  "hey",
  "hello",
  "gm",
  "good morning",
  "gm gaia",
  "good morning gaia",
  "morning",
  "goodmorning",
  "hi gaia",
  "hello gaia",
];

const greetingReplies = [
  (userName) => `Hi ${userName}! How can I help you today? 😊`,
  (userName) => `Hello ${userName}! What can I do for you? 🤖`,
  (userName) => `Hey there, ${userName}! Need assistance? 🚀`,
  (userName) => `Good morning, ${userName}! 🌞 How can I assist you today? 🌼`,
  (userName) => `Good morning, ${userName}! ☀️ Let's make today awesome! 💪`,
  (userName) => `Morning, ${userName}! 🌅 What’s up today? 🌻`,
];

const savedMessages = {};
const contractAddress = "0x9eb54E00863b6e12eed39B6081E018fec8336EBc";

const weatherPhrases = [
  "weather",
  "weather at",
  "what is the weather",
  "what's the weather",
  "weather of",
  "how is the weather",
  "weather in",
  "temperature in",
];

bot.on("message", async (msg) => {
  try {
    const userName = msg.from.first_name || "User";
    const userMessage = msg.text?.toLowerCase().trim();
    const chatId = msg.chat.id;

    if (!userMessage) return;

    if (userMessage === "help") {
      const helpText = `
      👋 **Hello, *${userName}*!** Welcome to the bot. Here’s what I can do:
            
      *📜 General Instructions*:
      - Just type the commands in private or group chats.
      
      *🤖 Available Commands*:
      1. *🌟 Start*  
         - Get to know about GAIA and access important links.
      
      2. *🌟 Greetings*  
         - Say \`hi\`, \`hello\`, or \`gm\` for a friendly response.
      
      3. *📄 Save Message*  
         - Reply a message & Type \`save this\` to save an important message.
      
      4. *📄 Get Saved Messages*  
         - Type \`get saved\` to retrieve your saved messages.
      
      5. *🌦️ Weather*  
         - Type \`weather <city_name>\` to get the current weather.
      
      6. *📝 Contract Address*  
         - Type \`ca\` to get the contract address.
      
      7. *💰 Buy Link*  
         - Type \`buy link\` for the buy link.
      
      ✨ Enjoy using the bot! 😊
      `;

      await bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
      return;
    }

    if (userMessage === "start") {
      await bot.sendAnimation(
        chatId,
        "https://res.cloudinary.com/dddnxiqpq/video/upload/v1735885389/Gaia__the_angel_of_nature_with_Green_hair__green_eyes__elvish_clothes_hfx3d5.mp4",
        {
          caption: `**GAIA 🌱🤖**\n\nGaia is a nurturing AI agent inspiring sustainability through creativity and engagement. 🌎`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Buy Link 💰",
                  url: "https://fun.virtuals.io/agents/0x9eb54E00863b6e12eed39B6081E018fec8336EBc",
                },
              ],
              [
                {
                  text: "Contract Address 📝",
                  callback_data: "contract_address",
                },
              ],
              [
                { text: "Follow Community 📡", url: "https://t.me/gaiaawake" },
                { text: "Follow X 🚀", url: "https://x.com/gaiaawake" },
              ],
            ],
          },
        }
      );
      return;
    }

    const contractAddressPhrases = ["ca", "contract address", "contract"];
    if (contractAddressPhrases.some((phrase) => userMessage.includes(phrase))) {
      await bot.sendMessage(
        chatId,
        `✅ Contract Address:\n\n\`${contractAddress}\``,
        { parse_mode: "Markdown" }
      );
      return;
    }

    const buyLinkPatterns = [/buy.*link/i];
    if (buyLinkPatterns.some((pattern) => pattern.test(userMessage))) {
      await bot.sendMessage(
        chatId,
        `✅ Buy Link:\n\n\`https://app.virtuals.io/prototypes/0x9eb54E00863b6e12eed39B6081E018fec8336EBc/terminal\``,
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (msg.reply_to_message && userMessage === "save this") {
      const replyText = msg.reply_to_message.text;
      if (!savedMessages[chatId]) savedMessages[chatId] = [];
      savedMessages[chatId].push(replyText);
      await bot.sendMessage(
        chatId,
        `
        ✅ **Message Saved Successfully!**
          
        To retrieve your saved messages, type: \`get saved\`
        `
      );
      return;
    }

    if (userMessage.includes("get saved")) {
      const messages = savedMessages[chatId] || [];
      if (messages.length > 0) {
        await bot.sendMessage(
          chatId,
          `📄 Saved Messages:\n\n${messages.join("\n")}`
        );
      } else {
        await bot.sendMessage(chatId, "❌ No saved messages found.");
      }
      return;
    }

    if (greetings.includes(userMessage)) {
      const randomGreeting =
        greetingReplies[Math.floor(Math.random() * greetingReplies.length)];
      await bot.sendMessage(chatId, randomGreeting(userName));
      return;
    }

    if (weatherPhrases.some((phrase) => userMessage.includes(phrase))) {
      const cleanedMessage = userMessage
        .replace(/@\w+\s*/, "@gaiaishere_bot")
        .trim();

      const location = cleanedMessage
        .replace(
          /weather of|weather|weather at|weather in|how is the weather of|what is the weather of|temperature in|what's the weather in|weather of|weather details of|what's the weather like in|current weather in|forecast for|climate of|is it raining in|weather report of/i,
          ""
        )
        .trim();

      if (!location) {
        await bot.sendMessage(
          chatId,
          "❌ Please provide a city or country name. Example: weather in New York or what's the weather of Ranchi 🌍"
        );
        return;
      }

      try {
        const apiKey = "6198977deb06f9bc369c596a9888dfb3";
        const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;

        const response = await axios.get(weatherAPIUrl);
        const data = response.data;

        const temperature = data.main.temp;
        const weatherCondition = data.weather[0].description;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;

        let emoji;
        if (weatherCondition.includes("rain")) {
          emoji = "🌧️";
        } else if (weatherCondition.includes("clear")) {
          emoji = "☀️";
        } else if (weatherCondition.includes("cloud")) {
          emoji = "☁️";
        } else {
          emoji = "🌤️";
        }

        await bot.sendMessage(
          chatId,
          `${emoji} *Weather in ${data.name}:*\n\n- *Temperature:* ${temperature}°C 🌡️\n- *Condition:* ${weatherCondition} 🌦️\n- *Humidity:* ${humidity}% 💧\n- *Wind Speed:* ${windSpeed} m/s 🌬️`,
          { parse_mode: "Markdown" }
        );
      } catch (error) {
        console.error("Error fetching weather:", error.message);

        if (error.response && error.response.data.cod === "404") {
          await bot.sendMessage(
            chatId,
            '❌ City not found! Please check the spelling or try including the country name. Example: "Weather in Ranchi"'
          );
        } else {
          await bot.sendMessage(
            chatId,
            "❌ Unable to fetch weather details. Please check the city name or try again later 🔄."
          );
        }
      }
      return;
    }
  } catch (error) {
    console.error("Error handling message:", error.message);
    if (msg.chat) {
      await bot.sendMessage(
        msg.chat.id,
        "❌ An error occurred. Please try again later."
      );
    }
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const callbackData = callbackQuery.data;

  if (callbackData === "contract_address") {
    await bot.sendMessage(
      chatId,
      `✅ Contract Address:\n\n\`${contractAddress}\``,
      { parse_mode: "Markdown" }
    );
    await bot.answerCallbackQuery(callbackQuery.id);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
