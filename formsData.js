const {
    Markup
} = require('telegraf');
const config = require('config');
console.log(config.get('provider-token'));

// TYPES: [text, document]
// CHARLIMITS: -1 = no limit, 
class formsData {
    static firstForm = {
        formName: 'titleForm',
        fields: [{
            fieldName: 'ФИО',
            type: 'text',
            charLimits: -1,
        }, {
            fieldName: 'Скан паспорта',
            type: 'document',
            charLimits: -1,
        }, {
            fieldName: 'justnumber',
            type: 'text',
            charLimits: 5,
        }]
    };
}


module.exports = formsData;