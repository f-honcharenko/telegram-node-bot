const {
    Scenes,
    Markup
} = require('telegraf');
const keyboards = require('./keyboards');

class scenesGen {
    static startScene() {
        const startScene = new Scenes.BaseScene('startScene');

        startScene.enter(async (ctx) => {
            await ctx.reply("Смена сцены", keyboards.start);
        })

        startScene.on('message', async (ctx) => {
            if (ctx.message.text == "Создать форму") {
                await ctx.scene.enter('createFormScene');
            } else if (ctx.message.text == "Мои формы") {
                await ctx.scene.enter('myFromsScene');
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        return startScene;
    }
    static myFromsScene() {
        const myFromsScene = new Scenes.BaseScene('myFromsScene');

        myFromsScene.enter(async (ctx) => {
            await ctx.reply("Смена сцены", keyboards.myForms);
        })
        myFromsScene.on('message', async (ctx) => {
            if (ctx.message.text == "Показать формы") {
                await ctx.reply("[Заменить это сообщение на список форм.]");
            } else if (ctx.message.text == "Назад") {
                await ctx.scene.enter('startScene');
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        return myFromsScene;
    }

    static createFormScene() {
        const createFormScene = new Scenes.BaseScene('createFormScene');

        createFormScene.enter(async (ctx) => {
            await ctx.reply("Смена сцены", keyboards.createForm);
        })
        createFormScene.on('message', async (ctx) => {
            if (ctx.message.text == "Бухучет") {
                await ctx.reply("[Бухучет]");
            } else if (ctx.message.text == "Первичка") {
                await ctx.reply("[Первичка]");
            } else if (ctx.message.text == "Налоговый учет") {
                await ctx.reply("[Налоговый учет]");
            } else if (ctx.message.text == "Таможн. - Брок. услуги") {
                await ctx.reply("[Таможн. - Брок. услуги]");
            } else if (ctx.message.text == "Консультации") {
                await ctx.reply("[Консультации]");
            } else if (ctx.message.text == "Разное") {
                await ctx.reply("[Разное]");
            } else if (ctx.message.text == "Назад") {
                await ctx.scene.enter('startScene');
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        return createFormScene;
    }
}

module.exports = scenesGen;