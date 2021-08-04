const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const config = require('config');

const keyboards = require('../keyboards');
const order = require('../models/order');
const groupList = config.get("telegram-group-array");;

function myFromsScene() {
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

module.exports = myFromsScene();