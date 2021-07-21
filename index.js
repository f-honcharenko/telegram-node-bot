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
const mongoose = require('mongoose');
//MODELS
const scenesGen = require('./scenes');
const invoices = require('./invoices');
const user = require('./models/user');
const keyboards = require('./keyboards');

//CONSTS
const stage = new Scenes.Stage([scenesGen.startUserScene(), scenesGen.myFromsScene(), scenesGen.groupScene(), scenesGen.createFormScene(), scenesGen.startAdminScene()])
// const bot = new Telegraf(config.get("token"));
const port = process.env.PORT || config.get("port");
const app = express();

bot.use(session());
bot.use(stage.middleware());
bot.hears('pay', (ctx) => { // это обработчик конкретного текста, данном случае это - "pay"
    return ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id)) //  метод replyWithInvoice для выставления счета  
})

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) // ответ на предварительный запрос по оплате

bot.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
    await ctx.reply('SuccessfulPayment')
})
bot.start(async (ctx) => {
    let userID = ctx.message.from.id;
    let userType = '';
    await user.findOne({
        "telegramID": userID
    }, {}, (err, res) => {
        if (err) return ctx.reply(err);
        if (res) {
            userType = res.type;
        } else {
            // console.log("res not found");
            userType = user;
            let candidate = new user({
                "telegramID": ctx.message.from.id,
                "type": userType
            });
            candidate.save(async (errS, resS) => {
                if (errS) return tx.reply(errS);
                ctx.reply("Создана новая запись в БД");
            });
        }
        ctx.reply("[Отладка] ID: " + userID + "\n[Отладка] type: " + userType);
        switch (userType) {
            case "user":
                ctx.reply("Тип учетной записи: USER");
                ctx.scene.enter("startUserScene");
                break;
            case "admin":
                ctx.reply("Тип учетной записи: ADMIN");
                ctx.scene.enter("startAdminScene");
                break;
            case "worker":
                ctx.reply("Тип учетной записи: WORKER");
                // ctx.scene.enter("startAdminScene");
                break;
            case "moder":
                ctx.reply("Тип учетной записи: MODER");
                // ctx.scene.enter("startAdminScene");
                break;
        }
        return null;
    });
});
bot.hears('/getOrder_*/', async (ctx) => {
    // ctx.reply(JSON.stringify(ctx.update));
    console.log(ctx);
});
bot.on("message", (ctx) => {
    console.log(new Date(new Date().setHours(new Date().getHours() + 3)));
    if (ctx.update.message.chat.type == "group") {
        ctx.telegram.sendMessage(ctx.message.chat.id, "Бот находяиться в групповом чате, управление не доступно", keyboards.remove);
        return ctx.scene.enter('groupScene');
    } else {
        switch (ctx.message.text) {
            case "startUserScene":
                return ctx.scene.enter("startUserScene");
                break;
            case "startAdminScene":
                return ctx.scene.enter("startAdminScene");
                break;
            case "myFromsScene":
                return ctx.scene.enter("myFromsScene");
                break;
            case "createFormScene":
                // console.log(ctx.message);
                return ctx.scene.enter("createFormScene");
                break;
            default:
                ctx.reply(`Похоже, вы находитесь вне сцен, пожалуйста, выберите одну из перечисленных в меню.`, keyboards.scenes);
                break;
        }
    }
});
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
    mongoose.connect(config.get("mongo-link"), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
})