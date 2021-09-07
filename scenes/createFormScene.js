const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const keyboards = require('../keyboards');
const order = require('../models/order');
const invoices = require('../invoices');
const config = require('config');
const groupList = config.get("telegram-group-array");

function createFormScene() {
    const createFormScene = new Scenes.BaseScene('createFormScene');

    createFormScene.enter(async (ctx) => {
        await ctx.reply("Выберите направление: ", keyboards.createForm);
    })
    createFormScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
        const userID = ctx.message.from.id;
        const orderName = ctx.session._data.formName;
        console.log(ctx.update.message.successful_payment);
        const orderDate = new Date(new Date().setHours(new Date().getHours() + 3)).toJSON();
        let orderCandidate = new order({
            "_id": ctx.session._data.id,
            "creatorTelegramID": userID,
            "title": orderName,
            "creationDate": orderDate,
            '_data': ctx.session._data.fields
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

        await ctx.reply('Оплата прошла успешно. Ваши данные переданы соответсвующим сотрудникам.')
    })
    createFormScene.on('message', async (ctx) => {
        switch (ctx.message.text) {
            case "Бухучет":
                return ctx.scene.enter('accountingScene');
            case "Первичка":
                return ctx.scene.enter('primaryScene');
            case "Налоговый учет":
                return ctx.scene.enter('taxAccountingScene');
            case "Таможн. - Брок. услуги":
                return ctx.scene.enter('customsBrokerServicesScene');
            case "Консультации":
                return ctx.scene.enter('mainConsultationsScene');

                // case "":
                // return ctx.scene.enter('');
            case "Назад":
                return ctx.scene.enter('userScene');
            default:
                return ctx.reply("Пожалуйста, используйте меню для навигации.");
        }
    })
    return createFormScene;
}

module.exports = createFormScene();