//REQUIRES
const {
    Extra,
    Markup,
    Stage,
    session,
    Telegraf,
    Scenes
} = require('telegraf')
const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const scenesGen = require('./scenes');

const myForms = scenesGen.myFromsScene();
const stage = new Scenes.Stage([scenesGen.startScene(), scenesGen.myFromsScene(), scenesGen.createFormScene()])
const bot = new Telegraf(config.get("token"));
const port = process.env.PORT || config.get("port");
const app = express();

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) =>
    ctx.scene.enter('startScene')
);
bot.help((ctx) => ctx.reply(`Write anything to me and I'll repeat it :)`));
bot.telegram.setWebhook(config.get("webhook-link"));
bot.launch();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.post('/webhook', (req, res) => {
    bot.handleUpdate(req.body, res);
})

app.listen(port, () => {
    console.log(`Example app listening at port: ${port}`)
})