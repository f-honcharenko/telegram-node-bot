const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const mongoose = require('mongoose');
// const extra = require('telegraf/extra')

const keyboards = require('./keyboards');
const user = require('./models/user');
const order = require('./models/order');
const invoices = require('./invoices');
const groupList = ["-1001519010099"];
// console.log(Markdown);

class scenesGen {
    static startUserScene() {
        const startUserScene = new Scenes.BaseScene('startUserScene');

        startUserScene.enter(async (ctx) => {
            return ctx.reply("start USER scene", keyboards.start);
        })

        startUserScene.on('message', async (ctx) => {
            if (ctx.message.text == "Создать форму") {
                await ctx.scene.enter('createFormScene');
            } else if (ctx.message.text == "Мои формы") {
                await ctx.scene.enter('myFromsScene');
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        return startUserScene;
    }
    static startAdminScene() {
        const startAdminScene = new Scenes.BaseScene('startAdminScene');

        startAdminScene.enter(async (ctx) => {
            return ctx.reply("start ADMIN scene", keyboards.adminForm);
        })

        startAdminScene.on('message', async (ctx) => {
            if (ctx.message.text == "Рейтинг бухгалтеров") {
                user.find({
                    type: "moder"
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        // console.log("moder list", res);
                        let responce = '';
                        let buttonsArray = [];

                        // .extra()
                        res.forEach((el) => {
                            responce += '<a href="tg://user?id=' + el.telegramID + '">' + el.telegramID + '</a>\n';
                            buttonsArray.push([Markup.button.callback(el.telegramID, el.telegramID)]);
                            // text: 
                            // callback_data: el.telegramID
                            // });
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        return ctx.reply('Список бухгалетров(type= moder):\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Список бухгалетров(type= moder) буст.");
                    };
                });
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        return startAdminScene;
    }
    static myFromsScene() {
        const myFromsScene = new Scenes.BaseScene('myFromsScene');

        myFromsScene.enter(async (ctx) => {
            await ctx.reply("Смена сцены", keyboards.myForms);
        })

        myFromsScene.on('message', async (ctx) => {
            if (ctx.message.text == "Показать формы") {
                order.find({
                    creatorTelegramID: ctx.message.from.id
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let responce = '';
                        let index = 1;
                        res.forEach((el) => {
                            responce += `<b>⬛⬛⬛${index}⬛⬛⬛</b>\nУслуга: ${el.title}\nДата: ${new Date(el.creationDate).toJSON().slice(0,19).replace('T',' ').replace('-', '.').replace('-', '.')}\nИсполнитель: ${el.worker==null?'Ожидается\n\n':'Найден\n\n'}`;
                            index++;
                        });
                        return ctx.reply('Список ваших заказов (' + res.length + '):\n' + responce, {
                            parse_mode: 'html'
                        });
                    } else {
                        return ctx.reply("Список ваших заказов буст.");
                    };
                });
            } else if (ctx.message.text == "Назад") {
                await ctx.scene.enter('startUserScene');
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        return myFromsScene;
    }
    static createFormScene() {
        const createFormScene = new Scenes.BaseScene('createFormScene');

        createFormScene.enter(async (ctx) => {
            await ctx.reply("Смена сцены", keyboards.createForm);
        })
        createFormScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
            const userID = ctx.message.from.id;
            const orderName = '[Заплатка. Заменить на название услуги]';
            const orderDate = new Date(new Date().setHours(new Date().getHours() + 3)).toJSON();
            let orderCandidate = new order({
                "creatorTelegramID": userID,
                "title": orderName,
                "creationDate": orderDate,
                "creationDate": orderDate,
            });
            orderCandidate.save((errS, resS) => {
                if (errS) {
                    console.log(errS);
                    return ctx.reply("Ошибка при сохранении платежа!");
                }
                if (resS) {
                    console.log(resS._id);
                    groupList.forEach((el) => {
                        ctx.telegram.sendMessage(el,
                            `Новый заказ!\n<b>Услуга:</b> ${orderName} \n<b>Дата:</b> ${orderDate.slice(0,19).replace('T',' ').replace('-', '.').replace('-', '.')}\n<b>Оплачено:</b> ${(ctx.update.message.successful_payment.total_amount / 100) + ctx.update.message.successful_payment.currency}\n<b>Пользователь: </b> <a href="tg://user?id=${userID}">${ctx.message.from.first_name+' '+ctx.message.from.last_name}</a>\n<b>Исполнитель: </b> <a href="tg://user?id=0">Ожидается</a>`, {
                                parse_mode: 'HTML',
                                data: '123',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: "Берусь!",
                                            callback_data: "getOrder_" + resS._id
                                        }]
                                    ]
                                }
                            });

                    });
                }
            })

            // console.log(ctx.update.message.successful_payment);
            await ctx.reply('Оплата прошла успешно. Ваши данные переданы соответсвующим сотрудникам.')
        })
        createFormScene.on('message', async (ctx) => {
            if (ctx.message.text == "Бухучет") {
                await ctx.reply("[Бухучет]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Первичка") {
                await ctx.reply("[Первичка]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Налоговый учет") {
                await ctx.reply("[Налоговый учет]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Таможн. - Брок. услуги") {
                await ctx.reply("[Таможн. - Брок. услуги]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Консультации") {
                await ctx.reply("[Консультации]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Разное") {
                await ctx.reply("[Разное]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Назад") {
                await ctx.scene.enter('startUserScene');
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            }
        })
        return createFormScene;
    }
    static groupScene() {
        const groupScene = new Scenes.BaseScene('groupScene');

        groupScene.enter(async (ctx) => {
            await ctx.reply("Помещение в групповую сцену!", keyboards.remove);
        })
        groupScene.action(/getOrder/, async (ctx) => {
            // console.log(JSON.stringify(ctx.update));
            let mongoID = ctx.update.callback_query.data.slice(9);
            let msgID = ctx.update.callback_query.message.message_id;
            let chatID = ctx.update.callback_query.message.chat.id;
            let workerOBJ = ctx.update.callback_query.from;
            let text = ctx.update.callback_query.message.text;
            console.log(mongoID, '\n', msgID, '\n', chatID, '\n');
            // console.log(ctx.update.callback_query.message.entities);
            order.findOne({
                _id: mongoID
            }, (err, res) => {
                if (err) {
                    console.log(err);
                    return ctx.reply("Ошибка. Заказ не найдена.");
                }
                if (res) {
                    if (res.worker == null) {
                        order.updateOne({
                            _id: mongoID
                        }, {
                            worker: workerOBJ.id
                        }, (errU, resU) => {
                            if (errU) {
                                console.log(errU);
                                return ctx.reply('Ошибка обновления заказа.');
                            }
                            if (resU) {
                                let entities = ctx.update.callback_query.message.entities;
                                for (let i = 0; i < entities.length; i++) {
                                    // console.log('[ELEMENT ENTIT]: ', ctx.update.callback_query.message.entities[i]);
                                    if (entities[i].type == "text_link") {
                                        // delete entities[i].url;
                                        entities[i].type = 'text_mention';
                                        entities[i].user = workerOBJ;
                                        entities[i].length = 1 + workerOBJ.first_name.length + workerOBJ.last_name.length;
                                    }
                                }
                                console.log(entities);
                                ctx.telegram.editMessageText(chatID, msgID, null, text.replace('Ожидается', workerOBJ.first_name + ' ' + workerOBJ.last_name), {
                                    entities: entities
                                });
                            }
                            // {
                            //     parse_mode: 'HTML'
                            // }
                        })
                    }
                }
            });

        });
        groupScene.on('message', async (ctx) => {
            ctx.reply('msg');
        });
        return groupScene;
    }
}

module.exports = scenesGen;