const {
    Markup
} = require('telegraf');
const config = require('config');
console.log(config.get('provider-token'));

// TYPES: [text, document]
// CHARLIMITS: -1 = no limit, 
class formsData {
    static firstForm = {
        formName: 'Тестовая форма.',
        fromDescription: 'Тестовое описание формы.',
        formPrice: 80 * 100,
        fields: [{
            fieldName: 'ФИО',
            type: 'text',
            charLimits: -1,
        }, {
            fieldName: 'Скан паспорта',
            type: 'document',
            charLimits: -1,
        }, {
            fieldName: 'Номер специального карточного счета',
            type: 'text',
            charLimits: 5,
        }]
    };
}


module.exports = formsData;