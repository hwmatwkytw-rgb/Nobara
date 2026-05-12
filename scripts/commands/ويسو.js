const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "ويسو",
  aliases: ["ai", "ذكاء"],
  version: "1.0",
  author: "سينكو",
  countDown: 5,
  adminOnly: false,
  description: "ذكاء اصطناعي للردود",
  category: "ai",
  guide: "{pn} [سؤال]",
  usePrefix: false
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  const query = args.join(" ").trim();

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    // لو ما كتب شيء
    if (!query) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⚠️ اكتب شيء بعد الأمر.", threadID, messageID);
    }

    const response = await askAI(query);

    api.sendMessage(response, threadID, (err, info) => {
      if (!err) {
        api.setMessageReaction("✅", messageID, () => {}, true);

        if (!global.client.handleReply)
          global.client.handleReply = [];

        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID
        });
      }
    }, messageID);

    console.log(
      chalk.cyan(
        `[AI] تم استخدام الأمر بواسطة: ${senderID} في المجموعة: ${threadID}`
      )
    );

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);

    api.sendMessage(
      "⚠️ صار خطأ أثناء الاتصال بالذكاء الاصطناعي.",
      threadID,
      messageID
    );

    console.log(chalk.red(`[AI ERROR] ${error.message}`));
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (handleReply.author != senderID) return;

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const response = await askAI(body);

    api.sendMessage(response, threadID, (err, info) => {
      if (!err) {
        api.setMessageReaction("✅", messageID, () => {}, true);

        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID
        });
      }
    }, messageID);

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);

    api.sendMessage(
      "⚠️ فشل الرد من الذكاء الاصطناعي.",
      threadID,
      messageID
    );

    console.log(chalk.red(`[HANDLE REPLY ERROR] ${error.message}`));
  }
};

async function askAI(query) {

  try {

    const res = await axios.get(
      'https://api.simsimi.vn/v1/simtalk',
      {
        params: {
          text: query,
          lc: "ar"
        }
      }
    );

    return (
      res.data?.message ||
      "⚠️ لم يتم الحصول على رد."
    );

  } catch (e) {
    console.log("API Error:", e.response?.data || e.message);
    throw e;
  }
}
