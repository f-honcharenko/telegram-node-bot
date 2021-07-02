const {
    Telegraf
} = require('telegraf')
const config = require('config');
const express = require('express')


const app = express()
const bot = new Telegraf(config.get("token"));
const port = process.env.PORT || config.get("port");

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.post('/webhook', (req, res) => {
    res.send('post')
    console.log("POST [" + req.ip + "]");
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

bot.start((ctx) => ctx.reply(`Welcome to the most silly bot you'll ever see`));
bot.help((ctx) => ctx.reply(`Write anything to me and I'll repeat it :)`));
bot.on('text', (ctx) => ctx.reply(ctx.message.text)); //listen to every text message

bot.on('message', ctx => ctx.reply('Command not recognized')); //avoid timeouts with unsupported commands
bot.telegram.setWebhook(config.get("webhook-link"));

exports.telegramBotWebhook = (req, res) => {
    bot.handleUpdate(req.body, res);
};