const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const user = require('../models/user');

function moderScene() {
    const moderScene = new Scenes.BaseScene('moderScene');

    moderScene.enter(async (ctx) => {
        return ctx.reply("start MODER scene", keyboards.startModer);
    })

    moderScene.on('message', async (ctx) => {
        switch (ctx.message.chat.id) {
            case 'Рейтинг исполнителей':
                user.find({
                    type: "worker"
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let fn;
                        let ln;
                        let buttonsArray = [];
                        res.forEach((el) => {
                            fn = el.telegramFirstName == undefined ? ' ' : el.telegramFirstName;
                            ln = el.telegramLastName == undefined ? ' ' : el.telegramLastName;
                            buttonsArray.push([Markup.button.callback(fn + ' ' + ln, 'getInfo_' + el.telegramID)]);
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        return ctx.reply('Список исполнителей (type= worker):\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Список исполнителей (type= worker) пуст.");
                    };
                });
                break;

            default:
                return ctx.reply('Пожалуйста, используйте меню для навигации.');
                break;
        }
    })
    return moderScene;
}


module.exports = moderScene();