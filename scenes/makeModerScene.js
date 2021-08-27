const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const user = require('../models/user');
const order = require('../models/order');

function makeModerScene() {
    const makeModerScene = new Scenes.BaseScene('makeModerScene');

    makeModerScene.enter(async (ctx) => {
        return ctx.reply("Отправьте контакт, тип пользователя которого хотите обновить", keyboards.onlyBack);
    })

    makeModerScene.on('contact', async (ctx) => {
        let candidateId = ctx.update.message.contact.user_id;

        user.findOne({
            telegramID: candidateId
        }, (errFo, resFo) => {
            if (errFo) {
                ctx.reply("Ошибка поиска пользователя в БД");
            }
            if (resFo) {
                ctx.reply(`Вы действительно хотите изменить тип пользователя ${resFo.telegramFirstName != null ? resFo.telegramFirstName : ''} ${resFo.telegramLastName != null ? resFo.telegramLastName : ''} c <i>${resFo.type}</i> на <i>moder</i>`, {
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
    makeModerScene.on('message', async (ctx) => {

        switch (ctx.update.message.text) {
            case 'Назад':
                await ctx.scene.enter('adminScene');
                break;
            default:
                ctx.reply("Пожалуйста, воспользуйтесь меню.");
                break;
        }
    })
    makeModerScene.action(/confirmUpgrade_/, async (ctx) => {
        let confirmData = ctx.update.callback_query.data.split('_');
        console.log(confirmData);
        user.updateOne({
            _id: confirmData[1]
        }, {
            type: 'moder'
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
    makeModerScene.action(/cancleUpgrade_/, async (ctx) => {
        await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
        await ctx.reply("Отменено");
        return ctx.reply("Отправьте контакт, тип пользователя которого хотите обновить");

    });
    return makeModerScene;
}


module.exports = makeModerScene();