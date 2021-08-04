const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');

function userScene() {
    const userScene = new Scenes.BaseScene('userScene');

    userScene.enter(async (ctx) => {
        return ctx.reply("start USER scene", keyboards.start);
    })

    userScene.on('message', async (ctx) => {
        if (ctx.message.text == "Создать форму") {
            await ctx.scene.enter('createFormScene');
        } else if (ctx.message.text == "Мои формы") {
            await ctx.scene.enter('myFromsScene');
        } else {
            await ctx.reply("Пожалуйста, используйте меню для навигации.");
        }
    })
    return userScene;
}


module.exports = userScene();