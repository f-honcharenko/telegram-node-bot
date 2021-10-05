const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const user = require('../models/user');
const order = require('../models/order');

function doneOrderScene() {
    const doneOrderScene = new Scenes.BaseScene('doneOrderScene');
    let responce = {
        files: [],
        comment: null
    };
    doneOrderScene.enter(async (ctx) => {
        console.log("Подготовка формы для завершения заказа");
        return ctx.reply("Подготовка формы для завершения заказа. Отправьте файлы и/или коментарий, которые будут отправлены заказчику.", keyboards.doneOrder);
    })

    doneOrderScene.leave(async (ctx) => {
        console.log('done order exit');
    return ctx.reply('вы вышли из сцены ответа!');
    });
    doneOrderScene.on('document', async (ctx) => {
        console.log("Document");
        responce.files.push(ctx.update.message.document.file_id);
        ctx.reply(`Документ [<i>${ctx.update.message.document.file_name}</i>] успешно добавлен!`, {
            parse_mode: 'HTML'
        });
    });
    doneOrderScene.on('message', async (ctx) => {
        console.log("Message");
        switch (ctx.update.message.text) {
            case 'Предпросмотр ответа':
                await ctx.reply('Ваш ответ будет выглядеть так:');
                if (responce.comment == null) {
                    await ctx.reply('<i>Коментарий отсутсвует</i>', {
                        parse_mode: 'HTML'
                    });
                } else {
                    await ctx.reply('<i>' + responce.comment + '</i>', {
                        parse_mode: 'HTML'
                    });
                }
                responce.files.forEach(async (fileID) => {
                    await ctx.replyWithSticker(fileID)
                });
                break;
            case 'Отправить ответ и завершить заказ':
                order.updateOne({
                    _id: ctx.session.order._id
                }, {
                    status: 'done',
                    files: responce.files,
                    comment: responce.comment,
                }, async (errUo, resUo) => {
                    if (errUo) {
                        delete ctx.session.order;
                        return ctx.reply("Ошибка обновления заказа в БД");
                    }
                    if (resUo) {
                        await ctx.reply("Ответ успешно отправлен");
                        ctx.telegram.sendMessage(ctx.session.order.creatorTelegramID, "Внимание! Ваш заказ готов!", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{
                                        text: 'Перейти в "мои заказы"',
                                        callback_data: 'goToMyOrders'
                                    }],
                                ]
                            },
                            parse_mode: 'HTML'
                        });
                        delete ctx.session.order;
                        return ctx.scene.enter('workerFromsScene');
                    }
                });
                break;
            case 'Назад':
                return ctx.scene.enter('workerFromsScene');
                break;
            default:
                console.log(ctx.update.message.text);
                if (ctx.update.message.text) {
                    responce.comment = ctx.update.message.text;
                    await ctx.reply(`Коментарий успешно добавлен!`, {
                        parse_mode: 'HTML'
                    });
                } else {
                    await ctx.reply(`Отправленные вами данные, не являются ни текстом, ни файлом.`);
                }

                break;
        }


    })
    return doneOrderScene;
}


module.exports = doneOrderScene();