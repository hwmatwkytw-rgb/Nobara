const chalk = require('chalk');
const axios = require('axios');

module.exports.config = {
  name: "ديون",
  aliases: ["ذكاء", "gpt", "بوت"],
  version: "1.0",
  author: "Wael",
  countDown: 5,
  adminOnly: false,
  description: "الذكاء الاصطناعي",
  category: "الذكاء",
  guide: "{pn} [سؤال]",
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  try {
    if (!args.length) {
      return api.sendMessage(
        "❌ | اكتب سؤال.\nمثال:\nديون من صنعك؟",
        threadID,
        messageID
      );
    }

    const prompt = args.join(" ");

    api.sendMessage("⏳ | جاري التفكير...", threadID);

    const res = await axios.get(
      `https://jonell.ccprojects.gleeze.com/api/gptoss?prompt=${encodeURIComponent(prompt)}`
    );

    const reply =
      res.data.reply ||
      res.data.response ||
      res.data.result ||
      "❌ | لم يتم العثور على رد.";

    return api.sendMessage(
      `🤖 | ${reply}`,
      threadID,
      messageID
    );

  } catch (err) {
    console.log(chalk.red(`[AI ERROR] ${err.message}`));

    return api.sendMessage(
      "⚠️ | حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.",
      threadID,
      messageID
    );
  }
};
