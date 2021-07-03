const {
    Markup
} = require('telegraf');

class keyboards {
    static start = Markup.keyboard([
        Markup.button.callback("Создать форму"),
        Markup.button.callback("Мои формы"),
    ]);
    static myForms = Markup.keyboard([
        Markup.button.callback("Показать формы"),
        Markup.button.callback("Назад"),
    ]);
    static createForm = Markup.keyboard([
        [
            Markup.button.callback("Бухучет"),
            Markup.button.callback("Таможн. - Брок. услуги"),
        ],
        [
            Markup.button.callback("Первичка"),
            Markup.button.callback("Разное")
        ],
        [
            Markup.button.callback("Налоговый учет"),
            Markup.button.callback("Консультации"),
        ],
        [
            Markup.button.callback("Назад"),
        ]
    ]);
}

module.exports = keyboards;