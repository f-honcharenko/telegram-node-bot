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

function makeOtherReportingScene() {
    const makeOtherReportingScene = new Scenes.BaseScene('makeOtherReportingScene');

    makeOtherReportingScene.enter(async (ctx) => {
        await ctx.reply("Выберите отчетность: ", keyboards.makeOtherReporting);
    })
    makeOtherReportingScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
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
    makeOtherReportingScene.on('message', async (ctx) => {
        switch (ctx.message.text) {
            case 'Консолидированная отчетность по ЗП (до 30сотр.)':
                ctx.session.formID = '_010_ConsolidatedКeportingMIN';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Консолидированная отчетность по ЗП (30-100сотр.)':
                ctx.session.formID = '_011_ConsolidatedКeportingMEDIUM';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Консолидированная отчетность по ЗП (от 100сотр.)':
                ctx.session.formID = '_012_ConsolidatedКeportingMAX';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Отчеты единщиков по ЕСВ и 4ДФ':
                ctx.session.formID = '_013_ESVand4DF';
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
    return makeOtherReportingScene;
}

module.exports = makeOtherReportingScene();