const TNB = require("node-telegram-bot-api");
const TOKEN = "1873305865:AAHuGAc_kGzXt0KIdKSPddOdWS2qyxdfk4A";

const bot = new TNB(TOKEN, {
    polling: true
});

bot.on("message", (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello,' + msg.from.first_name + '!');
});


console.log("Test case: #4");