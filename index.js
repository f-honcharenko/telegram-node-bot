// console.log(process.env.GOOGLE_CLOUD_REGION);
// console.log(process.env.GOOGLE_CLOUD_PROJECT_ID);
// console.log(process.env.FUNCTION_TARGET);


// const {
//     Telegraf
// } = require('telegraf')

// const TOKEN = process.env.TOKEN || "1873305865:AAHuGAc_kGzXt0KIdKSPddOdWS2qyxdfk4A"
// const GOOGLE_CLOUD_REGION = process.env.GOOGLE_CLOUD_REGION || "europe-west1";
// const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "node-telegram-bot-318510";
// const PORT = process.env.PORT || "8080";

// const bot = new Telegraf(TOKEN);
// bot.start((ctx) => ctx.reply(`Welcome to the most silly bot you'll ever see`));
// bot.help((ctx) => ctx.reply(`Write anything to me and I'll repeat it :)`));
// bot.on('text', (ctx) => ctx.reply(ctx.message.text)); //listen to every text message
// bot.on('message', ctx => ctx.reply('Command not recognized')); //avoid timeouts with unsupported commands
// bot.telegram.setWebhook(
//     `https://${GOOGLE_CLOUD_REGION}-${GOOGLE_CLOUD_PROJECT_ID}.cloudfunctions.net/${process.env.FUNCTION_TARGET}` //FUNCTION_TARGET is reserved Google Cloud Env
// );

// exports.telegramBotWebhook = (req, res) => {
//     bot.handleUpdate(req.body, res);
// };

// console.log("Test case: #7");


const express = require('express')
const app = express()
const port = process.env.PORT || "8080";

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.post('/webhook', (req, res) => {
    res.send('Hello World!')
    console.log(req);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})