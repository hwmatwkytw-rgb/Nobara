const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "اوامر",
  aliases: ["help", "commands", "cmd", "الاوامر"],
  version: "5.8",
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
    throw new Error(`فشل تحميل الصورة: ${e.message}`);
  }
}

module.exports.run = async function({ api, event, args, config }) {
  const { threadID, messageID, senderID } = event;

  try {
    // 1. فحص جلب الأوامر
    const allCommands = global.client?.commands || global.commands;
    if (!allCommands) {
      throw new Error("global.client.commands و global.commands غير موجودين");
    }
    if (allCommands instanceof Map && allCommands.size === 0) {
      throw new Error("قائمة الأوامر فارغة");
    }

    const prefix = config.PREFIX || ".";
    const adminList = Array.isArray(config.ADMINBOT)? config.ADMINBOT : [];

    // 2. تفاصيل أمر معين
    if (args[0]) {
      const input = args[0].toLowerCase();
      const command = allCommands.get(input) ||
                      Array.from(allCommands.values()).find(cmd => cmd.config?.aliases?.includes(input));

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

    // 3. تصنيف الأوامر
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

    // 4. تحميل الصورة وإرسالها
    try {
      const imagePath = await downloadImage("https://i.ibb.co/FZCHwt9/received-1740662803574945.webp");
      return api.sendMessage({
        body: finalMessage.trim(),
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => fs.unlinkSync(imagePath), messageID);
    } catch (imgErr) {
      // لو فشلت الصورة، ابعت النص لوحده
      await api.sendMessage(finalMessage.trim() + "\n\n⚠️ ملاحظة: فشل تحميل الصورة", threadID, messageID);
      throw imgErr; // نرمي الخطأ عشان يطلع تحت
    }

  } catch (err) {
    // هذا هو الجزء المهم: يرجع لك الخطأ الحقي
    const errorMsg = `❌ تعطل الأمر\nالسبب: ${err.message}\n\nStack:\n${err.stack}`;
    console.error(errorMsg);
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
