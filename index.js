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

const scenarioTypeScene = new Scenes.BaseScene('SCENARIO_TYPE_SCENE_ID');

scenarioTypeScene.enter((ctx) => {
    ctx.session.myData = {};
    ctx.reply('What is your drug?', Markup.inlineKeyboard([
        Markup.callbackButton('Movie', MOVIE_ACTION),
        Markup.callbackButton('Theater', THEATER_ACTION),
    ]).extra());
});

scenarioTypeScene.action(THEATER_ACTION, (ctx) => {
    ctx.reply('You choose theater');
    ctx.session.myData.preferenceType = 'Theater';
    return ctx.scene.enter('SOME_OTHER_SCENE_ID'); // switch to some other scene
});

scenarioTypeScene.action(MOVIE_ACTION, (ctx) => {
    ctx.reply('You choose movie, your loss');
    ctx.session.myData.preferenceType = 'Movie';
    return ctx.scene.leave(); // exit global namespace
});

scenarioTypeScene.leave((ctx) => {
    ctx.reply('Thank you for your time!');
});

// What to do if user entered a raw message or picked some other option?
scenarioTypeScene.use((ctx) => ctx.replyWithMarkdown('Please choose either Movie or Theater'));
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



exports.telegramBotWebhook = (req, res) => {
    bot.handleUpdate(req.body, res);
};