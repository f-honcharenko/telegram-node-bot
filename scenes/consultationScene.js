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

function consultationScene() {
    const consultationScene = new Scenes.BaseScene('consultationScene');

    consultationScene.enter(async (ctx) => {
        await ctx.reply("Выберите тему консультации: ", keyboards.consultation);
    })
    consultationScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
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
    consultationScene.on('message', async (ctx) => {
        switch (ctx.message.text) {
            case 'Составление проводок по операции':
                ctx.session.formID = '_001_WiringOperation';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Помощь в 1С':
                ctx.session.formID = '_002_HelpOneC';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Разработка учетной политики':
                ctx.session.formID = '_003_PolicyDevelopment';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Составление финансовой отчетности микро и малых предприятий':
                ctx.session.formID = '_004_FinancialStatement';
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
    return consultationScene;
}

module.exports = consultationScene();