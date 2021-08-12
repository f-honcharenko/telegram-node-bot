const {
    Scenes,
    Markup,
    Router,
    Extra
} = require('telegraf');

const keyboards = require('../keyboards');
const formsData = require('../formsData');
const user = require('../models/user');
const order = require('../models/order');

function makeFormScene() {
    const makeFormScene = new Scenes.BaseScene('makeFormScene');
    let _data = [];
    let fIndex = 0;
    let currnetData = null;
    let formName = 'firstForm'
    makeFormScene.enter(async (ctx) => {
        await ctx.reply("start makeFormScene scene");
        await ctx.reply("Инициализация формы [ " + formsData[formName].formName + ']', keyboards.makeForm.oneTime().resize());
        await ctx.reply(`Введите [${formsData[formName].fields[fIndex].fieldName}]`);

    })

    makeFormScene.on('message', async (ctx) => {
        let type = null;
        switch (ctx.update.message.text) {
            case 'Подтвердить':
                fIndex++;
                let _temp = {};
                _temp[formsData[formName].fields[fIndex - 1].fieldName] = currnetData;
                _data.push(_temp);
                if (formsData[formName].fields.length == fIndex) {
                    await ctx.reply('Форма заполнена!');
                    await ctx.reply(JSON.stringify(_data));
                } else {
                    return ctx.reply(`Отлично! Следуйщее поле : <b>${formsData[formName].fields[fIndex].fieldName}</b>`, {
                        parse_mode: 'html',
                        ...keyboards.makeForm.oneTime().resize()
                    });
                }
                case 'Сбросить форму и вернуться':
                    return ctx.scene.enter('createFormScene');
                default:
                    if (ctx.update.message.document) {
                        type = 'document';
                        currnetData = ctx.update.message.document.file_id;
                    } else if (ctx.update.message.text) {
                        type = 'text';
                        currnetData = ctx.update.message.text;
                    }
                    if (type == null) {
                        return ctx.reply('Данный объект не поддерживается. Пожалуйста, отправьте файл, или текстовое сообщение');
                    } else if (type == formsData[formName].fields[fIndex].type) {
                        await ctx.reply(`Вы подтверждаете, что данные для поля [${formsData[formName].fields[fIndex].fieldName}] заполнены правильно?\n\nЕсли допустили ошибку, отправьте сообщение заново`, keyboards.makeForm2);
                        return sendData(ctx, currnetData, type)
                    } else {
                        return ctx.reply(`Ошибка! Необходимо ${formsData[formName].fields[fIndex].type=="document"?"отправить документ":'отправить текстовое сообщение'}`);

                    }
                    break;
        }

    })
    return makeFormScene;
}

async function sendData(ctx, data, type) {
    switch (type) {
        case 'document':
            await ctx.reply("<b>Вы загрузили файл: </b>", {
                parse_mode: 'html'
            })
            return ctx.replyWithSticker(data)
        case 'text':
            return ctx.reply("<b>Вы ввели: </b>" + data, {
                parse_mode: 'html'
            })
        default:
            return ctx.reply("Данные не найдены.")
    }
}

module.exports = makeFormScene();