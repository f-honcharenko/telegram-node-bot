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
const sceneConnecter = require('./scenes/_sceneConnecter');
const invoices = require('./invoices');
const user = require('./models/user');
const order = require('./models/order');
const keyboards = require('./keyboards');

//CONSTS
const stage = new Scenes.Stage(sceneConnecter);
const bot = new Telegraf(config.get("token"));
const port = process.env.PORT || config.get("port");
const app = express();

bot.use(session());
bot.use(stage.middleware());

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) // ответ на предварительный запрос по оплате

bot.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
    await ctx.reply('SuccessfulPayment')
});
bot.start(async (ctx) => {
    console.log(ctx.scene.scenes);
    let userID = ctx.message.from.id;
    let userFName = ctx.message.from.first_name;
    let userLName = ctx.message.from.last_name;
    let userLogin = ctx.message.from.username;
    let userType = '';
    await user.findOne({
        "telegramID": userID
    }, {}, (err, res) => {
        if (err) return ctx.reply(err);
        if (res) {
            userType = res.type;
        } else {
            userType = 'user';
            let candidate = new user({
                "telegramID": ctx.message.from.id,
                "type": userType,
                "telegramFirstName": userFName,
                "telegramLastName": userLName,
                "telegramLogin": userLogin,
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
                ctx.scene.enter("userScene");
                break;
            case "admin":
                ctx.reply("Тип учетной записи: ADMIN");
                ctx.scene.enter("adminScene");
                break;
            case "worker":
                ctx.reply("Тип учетной записи: WORKER");
                ctx.scene.enter("workerScene");
                break;
            case "moder":
                ctx.reply("Тип учетной записи: MODER");
                ctx.scene.enter("moderScene");
                break;
        }
        return null;
    });
});
bot.action(/getOrder/, async (ctx) => {
    let chatType = ctx.update.callback_query.message.chat.type;
    if ((chatType == "group") || (chatType == "supergroup")) {
        let mongoID = ctx.update.callback_query.data.slice(9);
        let msgID = ctx.update.callback_query.message.message_id;
        let chatID = ctx.update.callback_query.message.chat.id;
        let workerOBJ = ctx.update.callback_query.from;
        let text = ctx.update.callback_query.message.text;
        user.findOne({
            telegramID: workerOBJ.id
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска исполнителя в БД.");
            }
            if (resF) {
                if (resF.type == "worker") {
                    order.findOne({
                        _id: mongoID
                    }, (err, res) => {
                        if (err) {
                            console.log(err);
                            return ctx.reply("Ошибка. Заказ не найден.");
                        }
                        if (res) {
                            if (res.status == 'pendingWorker') {
                                if (res.worker == null) {
                                    order.updateOne({
                                        _id: mongoID
                                    }, {
                                        worker: workerOBJ.id,
                                        status: 'pending'
                                    }, (errU, resU) => {
                                        if (errU) {
                                            return ctx.reply('Ошибка обновления заказа.');
                                        }
                                        if (resU) {
                                            let entities = ctx.update.callback_query.message.entities;
                                            for (let i = 0; i < entities.length; i++) {
                                                if (entities[i].type == "text_link") {
                                                    entities[i].type = 'text_mention';
                                                    entities[i].user = workerOBJ;
                                                    entities[i].length = 1 + workerOBJ.first_name.length + workerOBJ.last_name.length;
                                                }
                                            }
                                            ctx.telegram.editMessageText(chatID, msgID, null, text.replace('Ожидается', workerOBJ.first_name + ' ' + workerOBJ.last_name), {
                                                entities: entities
                                            });
                                            ctx.telegram.sendMessage(res.creatorTelegramID, "Внимание! Ваш заказ принят в обработку одним из исполнителей.");

                                            // ctx.telegram.sendMessage(chatID, msgID, null, text.replace('Ожидается', workerOBJ.first_name + ' ' + workerOBJ.last_name), {
                                            //     entities: entities
                                            // });
                                        }
                                    })
                                }
                            } else if (res.status == 'canceled') {

                                return ctx.editMessageReplyMarkup({
                                    inline_keyboard: [
                                        [{
                                            text: 'Заказ отменен пользавтелем',
                                            callback_data: 'nullData'
                                        }]
                                    ],
                                })
                                // ctx.telegram.editMessageText(chatID, msgID, null, '' + text, );
                            }

                        }
                    });
                }
            }
        });

    } else {
        ctx.reply("Вы не можете принимать заказы, находясь вне группы.");
    };

});
bot.action(/goToMyOrders/, async (ctx) => {
    return ctx.scene.enter('myFromsScene');
});
bot.on("message", async (ctx) => {
    if ((ctx.update.message.chat.type == "group") || (ctx.update.message.chat.type == "supergroup")) {
        // return ctx.scene.enter('groupScene');
    } else {
        await user.findOne({
            "telegramID": ctx.message.chat.id
        }, {}, (err, res) => {
            if (err) return ctx.reply(err);
            if (res) {
                userType = res.type;
            } else {
                return ctx.reply('Проищошла ошибка. Перезапустите бота.');
            }
            switch (userType) {
                case "user":
                    ctx.reply("Тип учетной записи: USER");
                    ctx.scene.enter("userScene");
                    break;
                case "admin":
                    ctx.reply("Тип учетной записи: ADMIN");
                    ctx.scene.enter("adminScene");
                    break;
                case "worker":
                    ctx.reply("Тип учетной записи: WORKER");
                    ctx.scene.enter("workerScene");
                    break;
                case "moder":
                    ctx.reply("Тип учетной записи: MODER");
                    ctx.scene.enter("moderScene");
                    break;
            }
            return null;
        });
    }
});
// bot.telegram.setWebhook(config.get("webhook-link"));
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