module.exports.config = {
  name: "كنية",
  version: "1.0.1",
  hasPermssion: 1,
  credits: "عمر",
  description: "تعيين كنية تلقائية لأي عضو ينضم",
  commandCategory: "مسؤولي المجموعات",
  usages: "[اضف <الاسم> / حذف]",
  cooldowns: 5
};

module.exports.onLoad = () => {

  const { existsSync, writeFileSync } = global.nodemodule["fs-extra"];
  const { join } = global.nodemodule["path"];

  const pathData = join(__dirname, "cache", "autosetname.json");

  if (!existsSync(pathData)) {
    writeFileSync(pathData, "[]", "utf-8");
  }
};

module.exports.run = async function ({ event, api, args, Users }) {

  const { threadID, messageID } = event;

  const {
    readFileSync,
    writeFileSync
  } = global.nodemodule["fs-extra"];

  const { join } = global.nodemodule["path"];

  const pathData = join(__dirname, "cache", "autosetname.json");

  let dataJson = JSON.parse(
    readFileSync(pathData, "utf-8")
  );

  let thisThread = dataJson.find(
    item => item.threadID == threadID
  );

  if (!thisThread) {
    thisThread = {
      threadID,
      nameUser: []
    };

    dataJson.push(thisThread);
  }

  const content = args.slice(1).join(" ").trim();

  switch ((args[0] || "").toLowerCase()) {

    case "اضف":
    case "add": {

      if (!content) {

        return api.sendMessage(
          "❌ لا يمكن ترك اسم الكنية فارغًا!",
          threadID,
          messageID
        );
      }

      if (thisThread.nameUser.length > 0) {

        return api.sendMessage(
          "❌ يوجد كنية محفوظة بالفعل، احذفها أولاً!",
          threadID,
          messageID
        );
      }

      thisThread.nameUser.push(content);

      const name = (
        await Users.getData(event.senderID)
      ).name;

      writeFileSync(
        pathData,
        JSON.stringify(dataJson, null, 4),
        "utf-8"
      );

      return api.sendMessage(
        `✅ تم حفظ الكنية التلقائية بنجاح\n\n` +
        `◉ الكنية: ${content}\n` +
        `◉ بواسطة: ${name}`,
        threadID,
        messageID
      );
    }

    case "حذف":
    case "remove":
    case "delete": {

      if (thisThread.nameUser.length == 0) {

        return api.sendMessage(
          "❌ لا توجد كنية محفوظة لهذه المجموعة!",
          threadID,
          messageID
        );
      }

      thisThread.nameUser = [];

      writeFileSync(
        pathData,
        JSON.stringify(dataJson, null, 4),
        "utf-8"
      );

      return api.sendMessage(
        "✅ تم حذف الكنية التلقائية بنجاح",
        threadID,
        messageID
      );
    }

    default: {

      return api.sendMessage(
        `📌 الاستخدام:\n\n` +
        `◉ كنية اضف <الاسم>\n` +
        `لتعيين كنية تلقائية للأعضاء الجدد\n\n` +
        `◉ كنية حذف\n` +
        `لحذف الكنية التلقائية`,
        threadID,
        messageID
      );
    }
  }
};
