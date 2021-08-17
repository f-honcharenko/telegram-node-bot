const {
    Markup
} = require('telegraf');
const config = require('config');
console.log(config.get('provider-token'));

// TYPES: [text, document]
class formsData {
    static firstForm = {
        formName: 'Тестовая форма.',
        fromDescription: 'Тестовое описание формы.',
        formPrice: 80 * 100,
        fields: [{
                fieldName: 'ФИО',
                type: 'text',
                limits: {
                    charMax: 100,
                    charMin: 5,
                }
            },
            {
                fieldName: 'Скан паспорта',
                type: 'document',
            }, {
                fieldName: 'Номер специального карточного счета',
                type: 'text',
            }
        ]
    };
}


module.exports = formsData;