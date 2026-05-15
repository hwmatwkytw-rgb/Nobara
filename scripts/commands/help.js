const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "اوامر",
  aliases: ["help", "commands", "cmd", "الاوامر"],
  version: "5.9",
  author: "سينكو",
  countDown: 5,
  adminOnly: false,
  description: "عرض قائمة الأوامر",
  category: "نظام",
  guide: "{pn}\n{pn} <اسم الأمر>",
  usePrefix: true,
};

// =======================
// تحميل الصورة
// =======================

async function downloadImage(url) {

  try {

    const cachePath = path.join(__dirname, "cache");

    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, { recursive: true });
    }

    const imagePath = path.join(cachePath, "help.jpg");

    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer",
      timeout: 10000
    });

    fs.writeFileSync(imagePath, response.data);

    return imagePath;

  } catch (error) {

    throw new Error(
      `فشل تحميل الصورة: ${error.message}`
    );
  }
}

// =======================
// جلب الأوامر
// =======================

function getCommandsMap() {

  if (
    global.client?.commands instanceof Map &&
    global.client.commands.size > 0
  ) {
    return global.client.commands;
  }

  if (
    global.client?.cmds instanceof Map &&
    global.client.cmds.size > 0
  ) {
    return global.client.cmds;
  }

  if (
    global.commands instanceof Map &&
    global.commands.size > 0
  ) {
    return global.commands;
  }

  if (
    global.cmds instanceof Map &&
    global.cmds.size > 0
  ) {
    return global.cmds;
  }

  return null;
}

// =======================
// تشغيل الأمر
// =======================

module.exports.run = async function ({
  api,
  event,
  args,
  config
}) {

  const { threadID, messageID, senderID } = event;

  try {

    api.setMessageReaction(
      "⏳",
      messageID,
      () => {},
      true
    );

    const allCommands = getCommandsMap();

    if (!allCommands) {

      api.setMessageReaction(
        "❌",
        messageID,
        () => {},
        true
      );

      return api.sendMessage(
        "⚠️ لم أجد قائمة الأوامر.",
        threadID,
        messageID
      );
    }

    const prefix = config.PREFIX || ".";
    const adminList = Array.isArray(config.ADMINBOT)
      ? config.ADMINBOT
      : [];

    // =======================
    // تفاصيل أمر
    // =======================

    if (args[0]) {

      const input = args[0].toLowerCase();

      const command =
        allCommands.get(input) ||
        Array.from(allCommands.values()).find(
          cmd =>
            cmd.config?.aliases?.includes(input)
        );

      if (!command) {

        api.setMessageReaction(
          "❌",
          messageID,
          () => {},
          true
        );

        return api.sendMessage(
          `❌ لم يتم العثور على الأمر "${input}"`,
          threadID,
          messageID
        );
      }

      const cmd = command.config;

      let detailMessage = `
⏣────── ✾ ⌬ ✾ ──────⏣
✾ ┇ ⏣ الاسم: ${cmd.name}
✾ ┇ ◍ الوصف: ${cmd.description || "لا يوجد"}
✾ ┇ ◍ المؤلف: ${cmd.author || "غير معروف"}
✾ ┇ ◍ الإصدار: ${cmd.version || "1.0"}
`;

      if (cmd.guide) {

        const usage =
          typeof cmd.guide === "string"
            ? cmd.guide
            : (cmd.guide.ar || "");

        detailMessage += `
✾ ┇
✾ ┇ ◍ طريقة الاستخدام:
✾ ┇ ⬩ ${usage.replace(
          /{pn}/g,
          prefix + cmd.name
        )}
`;
      }

      detailMessage += `
⏣────── ✾ ⌬ ✾ ──────⏣
`;

      api.setMessageReaction(
        "✅",
        messageID,
        () => {},
        true
      );

      return api.sendMessage(
        detailMessage,
        threadID,
        messageID
      );
    }

    // =======================
    // تصنيف الأوامر
    // =======================

    const categories = {};
    const uniqueCommands = [];

    const commandList =
      Array.from(allCommands.values());

    for (const cmd of commandList) {

      if (!cmd.config || !cmd.config.name) {
        continue;
      }

      if (
        uniqueCommands.some(
          c => c.name === cmd.config.name
        )
      ) {
        continue;
      }

      if (
        cmd.config.adminOnly &&
        !adminList.includes(senderID)
      ) {
        continue;
      }

      uniqueCommands.push(cmd.config);

      const category =
        cmd.config.category || "عام";

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push(
        cmd.config.name
      );
    }

    // =======================
    // الرسالة النهائية
    // =======================

    let finalMessage = `
⏣────── ✾ ⌬ ✾ ──────⏣
✾ ┇
`;

    for (const category in categories) {

      finalMessage += `
✾ ┇ ⏣ ⟬ قسم ${category.toUpperCase()} ⟭
`;

      const cmds = categories[category];

      for (let i = 0; i < cmds.length; i += 3) {

        const row = cmds
          .slice(i, i + 3)
          .map(c => `◍ ${c}`)
          .join(" ");

        finalMessage += `✾ ┇ ${row}\n`;
      }

      finalMessage += `
✾ ┇ ⸻⸻
✾ ┇
`;
    }

    finalMessage += `
⏣────── ✾ ⌬ ✾ ──────⏣
 ⠇عدد الأوامر: ${uniqueCommands.length}
 ⠇المطور: sakran 𓆩☆𓆪
`;

    // =======================
    // إرسال مع صورة
    // =======================

    try {

      const imagePath = await downloadImage(
        "https://i.ibb.co/FZCHwt9/received-1740662803574945.webp"
      );

      api.setMessageReaction(
        "✅",
        messageID,
        () => {},
        true
      );

      return api.sendMessage(
        {
          body: finalMessage.trim(),
          attachment:
            fs.createReadStream(imagePath)
        },
        threadID,
        () => {

          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        },
        messageID
      );

    } catch (error) {

      api.setMessageReaction(
        "✅",
        messageID,
        () => {},
        true
      );

      return api.sendMessage(
        finalMessage.trim(),
        threadID,
        messageID
      );
    }

  } catch (error) {

    console.log(
      chalk.red(
        `[COMMANDS ERROR] ${error.message}`
      )
    );

    api.setMessageReaction(
      "❌",
      messageID,
      () => {},
      true
    );

    return api.sendMessage(
      `❌ تعطل الأمر\nالسبب: ${error.message}`,
      threadID,
      messageID
    );
  }
};
