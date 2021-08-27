const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const user = require('../models/user');
const order = require('../models/order');

function makeWorkerScene() {
    const makeWorkerScene = new Scenes.BaseScene('makeWorkerScene');

    makeWorkerScene.enter(async (ctx) => {
        return ctx.reply("Отправьте контакт, тип пользователя которого хотите обновить", keyboards.onlyBack);
    })

    makeWorkerScene.on('contact', async (ctx) => {
        let candidateId = ctx.update.message.contact.user_id;

        user.findOne({
            telegramID: candidateId
        }, (errFo, resFo) => {
            if (errFo) {
                ctx.reply("Ошибка поиска пользователя в БД");
            }
            if (resFo) {
                ctx.reply(`Вы действительно хотите изменить тип пользователя ${resFo.telegramFirstName != null ? resFo.telegramFirstName : ''} ${resFo.telegramLastName != null ? resFo.telegramLastName : ''} c <i>${resFo.type}</i> на <i>worker</i>`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Да',
                                callback_data: 'confirmUpgrade_' + resFo._id
                            }, {
                                text: 'Нет',
                                callback_data: 'cancleUpgrade_'
                            }],
                        ]
                    },
                    parse_mode: 'HTML'
                });
            } else {
                ctx.reply("Данный пользователь не зарегестрирован в системе");
            }
        });
    })
    makeWorkerScene.on('message', async (ctx) => {

        switch (ctx.update.message.text) {
            case 'Назад':
                user.findOne({
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
                                return ctx.scene.enter('adminScene');
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
                break;
            default:
                ctx.reply("Пожалуйста, воспользуйтесь меню.");
                break;
        }
    })
    makeWorkerScene.action(/confirmUpgrade_/, async (ctx) => {
        let confirmData = ctx.update.callback_query.data.split('_');
        console.log(confirmData);
        user.updateOne({
            _id: confirmData[1]
        }, {
            type: 'worker'
        }, async (errUo, resUo) => {
            if (errUo) {
                await ctx.reply("Ошибка поиск заказа в БД.");
            }
            if (resUo) {
                await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
                await ctx.reply("Успешно!");
            }
        })
    });
    makeWorkerScene.action(/cancleUpgrade_/, async (ctx) => {
        await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
        await ctx.reply("Отменено");
        return ctx.reply("Отправьте контакт, тип пользователя которого хотите обновить");

    });
    return makeWorkerScene;
}


module.exports = makeWorkerScene();