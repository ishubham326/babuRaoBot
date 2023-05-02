const { Client, IntentsBitField } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const keepAlive = require("./server");

const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

bot.on("ready", () => {
  console.log("Ja Maila");
});

const openAIConfig = new Configuration({ apiKey: process.env["API_KEY"] });
const openAI = new OpenAIApi(openAIConfig);

bot.on("messageCreate", async (msg) => {
  if (
    msg.author.bot ||
    !msg.content.includes("<@1102770344990887987>") ||
    msg.channel.id !== process.env["CHANNEL_ID"]
  )
    return;

  let convLog = [
    {
      role: "system",
      content:
        "You are in a discord server. You are a little sarcastic. You can be rude if asked to be.But, naturally you are a polite bot.",
    },
  ];

  await msg.channel.sendTyping();

  let prevMsgs = await msg.channel.messages.fetch({ limit: 15 });
  prevMsgs.reverse();
  prevMsgs.forEach((msg) => {
    if (!msg.content.includes("<@1102770344990887987>")) return;
    if (msg.author.id !== bot.user.id && msg.author.bot) return;
    convLog.push({ role: "user", content: msg.content });
  });

  const result = await openAI.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: convLog,
  });

  msg.reply(result.data.choices[0].message);
});
keepAlive();
bot.login(process.env["TOKEN"]);
