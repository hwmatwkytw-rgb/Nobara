const chalk = require('chalk');

module.exports.config = {
  name: "قائمة",
  aliases: ["اوامر", "help", "cmd"],
  version: "1.5.0",
  author: "Wael",
  countDown: 5,
  adminOnly: false,
  description: "عرض قائمة أوامر البوت حسب الفئات",
  category: "النظام",
  guide: "{pn} | {pn} <اسم الأمر>",
  usePrefix: true,
};

module.exports.run = async function ({
  api,
  event,
  args,
  config
}) {

  const {
    threadID,
    messageID
  } = event;

  try {

    api.setMessageReaction(
      "⏳",
      messageID,
      () => {},
      true
    );

    // جلب الأوامر
    let commands = null;

    if (
      global.GoatBot?.commands instanceof Map
    ) {

      commands =
        global.GoatBot.commands;

    } else if (
      global.client?.commands instanceof Map
    ) {

      commands =
        global.client.commands;

    } else if (
      global.client?.cmds instanceof Map
    ) {

      commands =
        global.client.cmds;
    }

    // فشل الجلب
    if (
      !commands ||
      commands.size === 0
    ) {

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

    const prefix =
      config.PREFIX || ".";

    // ═══════════════════
    // تفاصيل أمر
    // ═══════════════════

    if (
      args[0] &&
      args[0].toLowerCase() !== "الكل"
    ) {

      const input =
        args[0].toLowerCase();

      const command =
        commands.get(input) ||
        Array.from(
          commands.values()
        ).find(cmd =>
          cmd.config?.aliases?.includes(
            input
          )
        );

      if (!command) {

        api.setMessageReaction(
          "❌",
          messageID,
          () => {},
          true
        );

        return api.sendMessage(
          `❌ | الأمر "${input}" غير موجود.`,
          threadID,
          messageID
        );
      }

      const cmd =
        command.config;

      let msg = `
◈ ──『 تـفاصيل الأمـر 』── ◈

📝 | الاسم:
${cmd.name}

🏷️ | الصنف:
${cmd.category || cmd.commandCategory || "عام"}

📖 | الوصف:
${cmd.description || "لا يوجد"}

🛠️ | الاستخدام:
${
  cmd.guide
    ? cmd.guide.replace(
        /{pn}/g,
        prefix + cmd.name
      )
    : prefix + cmd.name
}

⏳ | الانتظار:
${cmd.countDown || cmd.cooldowns || 0} ثانية

━━━━━━━━━━━━━━
✨ | نسخة NOVA برمجة وائل
`;

      api.setMessageReaction(
        "✅",
        messageID,
        () => {},
        true
      );

      return api.sendMessage(
        msg,
        threadID,
        messageID
      );
    }

    // ═══════════════════
    // تصنيف الأوامر
    // ═══════════════════

    const categories = {};

    for (const cmd of commands.values()) {

      if (
        !cmd.config ||
        !cmd.config.name
      ) continue;

      const category =
        (
          cmd.config.category ||
          cmd.config.commandCategory ||
          "عام"
        ).toUpperCase();

      if (!categories[category]) {

        categories[category] = [];
      }

      categories[category].push(
        cmd.config.name
      );
    }

    // ═══════════════════
    // إنشاء الرسالة
    // ═══════════════════

    let msg = `
◈ ──『 📜 قـائمة أوامـر NOVA 』── ◈

`;

    for (const category in categories) {

      msg += `🔹 [ ${category} ]\n`;

      msg += `» ${categories[
        category
      ].join(" ، ")}\n\n`;
    }

    msg += `
━━━━━━━━━━━━━━
💡 | اكتب:
${prefix}قائمة + اسم الأمر

🚀 | مبرمج النسخة:
وائل
`;

    api.setMessageReaction(
      "✅",
      messageID,
      () => {},
      true
    );

    return api.sendMessage(
      msg,
      threadID,
      messageID
    );

  } catch (error) {

    console.log(
      chalk.red(
        `[HELP ERROR] ${error.message}`
      )
    );

    api.setMessageReaction(
      "❌",
      messageID,
      () => {},
      true
    );

    return api.sendMessage(
      `❌ | حدث خطأ\n${error.message}`,
      threadID,
      messageID
    );
  }
};
