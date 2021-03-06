const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const config = require('../config.json');
var LiqPay = require('../lib/liqpay');

var liqpay = new LiqPay("sandbox_i4345377497", "sandbox_PiUftLMJwcbiYnHSDuCdZMJOqf22a030Vfb0FVQj");
const keyboards = require('../keyboards');
const order = require('../models/order');
const groupList = config.telegramGroupArray;

function myFromsScene() {
    const myFromsScene = new Scenes.BaseScene('myFromsScene');

    myFromsScene.enter(async (ctx) => {
        await ctx.reply("Какие именно формы показать?", keyboards.myForms);
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
                if (resF.status == 'canceled') {
                    ctx.reply(`<b>Услуга: </b>${resF.title}\n<b>Дата: </b>${new Date(resF.creationDate).toJSON().slice(0, 19).replace('T', ' ').replace('-', '.').replace('-', '.')}\n<b>Статус: </b>${resF.status == 'pendingWorker' ? 'Ожидает исполнителя\n\n' : resF.status == 'pending' ? 'Исполняется\n\n' : resF.status == 'canceled' ? 'Отменён\n\n' : resF.status == 'done' ? 'Готов\n\n' : 'Неизвестно\n\n'}`, {
                        parse_mode: 'HTML'
                    });
                } else {
                    ctx.reply(`<b>Услуга: </b>${resF.title}\n<b>Дата: </b>${new Date(resF.creationDate).toJSON().slice(0, 19).replace('T', ' ').replace('-', '.').replace('-', '.')}\n<b>Статус: </b>${resF.status == 'pendingWorker' ? 'Ожидает исполнителя\n\n' : resF.status == 'pending' ? 'Исполняется\n\n' : resF.status == 'canceled' ? 'Отменён\n\n' : resF.status == 'done' ? 'Готов\n\n' : 'Неизвестно\n\n'}`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: 'Отменить заказ',
                                    callback_data: 'cancleOrder_' + resF._id
                                }],
                                [{
                                    text: 'Добавить комментарий/файл',
                                    callback_data: 'addComent_' + resF._id
                                }]
                            ]
                        },
                        parse_mode: 'HTML'
                    });
                }

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
                if (resF.rate == null) {
                    await ctx.reply(`Пожалуйста, оценить работу нашего сотрудника:`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                        text: '1',
                                        callback_data: 'setRate_' + resF._id + '_1',
                                    },
                                    {
                                        text: '2',
                                        callback_data: 'setRate_' + resF._id + '_2',
                                    }, {
                                        text: '3',
                                        callback_data: 'setRate_' + resF._id + '_3',
                                    }, {
                                        text: '4',
                                        callback_data: 'setRate_' + resF._id + '_4',
                                    }, {
                                        text: '5',
                                        callback_data: 'setRate_' + resF._id + '_5',
                                    },
                                ]
                            ]
                        },
                        parse_mode: 'HTML'
                    });
                };

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
        order.findOne({
            _id: candidateOrderId
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                order.findOne({
                    _id: candidateOrderId
                }, async (errFo, resFo) => {
                    if (errFo) {
                        return ctx.reply("Ошибка поиска исполнителя в БД.");
                    }
                    if (resFo) {
                        if (!resFo.worker) {
                            await liqpay.api("request", {
                                "action": "refund",
                                "version": "3",
                                "order_id": candidateOrderId
                            }, function (json) {
                                console.log(json);
                                if (json.status == "reversed") {
                                    order.updateOne({
                                        _id: candidateOrderId
                                    }, {
                                        status: 'canceled'
                                    }, async (errUo1, resUo1) => {
                                        if (errUo1) {
                                            return ctx.reply("Ошибка поиска исполнителя в БД.");
                                        }
                                        if (resUo1) {
                                            ctx.reply('Возварт успешно обработан. Ожидайте возврата срдеств в течении нескольких рабочих дней.');
                                        }
                                    });
                                } else if (json.status == "error") {
                                    ctx.reply('Ошибка. Вероятно платеж еще обрабывтается, или же уже возвращен. Попробуйте позже, или обратитесь к администратору, если ошибка не исчезает.');
                                }
                            });

                        } else {
                            ctx.reply('Вы не можете отменить заказ, так как он уже выполняется.');
                        }
                    }
                })
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
    myFromsScene.action(/setRate_/, async (ctx) => {
        let rateData = ctx.update.callback_query.data.split('_');
        order.updateOne({
            _id: rateData[1]
        }, {
            rate: rateData[2]
        }, async (errUo, resUo) => {
            if (errUo) {
                await ctx.reply("Ошибка поиск заказа в БД.");
            }
            if (resUo) {
                await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
                await ctx.reply("Спасибо за оценку!.");
            }
        })
    });
    myFromsScene.action(/addComent_/, async (ctx) => {
        let comentData = ctx.update.callback_query.data.split('_');
        order.findOne({
            _id: comentData[1]
        }, async (errFo, resFo) => {
            if (errFo) {
                await ctx.reply("Ошибка поиск заказа в БД.");
            }
            if (resFo) {
                ctx.session.order = resFo;
                return ctx.scene.enter('makeCommentScene');
            }
        })
    });
    return myFromsScene;
}

module.exports = myFromsScene();