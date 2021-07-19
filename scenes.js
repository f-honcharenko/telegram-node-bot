const {
    Scenes,
    Markup,
    Router
} = require('telegraf');
const mongoose = require('mongoose');

const keyboards = require('./keyboards');
const user = require('./models/user');
const invoices = require('./invoices');
const groupList = ["-597398345"];

class scenesGen {
    static startUserScene() {
        const startUserScene = new Scenes.BaseScene('startUserScene');

        startUserScene.enter(async (ctx) => {
            return ctx.reply("start USER scene", keyboards.start);
        })

        startUserScene.on('message', async (ctx) => {
            if (ctx.message.text == "Создать форму") {
                await ctx.scene.enter('createFormScene');
            } else if (ctx.message.text == "Мои формы") {
                await ctx.scene.enter('myFromsScene');
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        return startUserScene;
    }
    static startAdminScene() {
        const startAdminScene = new Scenes.BaseScene('startAdminScene');

        startAdminScene.enter(async (ctx) => {
            return ctx.reply("start ADMIN scene", keyboards.adminForm);
        })

        startAdminScene.on('message', async (ctx) => {
            if (ctx.message.text == "Рейтинг бухгалтеров") {
                user.find({
                    type: "moder"
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        console.log("moder list", res);
                        let responce = '';
                        let buttonsArray = [];

                        // .extra()
                        res.forEach((el) => {
                            responce += '<a href="tg://user?id=' + el.telegramID + '">' + el.telegramID + '</a>\n';
                            buttonsArray.push([Markup.button.callback(el.telegramID, el.telegramID)]);
                            // text: 
                            // callback_data: el.telegramID
                            // });
                        });
                        let inlineMessageRatingKeyboard = Markup.inlineKeyboard(buttonsArray);
                        return ctx.reply('Список бухгалетров:\n', inlineMessageRatingKeyboard);
                    } else {
                        return ctx.reply("Список бухгалетров буст.");
                    };
                });
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
            }
        })
        return startAdminScene;
    }
    static myFromsScene() {
        const myFromsScene = new Scenes.BaseScene('myFromsScene');

        myFromsScene.enter(async (ctx) => {
            await ctx.reply("Смена сцены", keyboards.myForms);
        })
        myFromsScene.on('message', async (ctx) => {
            if (ctx.message.text == "Показать формы") {
                user.findOne({
                    telegramID: ctx.message.from.id
                }, (err, res) => {
                    if (err) ctx.reply("ERROR\n" + err);
                    if (res.length != 0) {
                        let responce = '';
                        res.orders.forEach((el) => {
                            responce += el + '\n';
                        });
                        return ctx.reply('Список ваших заказов (' + res.orders.length + '):\n' + responce);
                    } else {
                        return ctx.reply("Список ваших заказов буст.");
                    };
                });
                // await ctx.reply("[Заменить это сообщение на список форм.]");
            } else if (ctx.message.text == "Назад") {
                await ctx.scene.enter('startUserScene');
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
        createFormScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
            const userID = ctx.message.from.id;
            user.updateOne({
                "telegramID": userID
            }, {
                $addToSet: {
                    orders: Number(new Date())
                }
            }, (resUo, errUo) => {
                // console.log(errUo);
                console.log(resUo);
                // if (errUo) return ctx.reply("Ошибка при сохранении платежа, обратитесть к администрации сервсиа");
            });
            // user.findOne({
            //     "telegramID": userID
            // }, (err, res) => {
            //     if (err) return ctx.reply("Ошибка при сохранении платежа, обратитесть к администрации сервсиа");
            //     if (res.length != 0) {
            //         // console.log(res.type);
            //         res.type = "LOL";
            //         console.log(res);
            //         res.updateOne({
            //             "telegramID": userID
            //         }, res, (errU, resU) => {
            //             console.log(errU, resU);
            //             // if (errU) return ctx.reply("Ошибка при сохранении платежа, обратитесть к администрации сервсиа");
            //             // if (resU) return ctx.reply("Ошибка при сохранении платежа, обратитесть к администрации сервсиа");
            //         })
            //     } else {
            //         return ctx.reply("Ваш профиль не найден в БД, обратиетсть к администрации");
            //     }
            // });
            groupList.forEach((el) => {
                ctx.telegram.sendMessage(el, "Произведена оплата \n[" + (ctx.update.message.successful_payment.total_amount / 100) + ctx.update.message.successful_payment.currency + ']');
            });
            await ctx.reply('Оплата прошла успешно. Ваши данные переданы соответсвующим сотрудникам.')
        })
        createFormScene.on('message', async (ctx) => {
            if (ctx.message.text == "Бухучет") {
                await ctx.reply("[Бухучет]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Первичка") {
                await ctx.reply("[Первичка]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Налоговый учет") {
                await ctx.reply("[Налоговый учет]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Таможн. - Брок. услуги") {
                await ctx.reply("[Таможн. - Брок. услуги]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Консультации") {
                await ctx.reply("[Консультации]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Разное") {
                await ctx.reply("[Разное]");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else if (ctx.message.text == "Назад") {
                await ctx.scene.enter('startUserScene');
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            } else {
                await ctx.reply("Пожалуйста, используйте меню для навигации.");
                await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id));
            }
        })
        return createFormScene;
    }
}

module.exports = scenesGen;