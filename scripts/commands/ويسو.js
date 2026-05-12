const axios = require('axios');

module.exports = {
  config: {
    name: "ويسو",
    version: "1.0",
    author: "سينكو",
    countDown: 5,
    role: 0,
    description: "ذكاء اصطناعي للردود نسخة GoatBot",
    category: "ai",
    guide: {
      en: "{pn} [سؤال]"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    const query = args.join(" ");

    if (!query) {
      return message.reply("⚠️ أكتب كاش حاجة باش نجاوبك.");
    }

    try {
      message.reaction("⏳");

      const res = await axios.get(`https://api.pollinations.ai/prompt/${encodeURIComponent(query)}`);
      const respond = res.data;

      const info = await message.reply(respond);
      message.reaction("✅");

      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID
      });

    } catch (p) {
      message.reaction("❌");
      return message.reply("⚠️ صرا مشكل مع الـ API.");
    }
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { author } = Reply;
    if (event.senderID != author) return;

    try {
      message.reaction("⏳");

      const res = await axios.get(`https://api.pollinations.ai/prompt/${encodeURIComponent(event.body)}`);
      const respond = res.data;

      const info = await message.reply(respond);
      message.reaction("✅");

      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID
      });
    } catch (p) {
      message.reaction("❌");
    }
  }
};
