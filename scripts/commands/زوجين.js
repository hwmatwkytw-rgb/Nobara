const chalk = require('chalk');

module.exports.config = {
  name: "زوجين",
  aliases: ["تطقيم", "ship"],
  version: "1.0",
  author: "سينكو",
  countDown: 5,
  adminOnly: false,
  description: "إرسال تطقيمات عشوائية",
  category: "تسلية",
  guide: "{pn}",
  usePrefix: true,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, participantIDs } = event;

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    // فلترة البوت
    const members = participantIDs.filter(id => id != api.getCurrentUserID());

    if (members.length < 2) {
      api.setMessageReaction("❌", messageID, () => {}, true);

      return api.sendMessage(
        "⚠️ لازم يكون في عضوين على الأقل.",
        threadID,
        messageID
      );
    }

    // اختيار عضوين عشوائي
    const random1 = members[Math.floor(Math.random() * members.length)];

    let random2;
    do {
      random2 = members[Math.floor(Math.random() * members.length)];
    } while (random1 === random2);

    // جلب الأسماء
    const user1 = await api.getUserInfo(random1);
    const user2 = await api.getUserInfo(random2);

    const name1 = user1[random1].name;
    const name2 = user2[random2].name;

    // نسبة الحب
    const love = Math.floor(Math.random() * 41) + 60;

    api.setMessageReaction("❤️", messageID, () => {}, true);

    return api.sendMessage({
      body:
`💞 | تطقيم جديد

👤 ${name1}
💘
👤 ${name2}

📊 نسبة التوافق: ${love}% ❤️`
    }, threadID, messageID);

  } catch (error) {
    console.log(chalk.red(`[Zawjain Error] ${error.message}`));

    api.setMessageReaction("❌", messageID, () => {}, true);

    api.sendMessage(
      "⚠️ حدث خطأ في النظام.",
      threadID,
      messageID
    );
  }
};
