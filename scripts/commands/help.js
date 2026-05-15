const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "اوامر",
  aliases: ["help", "commands", "cmd", "الاوامر"],
  version: "5.7",
  author: "سينكو",
  countDown: 5,
  adminOnly: false,
  description: "عرض قائمة الأوامر بالزخرفة الجديدة.",
  category: "نظام",
  guide: "{pn}\n{pn} <اسم_الأمر>",
  usePrefix: true
};

async function downloadImage(url) {
  try {
    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

    const imagePath = path.join(cachePath, "help.jpg");
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
      timeout: 10000
    });
    fs.writeFileSync(imagePath, response.data);
    return imagePath;
  } catch (e) {
    return null; // لو فشل التحميل رجع null
  }
}

module.exports.run = async function({ api, event, args, config }) {
  const { threadID, messageID, senderID } = event;

  const allCommands = global.client?.commands || global.commands;

  if (!allCommands || (allCommands instanceof Map && allCommands.size === 0)) {
    return api.sendMessage("❌ لم يتم تحميل أي أوامر بعد أو القائمة فارغة.", threadID, messageID);
  }

  const prefix = config.PREFIX || ".";
  const adminList = config.ADMINBOT || []; // هنا التصحيح

  try {
    if (args[0]) {
      const input = args[0].toLowerCase();
      const command = allCommands.get(input) ||
                      Array.from(allCommands.values()).find(cmd => cmd.config.aliases && cmd.config.aliases.includes(input));

      if (!command) {
        return api.sendMessage(`❌ لم يتم العثور على الأمر "${input}"`, threadID, messageID);
      }

      const cmd = command.config;
      let detailMessage = `⏣────── ✾ ⌬ ✾ ──────⏣\n`;
      detailMessage += `✾ ┇ ⏣ ⟬ الإســم ⟭ : ${cmd.name}\n`;
      detailMessage += `✾ ┇ ◍ الـوصـف : ${cmd.description || "لا يوجد"}\n`;
      detailMessage += `✾ ┇ ◍ الـمؤلـف : ${cmd.author || "غير معروف"}\n`;
      detailMessage += `✾ ┇ ◍ الـإصـدار : ${cmd.version || "1.0"}\n`;

      if (cmd.guide) {
        const usage = typeof cmd.guide === "string"? cmd.guide : (cmd.guide.ar || "");
        detailMessage += `✾ ┇\n✾ ┇ ◍ طريقة الاستخدام :\n`;
        detailMessage += `✾ ┇ ⬩ ${usage.replace(/{pn}/g, prefix + cmd.name)}\n`;
      }
      detailMessage += `⏣────── ✾ ⌬ ✾ ──────⏣`;
      return api.sendMessage(detailMessage, threadID, messageID);
    }

    const categories = {};
    const uniqueCommands = [];
    const commandList = Array.from(allCommands.values());

    for (const cmd of commandList) {
      if (!cmd.config ||!cmd.config.name) continue;

      if (uniqueCommands.some(c => c.name === cmd.config.name)) continue;

      if (cmd.config.adminOnly &&!adminList.includes(senderID)) continue;

      uniqueCommands.push(cmd.config);

      let category = cmd.config.category || "عام";
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd.config.name);
    }

    let finalMessage = `⏣────── ✾ ⌬ ✾ ──────⏣\n✾ ┇\n`;

    for (const category in categories) {
      finalMessage += `✾ ┇ ⏣ ⟬ قـسـم ${category.toUpperCase()} ⟭\n`;
      const cmds = categories[category];

      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).map(c => `◍ ${c}`).join(" ");
        finalMessage += `✾ ┇ ${row}\n`;
      }
      finalMessage += `✾ ┇ ⸻⸻\n✾ ┇\n`;
    }

    finalMessage += `⏣────── ✾ ⌬ ✾ ──────⏣\n`;
    finalMessage += ` ⠇عـدد الأوامـر: ${uniqueCommands.length}\n`;
    finalMessage += ` ⠇الـمـطـوࢪ: sakran 𓆩☆𓆪`;

    const imagePath = await downloadImage("https://i.ibb.co/FZCHwt9/received-1740662803574945.webp");
    if (imagePath) {
      return api.sendMessage({
        body: finalMessage.trim(),
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => fs.unlinkSync(imagePath), messageID);
    } else {
      return api.sendMessage(finalMessage.trim(), threadID, messageID);
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage(`❌ حدث خطأ داخلي: ${err.message}`, threadID, messageID);
  }
};
