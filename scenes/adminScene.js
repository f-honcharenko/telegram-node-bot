const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const user = require('../models/user');
const order = require('../models/order');

function adminScene() {
    const adminScene = new Scenes.BaseScene('adminScene');

    adminScene.enter(async (ctx) => {
        await ctx.reply("Админпанель: ", keyboards.adminForm);
        return user.findOne({
            telegramID: ctx.update.message.from.id
        }, async (errFo, resFo) => {
            if (errFo) {
                console.log("Ошибка поиска пользоваетля в БД.");
            }
            if (resFo) {
                switch (resFo.type) {
                    case 'worker':
                        return ctx.scene.enter('workerScene');
                        break;
                    case 'moder':
                        return ctx.scene.enter('moderScene');
                        break;
                    case 'admin':
                        return
                        // ctx.scene.enter('adminScene');
                        break;
                    case 'user':
                        return ctx.scene.enter('userScene');
                        break;
                    default:
                        await ctx.reply("Ошибка! Неизвестный типа пользователя! Принудительное перемещение в пользовательскую сцену.");
                        return ctx.scene.enter('userScene');
                        break;
                }
            }
        });
    })

    adminScene.on('message', async (ctx) => {
        console.log(ctx.message.text);
        switch (ctx.message.text) {
            case 'Рейтинг бухгалтеров':
                user.find({
                    type: "worker"
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let fn;
                        let ln;
                        let buttonsArray = [];
                        res.forEach((el) => {
                            fn = el.telegramFirstName == undefined ? ' ' : el.telegramFirstName;
                            ln = el.telegramLastName == undefined ? ' ' : el.telegramLastName;
                            buttonsArray.push([Markup.button.callback(fn + ' ' + ln, 'getInfo_' + el.telegramID)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        return ctx.reply('Список исполнителей (type= worker):\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Список исполнителей (type= worker) пуст.");
                    };
                });
                break;
            case 'Общая статистика':
                console.log('123');
                let info = {
                    workers: 0,
                    users: 0,
                    moders: 0,
                    pendingOrders: 0,
                    pendingWorkerOrders: 0,
                    doneOrders: 0,
                    canceledOrders: 0,

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
                //orders
                await order.find({}, async (errF, resF) => {
                    if (errF) {
                        return ctx.reply("Ошибка поиска заказов.");
                    }
                    if (resF) {
                        // console.log('RES2', resF.length);
                        info.pendingWorkerOrders = resF.filter(order => order.status == 'pendingWorker').length;
                        info.pendingOrders = resF.filter(order => order.status == 'pending').length;
                        info.doneOrders = resF.filter(order => order.status == 'done').length;
                        info.canceledOrders = resF.filter(order => order.status == 'canceled').length;
                    }
                    await ctx.reply(`<b>Администраторы: </b> ${info.admins}\n<b>Пользователи: </b> ${info.users}\n<b>Модераторы: </b> ${info.moders}\n<b>Исполнители: </b> ${info.workers}\n<b>Выполнено заказов: </b> ${info.doneOrders}\n<b>Заказы, которые выполняются: </b> ${info.pendingOrders}\n<b>Заказы, которые ожидают Исполнителя: </b> ${info.pendingWorkerOrders}\n<b>Отменено заказов :</b> ${info.canceledOrders}\n `, {
                        parse_mode: 'HTML'
                    });
                });
                break;
            case 'Назначить модератором':
                console.log('123');
            return ctx.scene.enter('makeModerScene');
                break;
            case 'Назначить исполнителем':
                return ctx.scene.enter('makeWorkerScene');
                break;
            default:
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
                break;
        }
    })
    adminScene.action(/getInfo_/, async (ctx) => {
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
    return adminScene;
}


module.exports = adminScene();