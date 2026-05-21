module.exports = {
  config: {
    name: "help",
    aliases: ["الاوامر", "أوامر", "اوامر", "المساعدة"],
    version: "1.5.0",
    author: "Nobara Developer",
    countDown: 5,
    role: 0, // 0 = للجميع، 1 = للمطورين فقط
    usePrefix: true, // يحتاج بادئة ليعمل
    description: "يعرض قائمة الأوامر المتاحة في البوت أو تفاصيل أمر معين.",
    category: "system",
    guide: "{p}help [اسم الأمر]"
  },

  run: async ({ api, event, args, config }) => {
    const { threadID, messageID } = event;
    const prefix = config.prefix;

    // استدعاء جميع الأوامر من ملف البوت الأساسي عبر الـ require (أو تمريرها من الماب)
    // لكن بما أن الكود الأساسي لا يمرر الماب كاملة في الـ run، سنقوم بالوصول للأوامر من خلال الماب (إذا قمت بتعديل السورس لاحقاً) 
    // أو الأسهل: قراءة الكوماندز المتاحة حالياً من السيرفر. 
    // للحل الأضمن والمتوافق مع كودك الحالي، سنحتاج للوصول للماب المفتوحة في ملفك الرئيسي، 
    // وبما أن الكود يمرر فقط (api, event, args, config)، أفضل طريقة لتجنب التعديل في السورس هي كالتالي:

    // ملاحظة: للوصول للأوامر، سنعتمد على الماب التي تم تخزينها في السيرفر.
    // إذا واجهت مشكلة في قراءة `global.client.commands` سأعطيك الطريقة القياسية:
    
    // سنقوم بقراءة الأوامر المخزنة في الكود الرئيسي. بما أن الكود الرئيسي لم يضع `commands` في الـ global،
    // يفضل إضافة `global.commands = commands;` في ملفك الرئيسي بعد تعريف الماب مباشرة.
    
    const allCommands = global.commands || new Map(); 

    if (allCommands.size === 0) {
      return api.sendMessage("⚠️ لم يتم العثور على أوامر محملة في الذاكرة، تأكد من إضافة global.commands = commands في ملفك الرئيسي.", threadID, messageID);
    }

    // الحالة الأولى: طلب تفاصيل أمر معين (مثال: !help غني)
    if (args[0]) {
      const commandName = args[0].toLowerCase();
      const command = allCommands.get(commandName) || [...allCommands.values()].find(c => c.config.aliases?.includes(commandName));

      if (!command) {
        return api.sendMessage(`❌ عذراً، الأمر "${commandName}" غير موجود في قائمة الأوامر.`, threadID, messageID);
      }

      const { name, version, description, usePrefix, guide, aliases, adminOnly } = command.config;
      
      let msg = `═✨ تفاصيل الأمر [ ${name.toUpperCase()} ] ✨═\n\n`;
      msg += `📝 الوصف: ${description || 'لا يوجد وصف حالياً.'}\n`;
      msg += `🔄 الإصدار: ${version || '1.0.0'}\n`;
      msg += `⚙️ استخدام البادئة: ${usePrefix ? `نعم (${prefix})` : 'لا (يعمل تلقائياً)'}\n`;
      msg += `👑 خاص بالمطورين: ${adminOnly ? 'نعم' : 'لا'}\n`;
      if (aliases && aliases.length > 0) msg += `🔗 أسماء مستعارة: ${aliases.join(', ')}\n`;
      msg += `📖 طريقة الاستخدام: ${guide ? guide.replace('{p}', prefix) : `${prefix}${name}`}\n`;
      msg += `\n════════════════════`;

      return api.sendMessage(msg, threadID, messageID);
    }

    // الحالة الثانية: عرض كل الأوامر المتاحة
    let withPrefix = [];
    let withoutPrefix = [];

    allCommands.forEach((cmd) => {
      if (cmd.config.usePrefix === false) {
        withoutPrefix.push(`• ${cmd.config.name}`);
      } else {
        withPrefix.push(`• ${cmd.config.name}`);
      }
    });

    let helpMessage = `═════════ ✨ ＮＯＢＡＲＡ ✨ ═════════\n\n`;
    helpMessage += `⚡ البادئة الحالية للبوت هي: [ ${prefix} ]\n`;
    helpMessage += `📊 إجمالي الأوامر المتاحة: ${allCommands.size}\n\n`;

    if (withPrefix.length > 0) {
      helpMessage += `🔮 أوامر تحتاج بادئة [ ${prefix} ] :\n`;
      helpMessage += `${withPrefix.join('\n')}\n\n`;
    }

    if (withoutPrefix.length > 0) {
      helpMessage += `💬 أوامر بدون بادئة (تلقائية) :\n`;
      helpMessage += `${withoutPrefix.join('\n')}\n\n`;
    }

    helpMessage += `💡 للمزيد من التفاصيل حول أمر معين اكتب:\n👈 ${prefix}help [اسم الأمر]\n`;
    helpMessage += `══════════════════════════`;

    api.sendMessage(helpMessage, threadID, messageID);
  }
};
