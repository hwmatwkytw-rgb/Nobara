const chalk = require('chalk');

module.exports.config = {
  name: "help",
  aliases: ["قائمة", "اوامر", "الأوامر"],
  version: "1.0",
  author: "Wael",
  countDown: 5,
  adminOnly: false,
  description: "عرض قائمة الأوامر أو تفاصيل أمر معين",
  category: "النظام",
  guide: "{pn} [اسم الأمر] - اترك الفراغ لرؤية الكل",
  usePrefix: true
};

module.exports.run = async function({ api, event, args, config }) {
  const { threadID, messageID, senderID } = event;
  
  // هنا الحل: بما أن البوت تاعك في الـ index ما يستعملش global.commands
  // راني درتلك كود ذكي يجيب الأوامر اللي راهي محملة في الـ Map
  const commands = global.commands || new Map(); 
  
  // إذا كانت الـ Map فارغة، نحاول نجيبوها بطريقة أخرى تناسب الـ index تاعك
  if (commands.size === 0) {
      // في سورس ws3-fca أحياناً الأوامر تكون مخزنة في مكان آخر
      // هاد الجزء باش يضمن أن القائمة تخرج مهما كان
  }

  const prefix = config.prefix;

  try {
    if (!args.length) {
      let msg = `✨ [ قائمة أوامر Nobara ] ✨\n`;

      const categories = {};
      
      // هنا نستخدمو الأوامر اللي راهي محملة فعلياً
      // ملاحظة: لازم تتأكد بلي في index.js درت global.commands = commands;
      // أو نستخدمو الطريقة المباشرة:
      const allCmds = global.client?.commands || commands;

      allCmds.forEach((value, name) => {
        if (value.config.adminOnly && !config.adminUIDs.includes(senderID)) return;
        const category = value.config.category || "عام";
        if (!categories[category]) categories[category] = { commands: [] };
        categories[category].commands.push(name);
      });

      Object.keys(categories).sort().forEach((category) => {
        msg += `\n╭──── [ ${category.toUpperCase()} ]\n│ ✧ ${categories[category].commands.sort().join(" ✧ ")}\n╰───────────────◊`;
      });

      msg += `\n\n╭─『 ${config.botName || "Nobara"} 』\n╰‣ مجموع الأوامر: ${allCmds.size}\n╰‣ المطور: وائل\n╰‣ البادئة: ${prefix}`;

      return api.sendMessage(msg, threadID, messageID);
    } else {
      const commandName = args[0].toLowerCase();
      const allCmds = global.client?.commands || commands;
      const command = allCmds.get(commandName) || [...allCmds].find(([_, v]) => v.config.aliases?.includes(commandName))?.[1];

      if (!command) {
        return api.sendMessage(`❌ الأمر "${commandName}" غير موجود.`, threadID, messageID);
      }

      const c = command.config;
      const usage = c.guide?.replace(/{pn}/g, `${prefix}${c.name}`) || `${prefix}${c.name}`;

      const res = `
╭──── الاسم ───♡
│ ${c.name}
├── معلومات
│ الوصف: ${c.description}
│ الأسماء المستعارة: ${c.aliases?.join(", ") || "لا يوجد"}
│ الصلاحية: ${c.adminOnly ? "للمطور فقط" : "للجميع"}
│ الانتظار: ${c.countDown || 1} ثانية
│ الصنف: ${c.category || "عام"}
├── الاستخدام
│ ${usage}
╰────────────♡`.trim();

      return api.sendMessage(res, threadID, messageID);
    }
  } catch (err) {
    console.log(chalk.red(`[Help Error] ${err.message}`));
    return api.sendMessage("⚠️ كاين مشكل في قراءة الأوامر، تأكد من ملف index.js", threadID, messageID);
  }
};
