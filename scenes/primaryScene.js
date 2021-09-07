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

function primaryScene() {
    const primaryScene = new Scenes.BaseScene('primaryScene');

    primaryScene.enter(async (ctx) => {
        await ctx.reply("Выберите подтип услуги", keyboards.primary);
    })
    primaryScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
        const userID = ctx.message.from.id;
        const orderName = ctx.session._data.formName;
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
    primaryScene.on('message', async (ctx) => {
        switch (ctx.message.text) {
            case 'Составление первички (ТТН)':
                ctx.session.formID = '_005_MakePrimaryTTH';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Составление первички (СМР)':
                ctx.session.formID = '_006_MakePrimaryCMR';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Составление договоров(стандарт)':
                ctx.session.formID = '_007_MakeContractStandart';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Составление договоров(обработанный человеком)':
                ctx.session.formID = '_008_MakeContractByHuman';
                ctx.scene.enter('makeFormScene');
                break;
            case '':
                break;
            case 'Назад':
                return ctx.scene.enter('createFormScene');
            default:
                return ctx.reply("Пожалуйста, используйте меню для навигации.");
        }
    })
    return primaryScene;
}

module.exports = primaryScene();