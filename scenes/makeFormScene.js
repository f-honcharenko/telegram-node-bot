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
const invoices = require('../invoices');

function makeFormScene() {
    const makeFormScene = new Scenes.BaseScene('makeFormScene');
    let _data = [];
    let fIndex = 0;
    let currnetData = null;
    let currnetType = null;
    let formName = null;
    makeFormScene.enter(async (ctx) => {
        formName = ctx.session.formID;
        console.log(formName);
        await ctx.reply("Инициализация формы [" + formsData[formName].formName + ']', keyboards.makeForm.oneTime().resize());
        await ctx.reply(`<b>Первое поле:</b> ${formsData[formName].fields[fIndex].fieldName} ${formsData[formName].fields[fIndex].description?'\n<b>Дополнение: </b>'+formsData[formName].fields[fIndex].description:''}`, {
            parse_mode: 'html',
        });

    })

    makeFormScene.on('message', async (ctx) => {
        let type = null;
        switch (ctx.update.message.text) {
            case 'Подтвердить':
                if (currnetData == null) {
                    return ctx.reply('Заполните поле, прежде чем перейти далее!');
                }
                fIndex++;
                let _temp = {
                    type: currnetType,
                    data: currnetData,
                    fieldName: formsData[formName].fields[fIndex - 1].fieldName
                };
                currnetData = null;
                currnetType = null;
                _data.push(_temp);
                if (formsData[formName].fields.length == fIndex) {
                    await ctx.reply('Форма заполнена и после оплаты будет передана сотруникам.');
                    let voiderID = new user();
                    ctx.session._data = {
                        formName: formsData[formName].formName,
                        fields: _data,
                        id: voiderID._id
                    };
                    fIndex = 0;
                    await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id, voiderID._id, formsData[formName].formName, formsData[formName].fromDescription, formsData[formName].formPrice));
                } else {
                    return ctx.reply(`Отлично!\n<b>Следуйщее поле: </b>${formsData[formName].fields[fIndex].fieldName} ${formsData[formName].fields[fIndex].description?'\n<b>Дополнение: </b>'+formsData[formName].fields[fIndex].description:''}`, {
                        parse_mode: 'html',
                        ...keyboards.makeForm.oneTime().resize()
                    });
                }
                case 'Сбросить форму и вернуться':
                    _data = [];
                    fIndex = 0;
                    currnetData = null;
                    currnetType = null;
                    return ctx.scene.enter('createFormScene');
                default:
                    if (ctx.update.message.document) {
                        console.log(ctx.update.message.document);
                        type = 'document';
                        currnetType = type;
                        currnetData = ctx.update.message.document.file_id;
                    } else if (ctx.update.message.text) {
                        type = 'text';
                        currnetType = type;
                        if (formsData[formName].fields[fIndex].limits) {
                            if ((ctx.update.message.text.length >= formsData[formName].fields[fIndex].limits.charMin) && (ctx.update.message.text.length <= formsData[formName].fields[fIndex].limits.charMax)) {
                                currnetData = ctx.update.message.text;
                            } else {
                                return ctx.reply(`Это поле должно содержать от ${formsData[formName].fields[fIndex].limits.charMin} до ${formsData[formName].fields[fIndex].limits.charMax} символов.`);
                            }
                        } else {
                            currnetData = ctx.update.message.text;
                        }
                    }
                    if (type == null) {
                        return ctx.reply('Данный объект не поддерживается. Пожалуйста, отправьте файл, или текстовое сообщение');
                    } else if (type == formsData[formName].fields[fIndex].type) {
                        await ctx.reply(`Вы подтверждаете, что данные для поля [${formsData[formName].fields[fIndex].fieldName}] заполнены правильно?\n\nЕсли допустили ошибку, отправьте сообщение заново`, keyboards.makeForm2);
                        return sendData(ctx, currnetData, type)
                    } else {
                        currnetData = null;
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