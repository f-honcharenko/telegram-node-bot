const {
    Telegraf,
    Scenes
} = require('telegraf')
const config = require('config');
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const bot = new Telegraf(config.get("token"));
const port = process.env.PORT || config.get("port");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

bot.start((ctx) => ctx.reply(`Welcome to the most silly bot you'll ever see`));
bot.help((ctx) => ctx.reply(`Write anything to me and I'll repeat it :)`));
bot.on('text', (ctx) => ctx.reply(ctx.message.text)); //listen to every text message

bot.on('message', ctx => ctx.reply('Command not recognized')); //avoid timeouts with unsupported commands
bot.telegram.setWebhook(config.get("webhook-link"));

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.post('/webhook', (req, res) => {
    // res.status(200);
    console.log("POST [" + req.ip + "]");
    bot.handleUpdate(req.body, res);

})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})