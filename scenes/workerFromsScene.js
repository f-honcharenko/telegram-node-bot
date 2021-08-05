const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const user = require('../models/user');
const order = require('../models/order');

function workerFromsScene() {
    const workerFromsScene = new Scenes.BaseScene('workerFromsScene');

    workerFromsScene.enter(async (ctx) => {
        return ctx.reply("start workerFromsScene scene", keyboards.workerForms);
    })

    workerFromsScene.on('message', async (ctx) => {
        console.log(ctx.message.from.id);
        let workerCandidateID = ctx.message.chat.id;
        switch (ctx.message.text) {
            case "Готовые":
                order.find({
                    worker: ctx.message.from.id,
                    status: 'done'
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let buttonsArray = [];
                        res.forEach((el) => {
                            buttonsArray.push([Markup.button.callback(new Date(el.creationDate).toJSON().slice(0, 11).replace('T', ' ').replace('-', '.').replace('-', '.') + ' ' + el.title, 'getDoneOrderInfo_' + el._id)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        ctx.reply('Готовые заказы [' + res.length + ']:\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Нет готовых заказов.");
                    };
                });
                break;
            case "Выполняющиеся":
                order.find({
                    worker: ctx.message.from.id,
                    status: 'pending'
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let buttonsArray = [];
                        res.forEach((el) => {
                            buttonsArray.push([Markup.button.callback(new Date(el.creationDate).toJSON().slice(0, 11).replace('T', ' ').replace('-', '.').replace('-', '.') + ' ' + el.title, 'getOrderInfo_' + el._id)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        ctx.reply('Заказы в процессе исполнения [' + res.length + ']:\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Нет выполняющихся заказов.");
                    };
                });
                break;
            case "Отмененые":
                order.find({
                    worker: ctx.message.from.id,
                    status: 'canceled'
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let buttonsArray = [];
                        res.forEach((el) => {
                            buttonsArray.push([Markup.button.callback(new Date(el.creationDate).toJSON().slice(0, 11).replace('T', ' ').replace('-', '.').replace('-', '.') + ' ' + el.title, 'getOrderInfo_' + el._id)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        ctx.reply('Отмененные заказы [' + res.length + ']:\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Нет отмененных заказов.");
                    };
                });
                break;
            case "Назад":
                await ctx.scene.enter('workerScene');
                break;
            default:
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
                break;
        }
    })
    workerFromsScene.action(/getOrderInfo_/, async (ctx) => {
        let candidateOrderId = ctx.update.callback_query.data.slice(13);
        order.findOne({
            _id: candidateOrderId
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                let inlineMessageRatingKeyboard = Markup.inlineKeyboard([Markup.button.callback("Отменить заказ")]);
                ctx.reply(`<b>Услуга: </b>${resF.title}\n<b>Дата: </b>${new Date(resF.creationDate).toJSON().slice(0, 19).replace('T', ' ').replace('-', '.').replace('-', '.')}\n<b>Статус: </b>${resF.status == 'pendingWorker' ? 'Ожидает исполнителя\n\n' : resF.status == 'pending' ? 'Исполняется\n\n' : resF.status == 'canceled' ? 'Отменён\n\n' : resF.status == 'done' ? 'Готов\n\n' : 'Неизвестно\n\n'}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Завершить заказ',
                                callback_data: 'doneOrder_' + resF._id
                            }],
                        ]
                    },
                    parse_mode: 'HTML'
                });
            }
        });

    });
    workerFromsScene.action(/getDoneOrderInfo_/, async (ctx) => {
        let candidateOrderId = ctx.update.callback_query.data.slice(17);
        console.log(candidateOrderId);
        order.findOne({
            _id: candidateOrderId
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                ctx.reply(`<b>Услуга: </b>${resF.title}\n<b>Дата: </b>${new Date(resF.creationDate).toJSON().slice(0, 19).replace('T', ' ').replace('-', '.').replace('-', '.')}\n<b>Статус: </b>${resF.status == 'pendingWorker' ? 'Ожидает исполнителя\n\n' : resF.status == 'pending' ? 'Исполняется\n\n' : resF.status == 'canceled' ? 'Отменён' : resF.status == 'done' ? 'Готов' : 'Неизвестно'}\n<b>Коментарий исполнителя :</b> ${resF.comment==null?'<i>Отсутсвует</i>':resF.comment}`, {
                    parse_mode: 'HTML'
                });
                resF.files.forEach(async (fileID) => {
                    await ctx.replyWithSticker(fileID)
                });
            }
        });

    });
    workerFromsScene.action(/doneOrder_/, async (ctx) => {
        let candidateOrderId = ctx.update.callback_query.data.slice(10);
        console.log(candidateOrderId);
        order.findOne({
            _id: candidateOrderId
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                ctx.session.order = resF;
                // ctx.state.order = resF;
                // console.log(ctx.session);
                return ctx.scene.enter('doneOrderScene');
            }
        });

    });
    return workerFromsScene;
}


module.exports = workerFromsScene();