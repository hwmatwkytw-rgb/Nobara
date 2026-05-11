const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "اوامر",
  aliases: ["help", "commands", "cmd", "الاوامر"],
  version: "5.6",
  author: "سينكو",
  countDown: 5,
  adminOnly: false,
  description: "عرض قائمة الأوامر بالزخرفة الجديدة.",
  category: "نظام",
  guide: "{pn}\n{pn} <اسم_الأمر>",
  usePrefix: true
};

async function downloadImage(url) {
  const imagePath = path.join(__dirname, "cache", "help.jpg");

  const response = await axios({
    url,
    method: "GET",
    responseType: "arraybuffer"
  });

  fs.writeFileSync(imagePath, response.data);

  return imagePath;
}

module.exports.run = async function({ api, event, args, config }) {

  const { threadID, messageID, senderID } = event;

  const commands = global.commands instanceof Map
    ? global.commands
    : new Map(Object.entries(global.commands || {}));

  const prefix = config.prefix || ".";

  try {

    // =========================
    // تفاصيل أمر معين
    // =========================

    if (args[0]) {

      const input = args[0].toLowerCase();

      let command = commands.get(input);

      if (!command) {

        for (const [name, value] of commands) {

          if (
            value &&
            value.config &&
            Array.isArray(value.config.aliases) &&
            value.config.aliases.includes(input)
          ) {
            command = value;
            break;
          }
        }
      }

      if (!command) {

        return api.sendMessage(
          `❌ لم يتم العثور على الأمر "${input}"`,
          threadID,
          null,
          messageID
        );
      }

      const cmd = command.config;

      let detailMessage = `⏣────── ✾ ⌬ ✾ ──────⏣\n`;
      detailMessage += `✾ ┇ ⏣ ⟬ الإســم ⟭ : ${cmd.name}\n`;
      detailMessage += `✾ ┇ ◍ الـوصـف : ${cmd.description || "لا يوجد"}\n`;
      detailMessage += `✾ ┇ ◍ الـمؤلـف : ${cmd.author || "غير معروف"}\n`;
      detailMessage += `✾ ┇ ◍ الـإصـدار : ${cmd.version || "1.0"}\n`;

      if (cmd.guide) {

        const usage = typeof cmd.guide === "string"
          ? cmd.guide
          : cmd.guide.ar || "";

        detailMessage += `✾ ┇\n✾ ┇ ◍ طريقة الاستخدام :\n`;
        detailMessage += `✾ ┇ ⬩ ${usage.replace(/{pn}/g, prefix + cmd.name)}\n`;
      }

      detailMessage += `⏣────── ✾ ⌬ ✾ ──────⏣`;

      return api.sendMessage(
        detailMessage,
        threadID,
        null,
        messageID
      );
    }

    // =========================
    // تصنيف الأوامر
    // =========================

    const categories = {};

    const categoryMap = {
      group: "المجموعة",
      image: "الصور",
      media: "الوسائط",
      admin: "الإدارة",
      fun: "الترفيه",
      random: "عشوائي",
      music: "الموسيقى",
      video: "الفيديو",
      ai: "الذكاء الاصطناعي",
      tools: "الأدوات",
      utility: "الخدمات السريعة",
      owner: "المطور",
      level: "المستوى",
      game: "اللعب",
      play: "اللعب"
    };

    const uniqueCommands = [];

    for (const [name, command] of commands) {

      if (!command || !command.config) continue;

      const cmd = command.config;

      if (
        cmd.adminOnly &&
        Array.isArray(config.adminUIDs) &&
        !config.adminUIDs.includes(senderID)
      ) continue;

      if (uniqueCommands.find(c => c.name === cmd.name)) continue;

      uniqueCommands.push(cmd);

      let category = cmd.category || "الترفيه";

      if (
        ["اقتصاد", "اللعب", "game", "play"].includes(category)
      ) category = "اللعب";

      if (
        category === "owner" ||
        category === "المطور"
      ) category = "المطور";

      category = categoryMap[category] || category;

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push(cmd.name);
    }

    const orderedCats = [
      "المجموعة",
      "الصور",
      "الوسائط",
      "الذكاء الاصطناعي",
      "الترفيه",
      "اللعب",
      "عشوائي",
      "المطور",
      "الأدوات"
    ];

    // =========================
    // بناء القائمة
    // =========================

    let finalMessage = `⏣────── ✾ ⌬ ✾ ──────⏣\n✾ ┇\n`;

    for (const category of orderedCats) {

      const cmds = categories[category];

      if (!cmds || !cmds.length) continue;

      if (
        category === "المطور" &&
        Array.isArray(config.adminUIDs) &&
        !config.adminUIDs.includes(senderID)
      ) continue;

      finalMessage += `✾ ┇ ⏣ ⟬ قـسـم ${category.toUpperCase()} ⟭\n`;

      for (let i = 0; i < cmds.length; i += 3) {

        const row = cmds
          .slice(i, i + 3)
          .map(cmd => `◍ ${cmd}`)
          .join(" ");

        finalMessage += `✾ ┇ ${row}\n`;
      }

      finalMessage += `✾ ┇ ⸻⸻⸻⸻⸻\n✾ ┇\n`;
    }

    finalMessage += `⏣────── ✾ ⌬ ✾ ──────⏣\n`;
    finalMessage += ` ⠇عـدد الأوامـر: ${uniqueCommands.length}\n`;
    finalMessage += ` ⠇الـمـطـوࢪ: sakran 𓆩☆𓆪`;

    // =========================
    // إرسال الصورة
    // =========================

    try {

      const imagePath = await downloadImage(
        "https://i.ibb.co/FZCHwt9/received-1740662803574945.webp"
      );

      return api.sendMessage({
        body: finalMessage.trim(),
        attachment: fs.createReadStream(imagePath)
      },
      threadID,
      () => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      },
      messageID
      );

    } catch (err) {

      console.log(
        chalk.red(`[Help Image Error] ${err.message}`)
      );

      return api.sendMessage(
        finalMessage.trim(),
        threadID,
        null,
        messageID
      );
    }

  } catch (err) {

    console.log(
      chalk.red(`[Help Error] ${err.stack || err.message}`)
    );

    return api.sendMessage(
      `❌ حدث خطأ:\n${err.message}`,
      threadID,
      null,
      messageID
    );
  }
};
