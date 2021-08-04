const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');

function moderScene() {
    const moderScene = new Scenes.BaseScene('moderScene');

    moderScene.enter(async (ctx) => {
        return ctx.reply("start MODER scene", keyboards.startModer);
    })

    moderScene.on('message', async (ctx) => {
        switch (ctx.message.chat.id) {
            case ' ':
                break;

            default:
                return ctx.reply('Пожалуйста, используйте меню для навигации.');
                break;
        }
    })
    return moderScene;
}


module.exports = moderScene();