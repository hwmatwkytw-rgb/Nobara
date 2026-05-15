const chalk = require('chalk');

module.exports.config = {
  name: "help",
  aliases: ["الاوامر", "اوامر", "مساعدة"],
  version: "1.0",
  author: "sinko",
  countDown: 5,
  adminOnly: false,
  description: "عرض قائمة الأوامر أو تفاصيل أمر معين",
  category: "الخدمات",
  guide: "{pn} [اسم الأمر] - اتركه فارغاً لرؤية كل الأوامر",
  usePrefix: true
};

module.exports.run = async function({ api, event, args, config }) {
  const { threadID, messageID, senderID } = event;
  const commands = new Map(global.commands);
  const prefix = config.prefix;

  try {
    if (!args.length) {
      let msg = `✨ [ دليل المبتدئين - الصفحة 1 ] ✨\n`;

      const categories = {};
      for (const [name, value] of commands) {
        // التحقق من صلاحيات المسؤول
        if (value.config.adminOnly && !config.adminUIDs.includes(senderID)) continue;
        
        // الحفاظ على التصنيف الأصلي كما هو لضمان عدم ضياع الأوامر
        const category = value.config.category || "غير مصنف";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      // ترتيب التصنيفات وعرضها
      Object.keys(categories).sort().forEach((category) => {
        msg += `\n╭──── [ قسم: ${category.toUpperCase()} ]\n│ ✧ ${categories[category].commands.sort().join(" ✧ ")}\n╰───────────────◊`;
      });

      msg += `\n\n╭─『 ${config.botName || "NexaloSim"} 』\n╰‣ إجمالي الأوامر: ${commands.size}\n╰‣ الصفحة 1 من 1\n╰‣ بوت ماسنجر شخصي ✨\n╰‣ المطور: Hridoy`;

      api.sendMessage(msg, threadID, messageID);
      console.log(chalk.cyan(`[Help] Full command list requested | ThreadID: ${threadID}`));
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get([...commands].find(([_, v]) => v.config.aliases?.includes(commandName))?.[0]);

      if (!command) {
        api.sendMessage(`❌ الأمر "${commandName}" غير موجود في قائمة الأوامر.`, threadID, messageID);
        console.log(chalk.red(`[Help Error] Command "${commandName}" not found | ThreadID: ${threadID}`));
        return;
      }

      const c = command.config;
      const usage = c.guide?.replace(/{pn}/g, `${prefix}${c.name}`) || `${prefix}${c.name}`;

      const res = `
╭──── الاسم ───♡
│ ${c.name}
├── معلومات
│ الوصف: ${c.description}
│ الاختصارات: ${c.aliases?.join(", ") || "لا يوجد"}
│ الإصدار: ${c.version || "1.0"}
│ الصلاحية: ${c.adminOnly ? "للمسؤولين فقط" : "للجميع"}
│ الانتظار: ${c.countDown || 1} ثانية
│ القسم: ${c.category || "غير مصنف"}
│ المطور: ${c.author || "Hridoy"}
├── الاستخدام
│ ${usage}
├── ملاحظات
│ استخدم ${prefix}help لعرض القائمة كاملة
│ <نص> = إلزامي ، [نص] = اختياري
╰────────────♡`.trim();

      api.sendMessage(res, threadID, messageID);
      console.log(chalk.cyan(`[Help] Details for "${commandName}" requested | ThreadID: ${threadID}`));
    }
  } catch (err) {
    console.log(chalk.red(`[Help Error] ${err.message}`));
    api.sendMessage("❌ حدث خطأ داخلي أثناء محاولة عرض المساعدة.", threadID, messageID);
  }
};
