const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const config = require('config');

const keyboards = require('../keyboards');
const order = require('../models/order');
const groupList = config.get("telegram-group-array");

function myFromsScene() {
    const myFromsScene = new Scenes.BaseScene('myFromsScene');

    myFromsScene.enter(async (ctx) => {
        await ctx.reply("Смена сцены", keyboards.myForms);
    })

    myFromsScene.on('message', async (ctx) => {
        console.log(ctx.update.message.document);
        switch (ctx.message.text) {
            case "Готовые":
                order.find({
                    creatorTelegramID: ctx.message.from.id,
                    status: 'done'
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let buttonsArray = [];
                        res.forEach((el) => {
                            buttonsArray.push([Markup.button.callback(new Date(el.creationDate).toJSON().slice(0, 11).replace('T', ' ').replace('-', '.').replace('-', '.') + ' ' + el.title, 'getDoneOrderInfo_' + el._id)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        ctx.reply('Готовые заказы[' + res.length + ']:\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Нет готовых заказов.");
                    };
                });
                break;
            case "Выполняющиеся":
                order.find({
                    creatorTelegramID: ctx.message.from.id,
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
                    creatorTelegramID: ctx.message.from.id,
                    status: 'canceled'
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let buttonsArray = [];
                        res.forEach((el) => {
                            buttonsArray.push([Markup.button.callback(new Date(el.creationDate).toJSON().slice(0, 11).replace('T', ' ').replace('-', '.').replace('-', '.') + ' ' + el.title, 'getOrderInfo_' + el._id)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        ctx.reply('Отмененные заказы[' + res.length + ']:\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Нет отмененных заказов.");
                    };
                });
                break;
            case "Ожидают исполнителя":
                order.find({
                    creatorTelegramID: ctx.message.from.id,
                    status: 'pendingWorker'
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let buttonsArray = [];
                        res.forEach((el) => {
                            buttonsArray.push([Markup.button.callback(new Date(el.creationDate).toJSON().slice(0, 11).replace('T', ' ').replace('-', '.').replace('-', '.') + ' ' + el.title, 'getOrderInfo_' + el._id)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        ctx.reply('Заказы ожидающие исполнителя [' + res.length + ']:\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Нет заказов ожидающих исполнителя.");
                    };
                });
                break;
            case "Назад":
                await ctx.scene.enter('userScene');
                break;
            default:
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
                break;
        }
    })


    myFromsScene.action(/getOrderInfo_/, async (ctx) => {
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
                                text: 'Отменить заказ',
                                callback_data: 'cancleOrder_' + resF._id
                            }],
                        ]
                    },
                    parse_mode: 'HTML'
                });
            }
        });

    });
    myFromsScene.action(/getDoneOrderInfo_/, async (ctx) => {
        let candidateOrderId = ctx.update.callback_query.data.slice(17);
        console.log(candidateOrderId);
        order.findOne({
            _id: candidateOrderId
        }, async (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                await ctx.reply(`<b>Услуга: </b>${resF.title}\n<b>Дата: </b>${new Date(resF.creationDate).toJSON().slice(0, 19).replace('T', ' ').replace('-', '.').replace('-', '.')}\n<b>Статус: </b>${resF.status == 'pendingWorker' ? 'Ожидает исполнителя\n\n' : resF.status == 'pending' ? 'Исполняется\n\n' : resF.status == 'canceled' ? 'Отменён' : resF.status == 'done' ? 'Готов' : 'Неизвестно'}\n<b>Коментарий исполнителя :</b> ${resF.comment==null?'<i>Отсутсвует</i>':resF.comment}`, {
                    parse_mode: 'HTML'
                });
                resF.files.forEach(async (fileID) => {
                    await ctx.replyWithSticker(fileID)
                });
            }
        });

    });
    myFromsScene.action(/cancleOrder_/, async (ctx) => {
        let candidateOrderId = ctx.update.callback_query.data.slice(12);
        console.log(candidateOrderId);
        order.findOne({
            _id: candidateOrderId
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                return ctx.editMessageReplyMarkup({
                    inline_keyboard: [
                        [{
                            text: '✅Подтвердить',
                            callback_data: 'cancleOrderConfirm_' + resF._id
                        }, {
                            text: '❌Отмена',
                            callback_data: 'cancleOrderRefute_' + resF._id
                        }]
                    ],
                })
            }
        });

    });
    myFromsScene.action(/cancleOrderConfirm_/, async (ctx) => {
        let candidateOrderId = ctx.update.callback_query.data.slice(19);
        console.log();
        order.updateOne({
            _id: candidateOrderId
        }, {
            status: 'canceled'
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                order.findOne({
                    _id: candidateOrderId
                }, (errFo, resFo) => {
                    if (errFo) {
                        return ctx.reply("Ошибка поиска исполнителя в БД.");
                    }
                    if (resFo) {
                        if (resFo.worker) {
                            ctx.telegram.sendMessage(resFo.worker, "Внимание! Один из ваших заказов был отменен пользователем.");
                        }
                    }
                })

                return ctx.reply("Заказ успешно отменен!");
            }
        });

    });
    myFromsScene.action(/cancleOrderRefute_/, async (ctx) => {
        let candidateOrderId = ctx.update.callback_query.data.slice(18);
        console.log(candidateOrderId);
        return ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [{
                    text: 'Отменить заказ',
                    callback_data: 'cancleOrder_' + candidateOrderId
                }],
            ]
        })

    });
    return myFromsScene;
}

module.exports = myFromsScene();