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
    static adminForm = Markup.keyboard([
        [
            Markup.button.callback("Рейтинг бухгалтеров"),
        ],
        [
            Markup.button.callback("Общая статистика"),
        ]
    ]);
    static scenes = Markup.keyboard([
        [
            Markup.button.callback("startUserScene"),
            Markup.button.callback("startAdminScene"),
            Markup.button.callback("myFromsScene"),
            Markup.button.callback("createFormScene"),
        ]
    ]);
    static remove = Markup.removeKeyboard();
}

module.exports = keyboards;