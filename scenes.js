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
    static startModerScene() {
        const startModerScene = new Scenes.BaseScene('startModerScene');

        startModerScene.enter(async (ctx) => {
            return ctx.reply("start MODER scene", keyboards.startModer);
        })

        startModerScene.on('message', async (ctx) => {
            switch (ctx.message.chat.id) {
                case ' ':
                    break;

                default:
                    return ctx.reply('Пожалуйста, используйте меню для навигации.');
                    break;
            }
        })
        return startModerScene;
    }
    static startWorkerScene() {
        const startWorkerScene = new Scenes.BaseScene('startWorkerScene');

        startWorkerScene.enter(async (ctx) => {
            return ctx.reply("start Worker scene", keyboards.startWorker);
        })

        startWorkerScene.on('message', async (ctx) => {
            console.log(ctx.message.from.id);
            switch (ctx.message.text) {
                case 'Мои заказы':
                    ctx.reply('Мой профиль');
                    break;
                case 'Мой профиль':
                    user.findOne({
                        telegramID: ctx.message.from.id
                    }, (errF, resF) => {
                        if (errF) {
                            return ctx.reply("Ошибка поиска исполнителя в БД.");
                        }
                        if (resF) {
                            order.find({
                                worker: ctx.message.from.id
                            }, (errFA, resFA) => {
                                if (errFA) {
                                    return ctx.reply("Ошибка поиска заказов данного пользователя.");
                                }
                                if (resFA) {
                                    let data = {
                                        all: resFA.length,
                                        done: resFA.filter(order => order.status == 'done').length,
                                        pending: resFA.filter(order => order.status == 'pending').length,
                                        canceled: resFA.filter(order => order.status == 'canceled').length,
                                        rate: () => {
                                            let arr = resFA.filter(order => order.status == 'done');
                                            console.log('arr', arr);
                                            let sum = 0;
                                            arr.forEach((el) => {
                                                sum += Number(el.rate);
                                            });
                                            return sum / Number(arr.length)
                                        }
                                    }
                                    let info = `
                            <b>Имя в системе: </b> ${resF.telegramFirstName}\n<b>Фамилия в системе: </b> ${resF.telegramLastName}\n<b>TelegramID: </b><a href="tg://user?id=${resF.telegramID}"> ${resF.telegramID}</a> \n<b>Заказы: (${data.all})</b>\n\t<i>Закончено: </i>${data.done} \n\t<i>На исполнении: </i>${data.pending}\n\t<i>Отменено: </i>${data.canceled}\n<b>Рейтинг: </b>${data.rate()}`
                                    return ctx.reply(info, {
                                        parse_mode: 'HTML'
                                    });
                                }
                            });
                        }
                    });
                    break;

                default:
                    return ctx.reply('Пожалуйста, используйте меню для навигации.');
                    break;
            }
        })
        return startWorkerScene;
    }
    static startAdminScene() {
        const startAdminScene = new Scenes.BaseScene('startAdminScene');

        startAdminScene.enter(async (ctx) => {
            return ctx.reply("start ADMIN scene", keyboards.adminForm);
        })

        startAdminScene.on('message', async (ctx) => {
            if (ctx.message.text == "Рейтинг бухгалтеров") {
                user.find({
                    type: "worker"
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let responce = '';
                        let buttonsArray = [];
                        res.forEach((el) => {
                            responce += '<a href="tg://user?id=' + el.telegramID + '">' + el.telegramID + '</a>\n';
                            buttonsArray.push([Markup.button.callback(el.telegramFirstName + ' ' + el.telegramLastName, 'getInfo_' + el.telegramID)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        return ctx.reply('Список исполнителей (type= worker):\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Список исполнителей (type= worker) пуст.");
                    };
                });
            } else if (ctx.message.text == "Общая статистика") {
                let info = {
                    workers: 0,
                    users: 0,
                    moders: 0,
                    pendingOrders: 0,
                    pendingWorkerOrders: 0,
                    doneOrders: 0,
                    canceledOrders: 0,

                };
                async function getData() {

                };
                //users
                await user.find({}, async (errF, resF) => {
                    if (errF) {
                        return ctx.reply("Ошибка поиска пользователей.");
                    }
                    if (resF) {
                        info.users = resF.filter(user => user.type == 'user').length;
                        info.moders = resF.filter(user => user.type == 'moder').length;
                        info.workers = resF.filter(user => user.type == 'worker').length;
                        info.admins = resF.filter(user => user.type == 'admin').length;
                    }
                });

                //pendingOrders
                await order.find({}, async (errF, resF) => {
                    if (errF) {
                        return ctx.reply("Ошибка поиска заказов.");
                    }
                    if (resF) {
                        console.log('RES', resF.length);
                        info.pendingWorkerOrders = resF.filter(order => order.status == 'pendingWorker').length;
                        info.pendingOrders = resF.filter(order => order.status == 'pending').length;
                        info.doneOrders = resF.filter(order => order.status == 'done').length;
                        info.canceledOrders = resF.filter(order => order.status == 'canceled').length;
                    }
                    await ctx.reply(`<b>Администраторы: </b> ${info.admins}\n<b>Пользователи: </b> ${info.users}\n<b>Модераторы: </b> ${info.moders}\n<b>Исполнители: </b> ${info.workers}\n<b>Выполнено заказов: </b> ${info.doneOrders}\n<b>Заказы, которые выполняются: </b> ${info.pendingOrders}\n<b>Заказы, которые ожидают Исполнителя: </b> ${info.pendingWorkerOrders}\n<b>Отменено заказов :</b> ${info.canceledOrders}\n `, {
                        parse_mode: 'HTML'
                    });
                });
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        startAdminScene.action(/getInfo_/, async (ctx) => {
            let candidateId = ctx.update.callback_query.data.slice(8);
            console.log(candidateId);
            user.findOne({
                telegramID: candidateId
            }, (errF, resF) => {
                if (errF) {
                    return ctx.reply("Ошибка поиска исполнителя в БД.");
                }
                if (resF) {
                    order.find({
                        worker: candidateId
                    }, (errFA, resFA) => {
                        if (errFA) {
                            return ctx.reply("Ошибка поиска заказов данного пользователя.");
                        }
                        if (resFA) {
                            console.log(resFA);
                            let data = {
                                all: resFA.length,
                                done: resFA.filter(order => order.status == 'done').length,
                                pending: resFA.filter(order => order.status == 'pending').length,
                                canceled: resFA.filter(order => order.status == 'canceled').length,
                                rate: () => {
                                    let arr = resFA.filter(order => order.status == 'done');
                                    console.log('arr', arr);
                                    let sum = 0;
                                    arr.forEach((el) => {
                                        sum += Number(el.rate);
                                    });
                                    return sum / Number(arr.length)
                                }
                            }
                            console.log(resFA.filter(order => order.type == 'pending'));
                            let info = `
                    <b>Имя в системе: </b> ${resF.telegramFirstName}\n<b>Фамилия в системе: </b> ${resF.telegramLastName}\n<b>TelegramID: </b><a href="tg://user?id=${resF.telegramID}"> ${resF.telegramID}</a> \n<b>Заказы: (${data.all})</b>\n\t<i>Закончено: </i>${data.done} \n\t<i>На исполнении: </i>${data.pending}\n\t<i>Отменено: </i>${data.canceled}\n<b>Рейтинг: </b>${data.rate()}`
                            return ctx.reply(info, {
                                parse_mode: 'HTML'
                            });
                        }
                    });


                }
            });

        });
        return startAdminScene;
    }
    static myFromsScene() {
        const myFromsScene = new Scenes.BaseScene('myFromsScene');

        myFromsScene.enter(async (ctx) => {
            await ctx.reply("Смена сцены", keyboards.myForms);
        })

        myFromsScene.on('message', async (ctx) => {
            switch (ctx.message.text) {
                case "Готовые":
                    order.find({
                        creatorTelegramID: ctx.message.from.id,
                        status: 'done'
                    }, (err, res) => {
                        if (err) ctx.reply("ERROR\n" + err);
                        if (res.length != 0) {
                            let responce = '';
                            let index = 1;
                            res.forEach((el) => {
                                console.log(el);
                                responce += `<b>⬛⬛⬛${index}⬛⬛⬛</b>\nУслуга: ${el.title}\nДата: ${new Date(el.creationDate).toJSON().slice(0,19).replace('T',' ').replace('-', '.').replace('-', '.')}\nСтатус: ${el.status=='pendingWorker'?'Ожидает исполнителя\n\n':el.status=='pending'?'Исполняется\n\n':el.status=='canceled'?'Отменён\n\n':el.status=='done'?'Готов\n\n':'Неизвестно\n\n'}`;
                                index++;
                            });
                            return ctx.reply('Готоые заказы: (' + res.length + '):\n' + responce, {
                                parse_mode: 'html'
                            });
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
                            let responce = '';
                            let index = 1;
                            res.forEach((el) => {
                                console.log(el);
                                responce += `<b>⬛⬛⬛${index}⬛⬛⬛</b>\nУслуга: ${el.title}\nДата: ${new Date(el.creationDate).toJSON().slice(0,19).replace('T',' ').replace('-', '.').replace('-', '.')}\nСтатус: ${el.status=='pendingWorker'?'Ожидает исполнителя\n\n':el.status=='pending'?'Исполняется\n\n':el.status=='canceled'?'Отменён\n\n':el.status=='done'?'Готов\n\n':'Неизвестно\n\n'}`;
                                index++;
                            });
                            return ctx.reply('Выполняющиеся заказы: (' + res.length + '):\n' + responce, {
                                parse_mode: 'html'
                            });
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
                            let responce = '';
                            let index = 1;
                            res.forEach((el) => {
                                console.log(el);
                                responce += `<b>⬛⬛⬛${index}⬛⬛⬛</b>\nУслуга: ${el.title}\nДата: ${new Date(el.creationDate).toJSON().slice(0,19).replace('T',' ').replace('-', '.').replace('-', '.')}\nСтатус: ${el.status=='pendingWorker'?'Ожидает исполнителя\n\n':el.status=='pending'?'Исполняется\n\n':el.status=='canceled'?'Отменён\n\n':el.status=='done'?'Готов\n\n':'Неизвестно\n\n'}`;
                                index++;
                            });
                            return ctx.reply('Отмененные заказы: (' + res.length + '):\n' + responce, {
                                parse_mode: 'html'
                            });
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
                            let responce = '';
                            let index = 1;
                            res.forEach((el) => {
                                console.log(el);
                                responce += `<b>⬛⬛⬛${index}⬛⬛⬛</b>\nУслуга: ${el.title}\nДата: ${new Date(el.creationDate).toJSON().slice(0,19).replace('T',' ').replace('-', '.').replace('-', '.')}\nСтатус: ${el.status=='pendingWorker'?'Ожидает исполнителя\n\n':el.status=='pending'?'Исполняется\n\n':el.status=='canceled'?'Отменён\n\n':el.status=='done'?'Готов\n\n':'Неизвестно\n\n'}`;
                                index++;
                            });
                            return ctx.reply('Заказы ожидающие исполнителя: (' + res.length + '):\n' + responce, {
                                parse_mode: 'html'
                            });
                        } else {
                            return ctx.reply("Нет заказов ожидающих исполнителя.");
                        };
                    });
                    break;

                case "Назад":
                    await ctx.scene.enter('startUserScene');
                    break;
                default:
                    await ctx.reply("Пожалуйста, используйте меню для навигации.");
                    break;
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
                            `Новый #заказ!\n<b>Услуга:</b> ${orderName} \n<b>Дата:</b> ${orderDate.slice(0,19).replace('T',' ').replace('-', '.').replace('-', '.')}\n<b>Оплачено:</b> ${(ctx.update.message.successful_payment.total_amount / 100) + ctx.update.message.successful_payment.currency}\n<b>Пользователь: </b> <a href="tg://user?id=${userID}">${ctx.message.from.first_name+' '+ctx.message.from.last_name}</a>\n<b>Исполнитель: </b> <a href="tg://user?id=0">Ожидается</a>`, {
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
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
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
            let mongoID = ctx.update.callback_query.data.slice(9);
            let msgID = ctx.update.callback_query.message.message_id;
            let chatID = ctx.update.callback_query.message.chat.id;
            let workerOBJ = ctx.update.callback_query.from;
            let text = ctx.update.callback_query.message.text;
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
                                    if (entities[i].type == "text_link") {
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
                        })
                    }
                }
            });

        });
        return groupScene;
    }
}

module.exports = scenesGen;