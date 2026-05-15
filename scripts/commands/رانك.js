const chalk = require('chalk');
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const {
  addUserBeatrix,
  getUserBeatrix
} = require("../../database/controllers/beatrix.controllers");

module.exports.config = {
  name: "رانك",
  aliases: ["rank"],
  version: "15.0.0",
  author: "Yamada KJ / Abdou",
  countDown: 5,
  adminOnly: false,
  description: "نظام رانك احترافي متكامل",
  category: "اقتصاد",
  guide: "{pn} | {pn} ترقية | {pn} كنية | {pn} خلفية",
  usePrefix: true,
};

// ═══════════════════════════════
// الجوائز
// ═══════════════════════════════

const BX_MILESTONES = {
  22: 2,
  28: 4,
  35: 10,
  40: 18,
  50: 50,
};

// ═══════════════════════════════
// الخلفيات
// ═══════════════════════════════

const backgrounds = [
  "https://i.ibb.co/4n1MtCk2/image-0.jpg",
  "https://i.ibb.co/PX1sBh7/image-0.jpg",
  "https://i.ibb.co/Xky8zpRM/image-1.jpg",
  "https://i.ibb.co/2BMQsrQ/image-2.jpg",
];

// ═══════════════════════════════
// المسارات
// ═══════════════════════════════

const USERS_DB_PATH = path.join(
  process.cwd(),
  "database",
  "users.json"
);

// ═══════════════════════════════
// خلفية المستخدم
// ═══════════════════════════════

function getUserBg(uid) {

  try {

    return JSON.parse(
      fs.readFileSync(
        USERS_DB_PATH,
        "utf8"
      ) || "{}"
    )[String(uid)]?.rankBackground || null;

  } catch {

    return null;
  }
}

function setUserBg(uid, url) {

  try {

    let data = {};

    try {

      data = JSON.parse(
        fs.readFileSync(
          USERS_DB_PATH,
          "utf8"
        ) || "{}"
      );

    } catch {}

    if (!data[String(uid)]) {
      data[String(uid)] = {};
    }

    if (url === null) {

      delete data[String(uid)].rankBackground;

    } else {

      data[String(uid)].rankBackground = url;
    }

    fs.ensureDirSync(
      path.dirname(USERS_DB_PATH)
    );

    fs.writeFileSync(
      USERS_DB_PATH,
      JSON.stringify(data, null, 2)
    );

  } catch (error) {

    console.log(
      chalk.red(
        `[RANK BG ERROR] ${error.message}`
      )
    );
  }
}

// ═══════════════════════════════
// تكلفة الترقية
// ═══════════════════════════════

function getUpgradeCost(level) {

  if (level < 10)
    return level * 1000;

  if (level < 20)
    return level * 2000;

  if (level < 30)
    return level * 3000;

  if (level < 40)
    return level * 4000;

  return level * 5000;
}

// ═══════════════════════════════
// لقب الرتبة
// ═══════════════════════════════

function getRankTitle(level) {

  if (level >= 100)
    return "✦ نَاجٍ فَوقَ الخَيَال ✦";

  if (level >= 75)
    return "👑 مَلِكُ الآلِهَة 👑";

  if (level >= 50)
    return "♕ الإمبراطور ♕";

  if (level >= 25)
    return "★ الفارس المقدس ★";

  if (level >= 10)
    return "✦ المتدرب ✦";

  return "✦ المستجد ✦";
}

// ═══════════════════════════════
// تحميل صورة
// ═══════════════════════════════

async function loadImg(url) {

  try {

    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 10000
    });

    const tmp = path.join(
      process.cwd(),
      "cache",
      `tmp_${Date.now()}.png`
    );

    fs.ensureDirSync(
      path.dirname(tmp)
    );

    fs.writeFileSync(
      tmp,
      Buffer.from(res.data)
    );

    const img = await loadImage(tmp);

    fs.remove(tmp);

    return img;

  } catch {

    return null;
  }
}

// ═══════════════════════════════
// دائرة
// ═══════════════════════════════

function circle(ctx, x, y, r) {

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    r,
    0,
    Math.PI * 2
  );

  ctx.closePath();
}

// ═══════════════════════════════
// بناء الكارت
// ═══════════════════════════════

async function buildRankCard({
  targetID,
  name,
  level,
  exp,
  levelUpExp,
  money,
  customBg
}) {

  const W = 900;
  const H = 500;

  const canvas = createCanvas(W, H);

  const ctx =
    canvas.getContext("2d");

  const bgUrl =
    customBg ||
    backgrounds[
      Math.floor(
        Math.random() *
        backgrounds.length
      )
    ];

  const bg = await loadImg(bgUrl);

  if (bg) {

    ctx.drawImage(
      bg,
      0,
      0,
      W,
      H
    );

  } else {

    ctx.fillStyle = "#111";

    ctx.fillRect(
      0,
      0,
      W,
      H
    );
  }

  ctx.fillStyle =
    "rgba(0,0,0,0.55)";

  ctx.fillRect(
    0,
    0,
    W,
    H
  );

  const avatar =
    await loadImg(
      `https://graph.facebook.com/${targetID}/picture?height=512&width=512`
    );

  if (avatar) {

    ctx.save();

    circle(
      ctx,
      150,
      240,
      100
    );

    ctx.clip();

    ctx.drawImage(
      avatar,
      50,
      140,
      200,
      200
    );

    ctx.restore();
  }

  ctx.strokeStyle = "#fff";

  ctx.lineWidth = 5;

  circle(
    ctx,
    150,
    240,
    100
  );

  ctx.stroke();

  ctx.fillStyle = "#fff";

  ctx.font =
    "bold 45px Arial";

  ctx.fillText(
    name,
    300,
    120
  );

  ctx.font =
    "bold 30px Arial";

  ctx.fillText(
    getRankTitle(level),
    300,
    180
  );

  ctx.fillText(
    `LVL ${level}`,
    300,
    240
  );

  ctx.fillStyle =
    "rgba(255,255,255,0.2)";

  ctx.fillRect(
    300,
    280,
    450,
    30
  );

  ctx.fillStyle = "#00ffcc";

  ctx.fillRect(
    300,
    280,
    (450 * exp) / levelUpExp,
    30
  );

  ctx.fillStyle = "#fff";

  ctx.font =
    "22px Arial";

  ctx.fillText(
    `${exp}/${levelUpExp} XP`,
    300,
    340
  );

  ctx.fillStyle = "#ffcc00";

  ctx.font =
    "bold 30px Arial";

  ctx.fillText(
    `$ ${money.toLocaleString()}`,
    300,
    410
  );

  return canvas.toBuffer();
}

// ═══════════════════════════════
// تشغيل الأمر
// ═══════════════════════════════

module.exports.run = async function ({
  api,
  event,
  args,
  Users,
  Economy,
  Exp,
  Threads
}) {

  const {
    threadID,
    messageID,
    senderID,
    mentions,
    body
  } = event;

  try {

    api.setMessageReaction(
      "⏳",
      messageID,
      () => {},
      true
    );

    const sub =
      args[0]?.toLowerCase();

    // ═══════════════════════════
    // خلفية
    // ═══════════════════════════

    if (sub === "خلفية") {

      const att =
        event.messageReply
          ?.attachments?.[0];

      const imgUrl =
        att?.url ||
        att?.previewUrl;

      if (!imgUrl) {

        return api.sendMessage(
          "⚠️ رد على صورة ثم اكتب:\nرانك خلفية",
          threadID,
          messageID
        );
      }

      setUserBg(
        senderID,
        imgUrl
      );

      api.setMessageReaction(
        "✅",
        messageID,
        () => {},
        true
      );

      return api.sendMessage(
        "✅ تم تعيين الخلفية",
        threadID,
        messageID
      );
    }

    // ═══════════════════════════
    // ترقية
    // ═══════════════════════════

    if (
      ["ترقية", "upgrade"]
      .includes(sub)
    ) {

      const xp =
        await Exp.check(
          senderID
        );

      const level =
        xp?.data
          ?.currentLevel || 1;

      const cost =
        getUpgradeCost(level);

      const cashR =
        await Economy.getBalance(
          senderID,
          "money"
        );

      const money =
        typeof cashR === "number"
          ? cashR
          : cashR?.data || 0;

      if (money < cost) {

        return api.sendMessage(
          `❌ تحتاج ${(
            cost - money
          ).toLocaleString()}$`,
          threadID,
          messageID
        );
      }

      await Economy.decrease(
        cost,
        senderID,
        "money"
      );

      await Exp.increase(
        senderID,
        xp.data.levelUpExp
      );

      api.setMessageReaction(
        "✅",
        messageID,
        () => {},
        true
      );

      return api.sendMessage(
        `✅ تمت الترقية إلى لفل ${level + 1}`,
        threadID,
        messageID
      );
    }

    // ═══════════════════════════
    // بطاقة الرانك
    // ═══════════════════════════

    let targetID = senderID;

    const mentionIDs =
      Object.keys(
        mentions || {}
      );

    if (mentionIDs.length) {
      targetID =
        mentionIDs[0];
    }

    const xp =
      await Exp.check(
        targetID
      );

    const level =
      xp?.data
        ?.currentLevel || 1;

    const exp =
      xp?.data?.exp || 0;

    const levelUpExp =
      xp?.data
        ?.levelUpExp || 500;

    const ui =
      await Users.getData(
        targetID
      );

    const name =
      ui?.name ||
      "Unknown";

    const cashR =
      await Economy.getBalance(
        targetID,
        "money"
      );

    const money =
      typeof cashR === "number"
        ? cashR
        : cashR?.data || 0;

    const customBg =
      getUserBg(targetID);

    const buffer =
      await buildRankCard({
        targetID,
        name,
        level,
        exp,
        levelUpExp,
        money,
        customBg
      });

    const filePath = path.join(
      process.cwd(),
      "cache",
      `rank_${Date.now()}.png`
    );

    fs.ensureDirSync(
      path.dirname(filePath)
    );

    fs.writeFileSync(
      filePath,
      buffer
    );

    api.setMessageReaction(
      "✅",
      messageID,
      () => {},
      true
    );

    return api.sendMessage(
      {
        body:
          "🪐 | بطاقة الرانك",
        attachment:
          fs.createReadStream(
            filePath
          )
      },
      threadID,
      () => {

        if (
          fs.existsSync(filePath)
        ) {
          fs.removeSync(filePath);
        }
      },
      messageID
    );

  } catch (error) {

    console.log(
      chalk.red(
        `[RANK ERROR] ${error.message}`
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

// ═══════════════════════════════
// Handle Reply
// ═══════════════════════════════

module.exports.handleReply =
async function () {
  return;
};

// ═══════════════════════════════
// Handle Event
// ═══════════════════════════════

module.exports.handleEvent =
async function () {
  return;
};
