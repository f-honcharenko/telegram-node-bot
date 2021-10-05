//REQUIRES
const {
    Extra,
    Markup,
    Stage,
    Telegraf,
    Scenes,
    session
} = require('telegraf')
const config = require('./config.json');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const os = require('os');
const fs = require('fs');
const axios = require('axios');
// const MongoSession = require('telegraf-session-mongo');
const LocalSession = require('telegraf-session-local')

const MongoSession = require('telegraf-session-mongodb').session;
//MODELS



const sceneConnecter = require('./scenes/_sceneConnecter');
const user = require('./models/user');
const order = require('./models/order');
const keyboards = require('./keyboards');

//CONSTS
const stage = new Scenes.Stage(sceneConnecter);
const bot = new Telegraf(config.token);
const port = process.env.PORT || config.port;
const app = express();



app.use(bot.webhookCallback('/webhook'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.post('/api/webhook', (req, res) => {
    console.log('REQUEST');
    console.log(req.body);
    bot.handleUpdate(req.body, res);
})

app.post('/api/ping', (req, res) => {
    res.json(req.body).status(418);
})

app.get('/webhook', (req, res) => {
    res.status(200).json({
        msg: 'webhook alright'
    });
})

//EXPRESS SERVER
app.listen(port, () => {
    console.log(`Example app listening at port: ${port}`)
    mongoose.connect(config.mongoLink, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }, (err, client) => {
        if (err) {
            return console.log('Error connect to DB');
        }
        if (client) {
            console.log('Successful connection to DB');
            const db = client.connections[0].db;
            // console.log(db);
            // console.log(Object.keys(db));
            bot.use(session());
            // bot.use(MongoSession(db, {
            //     collectionName: 'sessions'
            // }));
            // const session = new MongoSession(db, {});
            // // Setup function creates necessary indexes for ttl and key lookup
            // session.setup().then(() => {
            //     bot.use(session.middleware);
            // });
            bot.telegram.setWebhook(config.webhookLink);
            startBot();
        }
    });
})

function startBot() {
    // bot.use((new LocalSession({
    //     database: os.tmpdir()+'/example_db.json'
    // })).middleware())
    stage.command('mainmenu', async (ctx, next) => {
        let userID = ctx.message.from.id;
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
            switch (userType) {
                case "user":
                    ctx.reply("Тип учетной записи: Заказчик");
                    ctx.scene.enter("userScene");
                    break;
                case "admin":
                    ctx.reply("Тип учетной записи: Администратор");
                    ctx.scene.enter("adminScene");
                    break;
                case "worker":
                    ctx.reply("Тип учетной записи: Исполнитель");
                    ctx.scene.enter("workerScene");
                    break;
                case "moder":
                    ctx.reply("Тип учетной записи: Модератор");
                    ctx.scene.enter("moderScene");
                    break;
            }
            return null;
        });
    })
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
            // ctx.reply("[Отладка] ID: " + userID + "\n[Отладка] type: " + userType);
            switch (userType) {
                case "user":
                    // ctx.reply("Тип учетной записи: USER");
                    ctx.scene.enter("userScene");
                    break;
                case "admin":
                    // ctx.reply("Тип учетной записи: ADMIN");
                    ctx.scene.enter("adminScene");
                    break;
                case "worker":
                    // ctx.reply("Тип учетной записи: WORKER");
                    ctx.scene.enter("workerScene");
                    break;
                case "moder":
                    // ctx.reply("Тип учетной записи: MODER");
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
                                                console.log("pendingWorker resU");
                                                console.log(ctx.update.callback_query.message.entities);
                                                let entities = ctx.update.callback_query.message.entities;
                                                for (let i = 0; i < entities.length; i++) {
                                                    if (entities[i].type == "text_link") {
                                                        entities[i].type = 'text_mention';
                                                        entities[i].user = workerOBJ;
                                                        entities[i].length = 1 + workerOBJ.first_name ? workerOBJ.first_name.length : 0 + workerOBJ.last_name ? workerOBJ.last_name.length : 0;
                                                    }
                                                }
                                                ctx.telegram.editMessageText(chatID, msgID, null, text.replace('Ожидается', workerOBJ.first_name ? workerOBJ.first_name : '' + ' ' + workerOBJ.last_name ? workerOBJ.last_name : ''), {
                                                    entities: entities
                                                });
                                                // ctx.reply();
                                                ctx.telegram.sendMessage(res.creatorTelegramID, "Внимание! Ваш заказ принят в обработку одним из исполнителей.");
                                                ctx.telegram.sendMessage(workerOBJ.id, "Внимание! Вы приняли новый заказ. ЗАказ перемещен в папку [Исполняемые]");

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
        console.log(ctx);
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
                    return ctx.reply('Произошла ошибка. Перезапустите бота.');
                }
                switch (userType) {
                    case "user":
                        // ctx.reply("Тип учетной записи: USER");
                        ctx.scene.enter("userScene");
                        break;
                    case "admin":
                        // ctx.reply("Тип учетной записи: ADMIN");
                        ctx.scene.enter("adminScene");
                        break;
                    case "worker":
                        // ctx.reply("Тип учетной записи: WORKER");
                        ctx.scene.enter("workerScene");
                        break;
                    case "moder":
                        // ctx.reply("Тип учетной записи: MODER");
                        ctx.scene.enter("moderScene");
                        break;
                }
                return null;
            });
        }
    });
    console.log("WEBHOOK-LINK: " + config.webhookLink);
    console.log("WEBHOOK-TOKEN: " + config.token);
    bot.telegram.sendMessage(855986991, "Test2");
    // console.log(bot.telegram.options);
    let index_Interval = 0;
    setInterval(() => {
        // bot.telegram.sendMessage(855986991, "Index interval(5 min): "+index_Interval);
        index_Interval++;


        axios.post(config.webhookLink, {
                firstName: 'repeater',
            })
            .then(function (response) {
                // console.log(response.body);
            })
            .catch(function (error) {
                // console.log(error);
            });
    }, 1000 * 60 * 5);
    // bot.launch();
    // console.log(os.tmpdir());
    // fs.readFile(os.tmpdir()+"/example_db.json", "utf8", 
    //             function(error,data){
    //                 console.log("Асинхронное чтение файла");
    //                 if(error) throw error; // если возникла ошибка
    //                 console.log(data);  // выводим считанные данные
    // });
    // bot.telegram.setWebhook(config.get("webhook-link"));
}
module.exports = app;