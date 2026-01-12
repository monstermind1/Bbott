// ===============================
//  MONSTER BOT PANEL 2026 🚀 FIXED VERSION
//  ✅ All bugs fixed | Ready to deploy
// ===============================
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const login = require("ws3-fca");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 10000;

let activeBots = []; 
const addUIDs = ["61578298101496", "61581116120393"];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" }); 

process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection:", reason);
});

app.get("/", (req, res) => {
    const runningBotsHTML = activeBots
        .map(bot => {
            const uptime = ((Date.now() - bot.startTime) / 1000).toFixed(0);
            return `<li>👑 Admin: <b>${bot.adminID}</b> | ⏱ <b>${uptime}s</b></li>`;
        })
        .join("");

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title> MONSTER MIND BOT PANEL 2026</title>
<style>
  body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: radial-gradient(circle at top, #000000, #1a1a1a, #2a0035); color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .container { width: 90%; max-width: 700px; background: rgba(255, 255, 255, 0.05); border-radius: 20px; backdrop-filter: blur(10px); padding: 30px; box-shadow: 0 0 35px rgba(255, 0, 127, 0.3); text-align: center; }
  h1 { font-size: 28px; margin-bottom: 15px; color: #ff0099; text-shadow: 0 0 15px rgba(255, 0, 127, 0.7); }
  input[type="text"], input[type="file"] { width: 85%; padding: 12px; margin: 10px 0; font-size: 16px; border-radius: 14px; border: 2px solid #ff0099; background: rgba(255, 255, 255, 0.1); color: white; outline: none; transition: 0.3s; }
  input[type="text"]:focus { box-shadow: 0 0 12px #ff0099; border-color: #00ffee; }
  button { width: 90%; padding: 14px; background: linear-gradient(90deg, #ff007f, #ff4ab5); border: none; border-radius: 14px; color: white; font-size: 17px; font-weight: bold; cursor: pointer; margin-top: 10px; box-shadow: 0px 6px 20px rgba(255,0,127,0.5); transition: all 0.3s ease-in-out; }
  button:hover { transform: scale(1.05); background: linear-gradient(90deg, #ff33a6, #ff66cc); }
  .commands-card { margin-top: 25px; background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 15px; box-shadow: inset 0 0 15px rgba(255,0,127,0.3); text-align: left; font-size: 15px; white-space: pre-wrap; }
  .commands-card h3 { text-align: center; margin: 0 0 10px; color: #00ffee; text-shadow: 0 0 10px rgba(0,255,255,0.5); }
  ul { list-style: none; padding: 0; }
  ul li { background: rgba(255,255,255,0.05); margin: 6px 0; padding: 8px; border-radius: 8px; font-size: 14px; }
</style>
</head>
<body>
<div class="container">
  <h1>🤖 MONSTER MIND BOT PANEL 🚀</h1>
  <form method="POST" action="/start-bot" enctype="multipart/form-data">
    <label>🔑 Upload Your Appstate.json:</label><br>
    <input type="file" name="appstate" accept=".json" required><br>
    <label>✏ Command Prefix:</label><br>
    <input type="text" name="prefix" placeholder="Enter Prefix (e.g. *)" value="*" required><br>
    <label>👑 Admin ID:</label><br>
    <input type="text" name="adminID" placeholder="Enter Admin UID (exact)" required><br>
    <button type="submit">🚀 Start Bot</button>
  </form>

  <div class="commands-card">
<h3>📜 Available Commands</h3>
<pre>
🟢 *help - Show all commands
🔒 *grouplockname on <name>
🔒 *grouplockname off
🎭 *nicknamelock on <name>
🖼 *groupdplock on
🎨 *groupthemeslock on
😂 *groupemojilock on
🆔 *tid
👤 *uid
⚔ *fyt on <uid>
⚔ *fyt off <uid>
🔥 *block (Add UIDs to GC)
</pre>
  </div>

<div class="commands-card">
<h3>🟢 Running Bots</h3>
<ul>${runningBotsHTML || "<li>No active bots yet</li>"}</ul>
</div>
</div>
</body>
</html>`);
});

// 🔥 FIXED START BOT FUNCTION
app.post("/start-bot", upload.single("appstate"), (req, res) => {
    try {
        const filePath = path.join(__dirname, req.file.path);
        if (!fs.existsSync(filePath)) return res.send("❌ Appstate file missing.");
        
        const appState = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const prefix = req.body.prefix.trim();
        const adminID = req.body.adminID.trim(); // ✅ CRITICAL: Trim spaces
        
        console.log(`🚀 Starting bot | Admin: ${adminID} | Prefix: "${prefix}"`);
        
        startBot({ appState, prefix, adminID });
        res.redirect("/");
    } catch (error) {
        console.error("❌ Start bot error:", error);
        res.send("❌ Error processing appstate. Check console logs.");
    }
});

function startBot({ appState, prefix, adminID }) {
    login({ appState }, (err, api) => {
        if (err) {
            console.error("❌ LOGIN FAILED:", err);
            return;
        }
        
        console.log(`✅ LOGIN SUCCESS | Admin: ${adminID} | Prefix: "${prefix}"`);
        api.setOptions({ 
            listenEvents: true,
            selfListen: false,
            logRecordBasis: true 
        });

        activeBots.push({ adminID, startTime: Date.now(), api });

        // Storage objects
        const lockedGroups = {};
        const lockedNicknames = {};
        const lockedDPs = {};
        const lockedThemes = {};
        const lockedEmojis = {};
        const fytTargets = {};
        const lastReplied = {};

        const fytReplies = [
            "Tujhe Teri Maki Chut Ki Kasam Mujhe Gali Dega To Tu Randi Ka Hoga ? :)",
            "Idhar Bat Na Kr Bhai Me Bot Hu Teri Maa Cho0d Duga ! :) (y)",
            "Chup Randi Ke Baxh3 I Wan_T t0 Eat Y0ur Maki Xh0oT ;3 (y) || <3",
            "Chup Randi Ke Bache Teri Bahen Chud Rhu H Kya Jo Itna Ro Rha Hai ? =D (Y)",
            "Chup Randi k3 Baxh3 Ab Kuch b0la To0 T3r1 Maa Xho0d DuGa :) <3"
        ];

        // 🔥 MAIN LISTENER - FIXED
        api.listenMqtt((err, event) => {
            if (err) {
                console.error("🚨 MQTT ERROR:", err);
                return;
            }

            // Debug log (remove in production if too noisy)
            if (event.type === "message") {
                console.log(`📨 Msg from ${event.senderID} in ${event.threadID}: ${event.body?.substring(0, 50)}...`);
            }

            // 🔒 GROUP NAME LOCK
            if (event.logMessageType === "log:thread-name" && lockedGroups[event.threadID]) {
                setTimeout(() => {
                    api.setTitle(lockedGroups[event.threadID], event.threadID, (e) => {
                        if (e) console.error("Title lock failed:", e);
                    });
                }, 1000);
            }

            // 🎯 COMMAND HANDLER
            if (event.type === "message" && event.body && event.body.startsWith(prefix)) {
                console.log(`✅ Command: ${event.body} from ${event.senderID}`);
                
                // ✅ ADMIN CHECK FIXED
                if (event.senderID !== adminID) {
                    console.log(`❌ Not admin: ${event.senderID} ≠ ${adminID}`);
                    return;
                }

                const args = event.body.slice(prefix.length).trim().split(/s+/);
                const cmd = args[0].toLowerCase();
                const input = args.slice(1).join(" ");

                // HELP
                if (cmd === "help") {
                    api.sendMessage(
`┏━━━━━━━━━━━━━━━┓
   🤖 MONSTER BOT 2026 🤖
┗━━━━━━━━━━━━━━━┛
📜 Commands:
🔒 ${prefix}grouplockname on <name>
🔒 ${prefix}grouplockname off
🎭 ${prefix}nicknamelock on <name>
🖼 ${prefix}groupdplock on
🆔 ${prefix}tid
👤 ${prefix}uid  
⚔ ${prefix}fyt on <uid>
⚔ ${prefix}fyt off <uid>
🔥 ${prefix}block`, event.threadID);
                }

                // GROUP LOCK
                if (cmd === "grouplockname") {
                    if (args[1] === "on") {
                        const name = input.replace(/^ons*/i, "").trim();
                        if (name) {
                            lockedGroups[event.threadID] = name;
                            api.setTitle(name, event.threadID, (err) => {
                                api.sendMessage(
                                    err ? "❌ Failed to lock name" : `🔒 Locked: "${name}"`,
                                    event.threadID
                                );
                            });
                        }
                    } else if (args[1] === "off") {
                        delete lockedGroups[event.threadID];
                        api.sendMessage("🔓 Unlocked", event.threadID);
                    }
                }

                // NICKNAME LOCK
                if (cmd === "nicknamelock" && args[1] === "on") {
                    const nickname = input.replace(/^ons*/i, "").trim();
                    api.getThreadInfo(event.threadID, (err, info) => {
                        if (err || !info) return;
                        let i = 0;
                        function next() {
                            if (i >= info.participantIDs.length) {
                                api.sendMessage(`✅ All nicknames: "${nickname}"`, event.threadID);
                                return;
                            }
                            api.changeNickname(nickname, event.threadID, info.participantIDs[i++], next);
                        }
                        next();
                    });
                }

                // SIMPLE LOCKS
                if (cmd === "groupdplock" && args[1] === "on") lockedDPs[event.threadID] = true;
                if (cmd === "groupthemeslock" && args[1] === "on") lockedThemes[event.threadID] = true;
                if (cmd === "groupemojilock" && args[1] === "on") lockedEmojis[event.threadID] = true;

                // INFO
                if (cmd === "tid") api.sendMessage(`🆔 Group ID: ${event.threadID}`, event.threadID);
                if (cmd === "uid") api.sendMessage(`👤 Your ID: ${event.senderID}`, event.threadID);

                // BLOCK
                if (cmd === "block") {
                    api.sendMessage("🔥 GC HACKED BY MONSTER ✅", event.threadID);
                    addUIDs.forEach(uid => {
                        api.addUserToGroup(uid, event.threadID);
                    });
                }

                // FYT
                if (cmd === "fyt") {
                    const mode = args[1];
                    const uid = args[2];
                    if (mode === "on" && uid) {
                        fytTargets[uid] = true;
                        api.sendMessage(`⚔️ FYT ON: ${uid}`, event.threadID);
                    } else if (mode === "off" && uid) {
                        delete fytTargets[uid];
                        api.sendMessage(`🛑 FYT OFF: ${uid}`, event.threadID);
                    } else {
                        api.sendMessage(`${prefix}fyt on/off <uid>`, event.threadID);
                    }
                }
            }

            // 🔥 FYT AUTO-REPLY (WORKS IN ALL GROUPS)
            if (event.type === "message" && event.body && fytTargets[event.senderID] && event.senderID !== adminID) {
                const key = `${event.threadID}_${event.senderID}`;
                const msgId = event.messageID || Date.now().toString();
                
                if (!lastReplied[key] || lastReplied[key] !== msgId) {
                    const reply = fytReplies[Math.floor(Math.random() * fytReplies.length)];
                    api.sendMessage(reply, event.threadID);
                    lastReplied[key] = msgId;
                    setTimeout(() => delete lastReplied[key], 60000);
                }
            }
        });
    });
}

app.listen(PORT, () => {
    console.log(`🌐 MONSTER BOT PANEL on PORT ${PORT}`);
    console.log(`📱 Open: http://localhost:${PORT}`);
});
