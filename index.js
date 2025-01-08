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

function getDynamicGreeting(userName) {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return `Good morning, ${userName}! 🌞 How can I assist you today?`;
  } else if (currentHour < 18) {
    return `Good afternoon, ${userName}! ☀️ Hope you're having a great day!`;
  } else {
    return `Good evening, ${userName}! 🌜 How can I help you tonight?`;
  }
}

const savedMessages = {};
const contractAddress = "0x9eb54E00863b6e12eed39B6081E018fec8336EBc";

bot.on("message", async (msg) => {
  try {
    const userName = msg.from.first_name;
    const userMessage = msg.text?.toLowerCase();
    const chatId = msg.chat.id;

    const isGroupChat =
      msg.chat.type === "group" || msg.chat.type === "supergroup";
    const botUsername = (await bot.getMe()).username;

    let command = userMessage;

    if (isGroupChat) {
      if (command.includes(`@${botUsername}`)) {
        command = command.replace(`@${botUsername}`, "").trim();
      } else {
        return;
      }
    }

    if (!command) return;

    if (command === "help") {
      const helpText = `
    👋 **Hello, *${userName}*!** Welcome to the bot. Here’s what I can do:
    
    📜 *General Instructions*:
    - 🗨️ *In Private Chat*: You don't need to tag me; just type the commands.
    - 👥 *In Group Chat*: Make sure to tag me (e.g., \`@${botUsername}\`) when using commands.
    
    🤖 *Available Commands*:

    1. *🌟 Start*:
     - Intract and know about GAIA, and get links.
    
    2. *🌟 Greetings*:
       - Say \`hi\`, \`hello\`, \`hey\`, or \`gm\` to get a friendly response.
    
    3. *📄 Saved Messages*:
       - 🔄 **To Save**: Reply to a message with \`save this\`.
       - 📤 **To Retrieve**: Use \`get saved messages\`.
    
    4. *🌦️ Weather*:
       - Type \`weather <city_name>\` to get the current weather.
       - Example: \`weather New York\`.
    
    5. *📝 Contract Address*:
       - Type \`ca\` to get the contract address.

    6. *💰 Buy Link*:
       - Type \`buy link\` to get the link to buy $GAIA.
    
    7. *ℹ️ Help*:
       - Type \`help\` to display this message again.
    
    ✨ Enjoy using the bot! If you have any issues, feel free to reach out. 😊
      `;
      await bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
    }

    bot.on("callback_query", async (callbackQuery) => {
      const chatId = callbackQuery.message.chat.id;
      const callbackData = callbackQuery.data;

      if (callbackData === "contract_address") {
        await bot.sendMessage(
          chatId,
          `✅ Here is the Contract Address:\n\n\`0x9eb54E00863b6e12eed39B6081E018fec8336EBc\``,
          { parse_mode: "Markdown" }
        );
        await bot.answerCallbackQuery(callbackQuery.id);
      }
    });

    if (command === "start") {
      await bot.sendAnimation(
        chatId,
        "https://res.cloudinary.com/dddnxiqpq/video/upload/v1735885389/Gaia__the_angel_of_nature_with_Green_hair__green_eyes__elvish_clothes_hfx3d5.mp4",
        {
          caption: `**GAIA 🌱🤖**\n\nGaia is a nurturing AI agent inspiring sustainability through creativity, engagement, and Regenerative Finance, creating abundance for the whole planet. 🌎`,
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
                {
                  text: "Follow Community 📡",
                  url: "https://t.me/gaiaawake",
                },
                {
                  text: "Follow X 🚀",
                  url: "https://x.com/gaiaawake",
                },
              ],
            ],
          },
        }
      );
    }

    // Contract Address Command

    const contractAddressPhrases = [
      "ca",
      "contract address",
      "what is the contract address",
      "can you give me the contract address",
      "contract address gaia",
    ];

    if (contractAddressPhrases.some((phrase) => userMessage.includes(phrase))) {
      await bot.sendMessage(
        chatId,
        `✅ Here is the Contract Address:\n\n\`${contractAddress}\``,
        { parse_mode: "Markdown" }
      );
      return;
    }

    // Buy Link Command
    const buyLinkPatterns = [
      /gaia.*buy.*link/i,
      /what.*buy.*link/i,
      /.*buy.*link/i,
    ];

    if (buyLinkPatterns.some((pattern) => pattern.test(userMessage))) {
      await bot.sendMessage(
        chatId,
        `✅ Here is the Buy Link:\n\n\`https://app.virtuals.io/prototypes/0x9eb54E00863b6e12eed39B6081E018fec8336EBc/terminal\``,
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (command.includes("get saved messages")) {
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

    // Weather Command
    // Weather Command
    const weatherPhrases = [
      "weather",
      "what is the weather",
      "what's the weather",
      "weather of",
      "how is the weather",
      "weather in",
      "temperature in",
    ];

    if (weatherPhrases.some((phrase) => userMessage.includes(phrase))) {
      // Remove the bot's tag if the message includes it
      const cleanedMessage = userMessage
        .replace(/@\w+\s*/, "") // Removes "@YourBotUsername"
        .trim();

      const location = cleanedMessage
        .replace(
          /weather of|weather in|how is the weather of|what is the weather of|temperature in|what's the weather in|weather of|weather details of|what's the weather like in|current weather in|forecast for|climate of|is it raining in|weather report of/i,
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
        console.error(
          "Error fetching weather:",
          error.response?.data || error.message
        );

        if (error.response && error.response.data.cod === "404") {
          await bot.sendMessage(
            chatId,
            `❌ City not found! Please check the spelling or try including the country name. Example: "Weather in Ranchi"`
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

    if (greetings.includes(command)) {
      const dynamicReply = getDynamicGreeting(userName);
      bot.sendMessage(chatId, dynamicReply);
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
