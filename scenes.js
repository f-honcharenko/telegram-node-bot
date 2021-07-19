const {
    Scenes,
    Markup
} = require('telegraf');
const mongoose = require('mongoose');

const keyboards = require('./keyboards');
const user = require('./models/user');

class scenesGen {
    static startScene() {
        const startScene = new Scenes.BaseScene('startScene');

        // let candidate = new user({
        //     "telegramID": "test",
        //     "type": "user"
        // });

        // candidate.save();

        startScene.enter(async (ctx) => {
            let userID = ctx.message.from.id;
            let userType = '';
            await user.findOne({
                "telegramID": userID
            }, {}, (err, res) => {
                if (err) return console.log("test");
                if (res) {
                    userType = res.type;
                    return ctx.reply("Смена сцены\n[Отладка] ID: " + userID + "\n[Отладка] type: " + userType, keyboards.start);
                } else {
                    console.log("res not found");
                    let candidate = new user({
                        "telegramID": ctx.message.from.id,
                        "type": "user"
                    });
                    candidate.save(async (err, res) => {
                        if (err) return console.log(err);
                        return ctx.reply("Смена сцены\n[Отладка] ID: " + userID + "\n[Отладка] Пользователь не найден в БД, и запись была создана по умолчанию [" + userType + "]", keyboards.start);
                    });
                }
            });
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