const {
    Markup
} = require('telegraf');
const config = require('./config.json');
class invoices {
    static getTestInvoice = (id) => {
        return {
            chat_id: id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
            provider_token: config.get('provider-token'), // токен выданный через бот @SberbankPaymentBot
            start_parameter: 'get_access', //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
            title: 'филип, рознично', // Название продукта, 1-32 символа
            description: 'Полное описания товара, до 255 символов', // Описание продукта, 1-255 знаков
            currency: 'UAH', // Трехбуквенный код валюты ISO 4217
            prices: [{
                label: 'рука левая',
                amount: 1000 * 100
            }, {
                label: 'рука правая',
                amount: 1200 * 100
            }, {
                label: 'нога правая',
                amount: 1032 * 100
            }, {
                label: 'нога левая',
                amount: 1032 * 100
            }, {
                label: 'легкое (одно) б/у',
                amount: 12302 * 100
            }, {
                label: 'печень',
                amount: 0 * 100
            }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
            photo_url: 'https://aikido.by/photo/emblem/da_vinci_homo_vitruviano.jpg', // URL фотографии товара для счета-фактуры. Это может быть фотография товара или рекламное изображение услуги. Людям больше нравится, когда они видят, за что платят.
            photo_width: 256, // Ширина фото
            photo_height: 256, // Длина фото
            payload: { // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
                unique_id: `${id}_${Number(new Date())}`
            }
        }

    }

    static getDocumentInvoice = (id, order_id, title = "TITLE", description = "description",
        price = 159753) => {
        return {
            chat_id: id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
            provider_token: config.get('provider-token'), // токен выданный через бот @SberbankPaymentBot 
            start_parameter: 'get_access', //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
            title: title, // Название продукта, 1-32 символа
            description: description, // Описание продукта, 1-255 знаков
            currency: 'UAH', // Трехбуквенный код валюты ISO 4217
            prices: [{
                label: title,
                amount: price
            }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
            photo_url: 'https://static.thenounproject.com/png/582133-200.png', // URL фотографии товара для счета-фактуры. Это может быть фотография товара или рекламное изображение услуги. Людям больше нравится, когда они видят, за что платят.
            photo_width: 250, // Ширина фото
            photo_height: 250, // Длина фото
            payload: { // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
                service_name: "Составление пакета документов по ВЄД",
            },
            provider_data: {
                order_id: order_id
            }
        }

    }
};

module.exports = invoices;