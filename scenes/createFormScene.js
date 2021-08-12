const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const keyboards = require('../keyboards');
const order = require('../models/order');
const invoices = require('../invoices');
const groupList = ["-1001519010099"];

function createFormScene() {
    const createFormScene = new Scenes.BaseScene('createFormScene');

    createFormScene.enter(async (ctx) => {
        await ctx.reply("Смена сцены", keyboards.createForm);
    })
    createFormScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
        const userID = ctx.message.from.id;
        const orderName = ctx.session._data.formName;
        const orderDate = new Date(new Date().setHours(new Date().getHours() + 3)).toJSON();
        let orderCandidate = new order({
            "creatorTelegramID": userID,
            "title": orderName,
            "creationDate": orderDate,
            '_data': ctx.session._data
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
            ctx.scene.enter('makeFormScene');
            // await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
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
            await ctx.scene.enter('userScene');
        } else {
            await ctx.reply("Пожалуйста, используйте меню для навигации.");
        }
    })
    return createFormScene;
}

module.exports = createFormScene();