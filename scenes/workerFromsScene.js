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
        return ctx.reply("Какие именно формы показать?", keyboards.workerForms);
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
                return ctx.scene.enter('workerScene');
            default:
                return ctx.reply("Пожалуйста, используйте меню для навигации.");
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
                ctx.reply(`<b>Услуга: </b>${resF.title}\n<b>Дата: </b>${new Date(resF.creationDate).toJSON().slice(0, 19).replace('T', ' ').replace('-', '.').replace('-', '.')}\n<b>Статус: </b>${resF.status == 'pendingWorker' ? 'Ожидает исполнителя' : resF.status == 'pending' ? 'Исполняется' : resF.status == 'canceled' ? 'Отменён' : resF.status == 'done' ? 'Готов\n\n' : 'Неизвестно'}\n<b>Заказчик: </b> <a href='tg://user?id=${resF.creatorTelegramID}'>Link</a>`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Завершить заказ',
                                callback_data: 'doneOrder_' + resF._id
                            }],
                            [{
                                text: 'Показать коментарии',
                                callback_data: 'getComments_' + resF._id
                            }],
                            [{
                                text: 'Прикрепленные файлы(доп.)',
                                callback_data: 'getFiles_' + resF._id
                            }],
                            [{
                                text: 'Показать форму',
                                callback_data: 'getForm_' + resF._id
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
        order.findOne({
            _id: candidateOrderId
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                ctx.reply(`<b>Услуга: </b>${resF.title}\n<b>Дата: </b>${new Date(resF.creationDate).toJSON().slice(0, 19).replace('T', ' ').replace('-', '.').replace('-', '.')}\n<b>Статус: </b>${resF.status == 'pendingWorker' ? 'Ожидает исполнителя\n\n' : resF.status == 'pending' ? 'Исполняется\n\n' : resF.status == 'canceled' ? 'Отменён' : resF.status == 'done' ? 'Готов' : 'Неизвестно'}\n<b>Заказчик: </b> <a href='tg://user?id=${resF.creatorTelegramID}'>Link</a>\n<b>Коментарий исполнителя :</b> ${resF.comment==null?'<i>Отсутсвует</i>':resF.comment}`, {
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
                console.log(ctx.session);
                ctx.scene.enter('doneOrderScene');
            }else{
                console.log("resF not found");
            }
        });

    });
    workerFromsScene.action(/getComments_/, async (ctx) => {
        let comentData = ctx.update.callback_query.data.split('_');
        order.findOne({
            _id: comentData[1]
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                ctx.session.order = resF;
                let keyboard = [];
                resF.userComment.forEach((coment, index) => {
                    keyboard.push([{
                        text: coment,
                        callback_data: 'getCommentByIndex_' + index
                    }]);
                });
                ctx.reply(`Все комментарии: `, {
                    reply_markup: {
                        inline_keyboard: keyboard
                    },
                    parse_mode: 'HTML'
                });
                // console.log(resF.userComment);
                // ctx.reply(resF.userComment);
                // return ctx.scene.enter('doneOrderScene');
            }
        });

    });
    workerFromsScene.action(/getCommentByIndex_/, async (ctx) => {
        let comentData = ctx.update.callback_query.data.split('_');
        ctx.reply(`<b>Коментарий: </b> ` + ctx.session.order.userComment[comentData[1]], {
            parse_mode: 'HTML'
        });

    });
    workerFromsScene.action(/getFiles/, async (ctx) => {
        let comentData = ctx.update.callback_query.data.split('_');
        order.findOne({
            _id: comentData[1]
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                resF.userFiles.forEach(async (fileID) => {
                    await ctx.replyWithSticker(fileID)
                });
            }
        });

    });
    workerFromsScene.action(/getFileByIndex_/, async (ctx) => {
        let comentData = ctx.update.callback_query.data.split('_');
        order.findOne({
            _id: comentData[1]
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                return ctx.replyWithSticker(resF._data[comentData[2]].data)
            }
        });

    });
    workerFromsScene.action(/getForm_/, async (ctx) => {
        let keyboard = [];
        let comentData = ctx.update.callback_query.data.split('_');
        order.findOne({
            _id: comentData[1]
        }, (errF, resF) => {
            if (errF) {
                return ctx.reply("Ошибка поиска Заказа в БД.");
            }
            if (resF) {
                let textRexponce = '';
                resF._data.forEach((el, index) => {
                    switch (el.type) {
                        case 'text':
                            textRexponce += '<b>' + el.fieldName + ': </b>' + el.data + '\n';
                            break;
                        case 'document':
                            keyboard.push([{
                                text: el.fieldName,
                                callback_data: 'getFileByIndex_' + comentData[1] + '_' + index
                            }]);
                            break;
                        default:
                            ctx.reply('Ошибка определения типа поля формы!\n' + el.type);
                            console.log(el);
                            break;
                    }
                });
                return ctx.reply(textRexponce, {
                    reply_markup: {
                        inline_keyboard: keyboard
                    },
                    parse_mode: 'HTML'
                })
                console.log(resF);
            }
        });

    });
    return workerFromsScene;
}


module.exports = workerFromsScene();