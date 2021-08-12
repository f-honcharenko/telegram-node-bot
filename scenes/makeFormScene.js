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
    let formName = 'firstForm'
    makeFormScene.enter(async (ctx) => {
        console.log(formsData);
        await ctx.reply("Инициализация формы [ " + formsData[formName].formName + ']', keyboards.makeForm.oneTime().resize());
        await ctx.reply(`Введите [${formsData[formName].fields[fIndex].fieldName}]`);

    })

    makeFormScene.on('message', async (ctx) => {
        let type = null;
        switch (ctx.update.message.text) {
            case 'Подтвердить':
                if (currnetData == null) {
                    return ctx.reply('Заполните поле, прежде чем перейти далее!');
                }
                fIndex++;
                let _temp = {};
                _temp[formsData[formName].fields[fIndex - 1].fieldName] = currnetData;
                currnetData = null;
                _data.push(_temp);
                if (formsData[formName].fields.length == fIndex) {
                    await ctx.reply('Форма заполнена!');
                    await ctx.reply(JSON.stringify(_data));
                    ctx.session._data = {
                        formName: formsData[formName].formName
                    };
                    fIndex = 0;
                    await ctx.replyWithInvoice(invoices.getDocumentInvoice(ctx.from.id, formsData[formName].formName, formsData[formName].fromDescription, formsData[formName].formPrice));
                } else {
                    return ctx.reply(`Отлично! Следуйщее поле : <b>${formsData[formName].fields[fIndex].fieldName}</b>`, {
                        parse_mode: 'html',
                        ...keyboards.makeForm.oneTime().resize()
                    });
                }
                case 'Сбросить форму и вернуться':
                    _data = [];
                    fIndex = 0;
                    currnetData = null;
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
    // makeFormScene.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
    //     const userID = ctx.message.from.id;
    //     const orderName = ctx.session._data.formName;
    //     const orderDate = new Date(new Date().setHours(new Date().getHours() + 3)).toJSON();
    //     let orderCandidate = new order({
    //         "creatorTelegramID": userID,
    //         "title": orderName,
    //         "creationDate": orderDate,
    //         '_data': ctx.session._data
    //     });
    //     orderCandidate.save((errS, resS) => {
    //         if (errS) {
    //             console.log(errS);
    //             return ctx.reply("Ошибка при сохранении платежа!");
    //         }
    //         if (resS) {
    //             console.log(resS._id);
    //             groupList.forEach((el) => {
    //                 ctx.telegram.sendMessage(el,
    //                     `Новый #заказ!\n<b>Услуга:</b> ${orderName} \n<b>Дата:</b> ${orderDate.slice(0,19).replace('T',' ').replace('-', '.').replace('-', '.')}\n<b>Оплачено:</b> ${(ctx.update.message.successful_payment.total_amount / 100) + ctx.update.message.successful_payment.currency}\n<b>Пользователь: </b> <a href="tg://user?id=${userID}">${ctx.message.from.first_name+' '+ctx.message.from.last_name}</a>\n<b>Исполнитель: </b> <a href="tg://user?id=0">Ожидается</a>`, {
    //                         parse_mode: 'HTML',
    //                         data: '123',
    //                         reply_markup: {
    //                             inline_keyboard: [
    //                                 [{
    //                                     text: "Берусь!",
    //                                     callback_data: "getOrder_" + resS._id
    //                                 }]
    //                             ]
    //                         }
    //                     });

    //             });
    //         }
    //     })

    //     // console.log(ctx.update.message.successful_payment);
    //     await ctx.reply('Оплата прошла успешно. Ваши данные переданы соответсвующим сотрудникам.')
    // })
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