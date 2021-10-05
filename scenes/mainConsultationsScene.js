const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const keyboards = require('../keyboards');
const order = require('../models/order');
const invoices = require('../invoices');
const config = require('../config.json');
const groupList = config.telegramGroupArray;

function mainConsultationsScene() {
    const mainConsultationsScene = new Scenes.BaseScene('mainConsultationsScene');

    mainConsultationsScene.enter(async (ctx) => {
        await ctx.reply("Выберите тему консультации: ", keyboards.mainConsultations);
    })
    mainConsultationsScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
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
    mainConsultationsScene.on('message', async (ctx) => {
        switch (ctx.message.text) {
            case 'НДС':
                ctx.session.formID = '_022_NDS';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Прибыль':
                ctx.session.formID = '_023_Profit';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Физлица-предприниматели':
                ctx.session.formID = '_024_IndividualEntrepreneurs';
                ctx.scene.enter('makeFormScene');
                break;
            case 'РРО и касса':
                ctx.session.formID = '_025_PPO';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Зарплата и кадры':
                ctx.session.formID = '_026_SalaryPersonnel';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Бухгалтерский учет':
                ctx.session.formID = '_027_Accounting';
                ctx.scene.enter('makeFormScene');
                break;
            case 'ВЭД':
                ctx.session.formID = '_028_VED';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Документация':
                ctx.session.formID = '_029_Documentation';
                ctx.scene.enter('makeFormScene');
                break;
            case 'Лицензионная деятельность':
                ctx.session.formID = '_030_LicensedActivity';
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
    return mainConsultationsScene;
}

module.exports = mainConsultationsScene();