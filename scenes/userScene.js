const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const user = require('../models/user');

function userScene() {
    const userScene = new Scenes.BaseScene('userScene');

    userScene.enter(async (ctx) => {
        await ctx.reply("start USER scene", keyboards.start);
        return user.findOne({
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
                        return
                        break;
                    default:
                        await ctx.reply("Ошибка! Неизвестный типа пользователя! Принудительное перемещение в пользовательскую сцену.");
                        return ctx.scene.enter('userScene');
                        break;
                }
            }
        });
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