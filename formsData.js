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
    static _001_WiringOperation = {
        formName: 'Составление проводок по операции.',
        fromDescription: 'Составление проводок по операции.',
        formPrice: 50 * 100,
        fields: [{
            fieldName: 'Опишите операцию',
            type: 'text',
        }]
    };
    static _002_HelpOneC = {
        formName: 'Помощь в 1C',
        fromDescription: 'Помощь в 1C',
        formPrice: 50 * 100,
        fields: [{
                fieldName: 'Опишите операцию',
                type: 'text',
                description: 'Просто описание операции...'
            },
            {
                fieldName: 'Скан',
                type: 'document',
                description: 'Скан чего либо'
            },
        ]
    };
    static _003_PolicyDevelopment = {
        formName: 'Разработка учетной политики',
        fromDescription: 'Разработка учетной политики',
        formPrice: 500 * 100,
        fields: [{
                fieldName: 'Бухучет ведется по',
                type: 'text',
                description: 'Пожалуйста, выберите один из следущих враиантов ( стандартам бухучета/МСФО )'
            },
            {
                fieldName: 'Тип предприятия',
                type: 'text',
                description: 'Пожалуйста, выберите один из следущих враиантов ( торговое/производственное/общепит/услуги/сельхозпредприятие )'
            },
            {
                fieldName: 'Количество наемных рабочих',
                type: 'text',
                description: 'Пожалуйста, выберите один из следущих враиантов ( до 10 / от 11 до 50 / от 51 )'
            },
            {
                fieldName: 'Являюсь микропредприятием (чистый доход от реализации меньше 700000 евро)',
                type: 'text',
                description: 'Пожалуйста, выберите один из следущих враиантов ( да/нет )'
            },
            {
                fieldName: 'Пожелания по учетной политике',
                type: 'text',
                description: 'Если пожеланий нет, оставьте прочерк'
            },
        ]
    };
    static _004_FinancialStatement = {
        formName: 'Составление финансовой отчетности микро и малых  предприятий \(Стандарт 25\)',
        fromDescription: 'Составление финансовой отчетности микро и малых  предприятий \(Стандарт 25\)',
        formPrice: 100 * 100,
        fields: [{
            fieldName: 'Оборотно-сальдовая ведомость за отчетный период(файл)',
            type: 'document',
        }, {
            fieldName: 'Финотчетность за прошлый отчетный период(файл)',
            type: 'document',
        }, {
            fieldName: 'Отчет о финансовых операциях за аналогичный период(файл)',
            type: 'document',
        }, {
            fieldName: 'Ключ для входа в электронный кабинет плательщика налога',
            type: 'text',
            description: 'Чтобы сдать данный отчет за Вас, нужно будет предоставить  ключ для входа в электронный кабинет плательщика налога. Исполнитель гарантирует использования предоставленных Вами  данных только для выполнения данной задачи и полную  конфиденциальность Ваших данных. Если Вы готовы  предоставить ключ, то предоставление финансовой отчетности  за предыдущие периоды не требуется. Если предоставление  ключа не возможно, отчетность будет предоставлена Вам в  формате пдф с последующим перенесением данных в  электронную форму Вами. Отправьте в форму ключ, или же отказ'
        }, ]
    };
    static _005_MakePrimaryTTH = {
        formName: 'Составление первички (ТТН)',
        fromDescription: 'Составление первички (ТТН)',
        formPrice: 50 * 100,
        fields: [{
                fieldName: 'Заявка на перевозку',
                type: 'document',
                description: 'Отправьте любой пустой файл, для того чтобы пропустить.'
            },
            {
                fieldName: 'Информацию про товар, маршрут и перевозчика',
                type: 'text',
                description: 'Заполните это поле, только если предыдущее не заполнили'
            }, {
                fieldName: 'Накладная на товар',
                type: 'document',
                description: 'если поле 1 и 2 не заполнены'
            }, {
                fieldName: 'Техпаспорт перевозчика',
                type: 'document',
                description: 'если поле 1 и 2 не заполнены'
            }, {
                fieldName: 'Накладная на товар',
                type: 'document',
            }
        ]
    };
    static _006_MakePrimaryCMR = {
        formName: 'Составление первички (СМР)',
        fromDescription: 'Составление первички (СМР)',
        formPrice: 50 * 100,
        fields: [{
                fieldName: 'Заявка на перевозку',
                type: 'document',
                description: 'Отправьте любой пустой файл, для того чтобы пропустить.'
            },
            {
                fieldName: 'Информацию про товар, маршрут и перевозчика',
                type: 'text',
                description: 'Заполните это поле, только если предыдущее не заполнили'
            }, {
                fieldName: 'Накладная на товар',
                type: 'document',
                description: 'если поле 1 и 2 не заполнены'
            }, {
                fieldName: 'Техпаспорт перевозчика',
                type: 'document',
                description: 'если поле 1 и 2 не заполнены'
            }, {
                fieldName: 'Накладная на товар',
                type: 'document',
            }
        ]
    };
    static _007_MakeContractStandart = {
        formName: 'Составление договоров(стандарт)',
        fromDescription: 'Составление договоров(стандарт)',
        formPrice: 500 * 100,
        fields: [{
                fieldName: 'Прикрепите шаблон договора',
                type: 'document',
            },
            {
                fieldName: 'Срок действия договора',
                type: 'text',
            }, {
                fieldName: 'Цена',
                type: 'text',
            }, {
                fieldName: 'Условия оплаты',
                type: 'text',
            }, {
                fieldName: 'Условия поставки',
                type: 'text',
            }, {
                fieldName: 'Предмет договора',
                type: 'text',
            },
        ]
    };
    static _008_MakeContractByHuman = {
        formName: 'Составление договоров(обработанный человеком)',
        fromDescription: 'Составление договоров(обработанный человеком)',
        formPrice: 1000 * 100,
        fields: [{
                fieldName: 'Прикрепите шаблон договора',
                type: 'document',
            },
            {
                fieldName: 'Срок действия договора',
                type: 'text',
            }, {
                fieldName: 'Цена',
                type: 'text',
            }, {
                fieldName: 'Условия оплаты',
                type: 'text',
            }, {
                fieldName: 'Условия поставки',
                type: 'text',
            }, {
                fieldName: 'Предмет договора',
                type: 'text',
            },
        ]
    };
    static _009_MakeDeclaraion = {
        formName: 'Составление декларации',
        fromDescription: 'Составление декларации',
        formPrice: 1000 * 100,
        fields: [{
                fieldName: 'Ключ для входа в электронный кабинет плательщика налога',
                type: 'text',
                description: 'Чтобы сдать данный отчет за Вас, нужно будет предоставить  ключ для входа в электронный кабинет плательщика налога. Исполнитель гарантирует использования предоставленных Вами  данных только для выполнения данной задачи и полную  конфиденциальность Ваших данных. Если Вы готовы  предоставить ключ, то предоставление финансовой отчетности  за предыдущие периоды не требуется. Если предоставление  ключа не возможно, отчетность будет предоставлена Вам в  формате пдф с последующим перенесением данных в  электронную форму Вами. Отправьте в форму ключ, или же отказ'
            },
            {
                fieldName: 'Прибыль',
                type: 'text',
            }, {
                fieldName: 'НДС',
                type: 'text',
            }, {
                fieldName: 'Единый налог',
                type: 'text',
            }, {
                fieldName: 'Недвижимость',
                type: 'text',
            }, {
                fieldName: 'Транспортный налог',
                type: 'text',
            }, {
                fieldName: 'Земля',
                type: 'text',
            },
        ]
    };

}


module.exports = formsData;