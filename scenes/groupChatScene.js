const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');
const mongoose = require('mongoose');

const keyboards = require('../keyboards');
const user = require('../models/user');
const order = require('../models/order');
const invoices = require('../invoices');
const groupList = ["-1001519010099"];


function groupChatScene() {
    const groupChatScene = new Scenes.BaseScene('groupChatScene');

    groupChatScene.enter(async (ctx) => {
        await ctx.reply("Помещение в групповую сцену!", keyboards.remove);
    })
    groupChatScene.action(/getOrder/, async (ctx) => {
        let mongoID = ctx.update.callback_query.data.slice(9);
        let msgID = ctx.update.callback_query.message.message_id;
        let chatID = ctx.update.callback_query.message.chat.id;
        let workerOBJ = ctx.update.callback_query.from;
        let text = ctx.update.callback_query.message.text;
        order.findOne({
            _id: mongoID
        }, (err, res) => {
            if (err) {
                console.log(err);
                return ctx.reply("Ошибка. Заказ не найдена.");
            }
            if (res) {
                if (res.worker == null) {
                    order.updateOne({
                        _id: mongoID
                    }, {
                        worker: workerOBJ.id
                    }, (errU, resU) => {
                        if (errU) {
                            console.log(errU);
                            return ctx.reply('Ошибка обновления заказа.');
                        }
                        if (resU) {
                            let entities = ctx.update.callback_query.message.entities;
                            for (let i = 0; i < entities.length; i++) {
                                if (entities[i].type == "text_link") {
                                    entities[i].type = 'text_mention';
                                    entities[i].user = workerOBJ;
                                    entities[i].length = 1 + workerOBJ.first_name.length + workerOBJ.last_name.length;
                                }
                            }
                            console.log(entities);
                            ctx.telegram.editMessageText(chatID, msgID, null, text.replace('Ожидается', workerOBJ.first_name + ' ' + workerOBJ.last_name), {
                                entities: entities
                            });
                        }
                    })
                }
            }
        });

    });
    return groupChatScene;
}


module.exports = groupChatScene();