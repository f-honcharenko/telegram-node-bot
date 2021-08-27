const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const user = require('../models/user');
const order = require('../models/order');

function makeCommentScene() {
    const makeCommentScene = new Scenes.BaseScene('makeCommentScene');
    let responce = {
        files: [],
        comment: null
    };
    makeCommentScene.enter(async (ctx) => {
        return ctx.reply("Подготовка формы коментария к заказу. Отправьте файлы и/или коментарий, которые будут отправлены заказчику.",
            keyboards.makeComment);
    })

    makeCommentScene.on('document', async (ctx) => {
        responce.files.push(ctx.update.message.document.file_id);
        ctx.reply(`Документ [<i>${ctx.update.message.document.file_name}</i>] успешно добавлен!`, {
            parse_mode: 'HTML'
        });
    });
    makeCommentScene.on('message', async (ctx) => {
        switch (ctx.update.message.text) {
            case 'Предпросмотр коментария':
                await ctx.reply('Ваш коментарий будет выглядеть так:');
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
            case 'Отправить коментарий':
                order.updateOne({
                    _id: ctx.session.order._id
                }, {
                    $push: {
                        userComment: responce.comment,
                        userFiles: responce.files,
                    }
                }, async (errUo, resUo) => {
                    if (errUo) {
                        delete ctx.session.order;
                        return ctx.reply("Ошибка обновления заказа в БД");
                    }
                    if (resUo) {
                        await ctx.reply("Коментарий успешно отправлен");
                        ctx.telegram.sendMessage(ctx.session.order.worker, "Внимание! Заказчик добавил коментарий к одному из заказов!", {
                            // reply_markup: {
                            //     inline_keyboard: [
                            //         [{
                            //             text: 'Перейти в "мои заказы"',
                            //             callback_data: 'goToMyOrders'
                            //         }],
                            //     ]
                            // },
                            parse_mode: 'HTML'
                        });
                        delete ctx.session.order;
                        return ctx.scene.enter('userScene');
                    }
                });
                break;
            case 'Назад':
                return ctx.scene.enter('userScene');
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
    return makeCommentScene;
}


module.exports = makeCommentScene();