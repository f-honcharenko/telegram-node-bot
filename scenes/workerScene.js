const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const mongoose = require('mongoose');

const keyboards = require('../keyboards');
const user = require('../models/user');
const order = require('../models/order');
const invoices = require('../invoices');
const groupList = ["-1001519010099"];

function workerScene() {
    const workerScene = new Scenes.BaseScene('workerScene');

    workerScene.enter(async (ctx) => {
        return ctx.reply("start Worker scene", keyboards.startWorker);
    })

    workerScene.on('message', async (ctx) => {
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
    return workerScene;
}


module.exports = workerScene();