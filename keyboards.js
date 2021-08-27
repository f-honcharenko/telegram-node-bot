const {
    Markup
} = require('telegraf');

class keyboards {
    static start = Markup.keyboard([
        [
            Markup.button.callback("Создать форму"),
            Markup.button.callback("Мои формы"),
        ],
        [
            Markup.button.callback("Консультации"),
        ]
    ]);
    static makeForm = Markup.keyboard([
        [
            Markup.button.callback("Сбросить форму и вернуться"),
        ],
    ]);
    static accounting = Markup.keyboard([
        [
            Markup.button.callback("Составление проводок по операции"),
            Markup.button.callback("Помощь в 1С"),
        ],
        [
            Markup.button.callback("Разработка учетной политики"),
            Markup.button.callback("Составление финансовой отчетности микро и малых предприятий"),
        ],
        [
            Markup.button.callback("Назад"),
        ]
    ]);
    static makeForm2 = Markup.keyboard([
        [
            Markup.button.callback("Подтвердить"),
        ],
        [
            Markup.button.callback("Сбросить форму и вернуться"),
        ]
    ]);
    static startWorker = Markup.keyboard([
        [
            Markup.button.callback("Мой профиль"),
            Markup.button.callback("Мои заказы"),
        ]
    ]);
    static startModer = Markup.keyboard([
        [
            Markup.button.callback("Рейтинг исполнителей"),
            Markup.button.callback("Общая статистика"),
        ],
        [
            Markup.button.callback("Назначить исполнителем"),
        ]
    ]);

    static myForms = Markup.keyboard([
        [
            Markup.button.callback("Готовые"),
            Markup.button.callback("Выполняющиеся"),
        ],
        [
            Markup.button.callback("Ожидают исполнителя"),
            Markup.button.callback("Отмененые"),
        ],
        [
            Markup.button.callback("Назад"),
        ]
    ]);
    static workerForms = Markup.keyboard([
        [
            Markup.button.callback("Готовые"),
            Markup.button.callback("Выполняющиеся"),
        ],
        [
            Markup.button.callback("Отмененые"),
            Markup.button.callback("Назад"),
        ],
    ]);

    static createForm = Markup.keyboard([
        [
            Markup.button.callback("Бухучет"),
            Markup.button.callback("Таможн. - Брок. услуги(не доступно)"),
        ],
        [
            Markup.button.callback("Первичка"),
            Markup.button.callback("Налоговый учет")
        ],
        [
            Markup.button.callback("Назад"),
        ]
    ]);

    static taxAccounting = Markup.keyboard([
        [
            Markup.button.callback("Составление декларации"),
        ],
        [
            Markup.button.callback("Назад"),
        ]
    ]);

    static primary = Markup.keyboard([
        [
            Markup.button.callback("Составление первички (ТТН)"),
            Markup.button.callback("Составление первички (СМР)"),
        ],
        [
            Markup.button.callback("Составление договоров(стандарт)"),
            Markup.button.callback("Составление договоров(обработанный человеком)")
        ],
        [
            Markup.button.callback("Назад"),
        ]
    ]);

    static adminForm = Markup.keyboard([
        [
            Markup.button.callback("Рейтинг бухгалтеров"),
            Markup.button.callback("Назначить модератором"),
        ],
        [
            Markup.button.callback("Общая статистика"),
            Markup.button.callback("Назначить исполнителем"),
        ]
    ]);
    static scenes = Markup.keyboard([
        [
            Markup.button.callback("userScene"),
            Markup.button.callback("adminScene"),
            Markup.button.callback("myFromsScene"),
            Markup.button.callback("createFormScene"),
        ]
    ]);
    static onlyBack = Markup.keyboard([
        [
            Markup.button.callback("Назад"),
        ]
    ]);
    static doneOrder = Markup.keyboard([
        [
            Markup.button.callback("Предпросмотр ответа"),

            Markup.button.callback("Отправить ответ и завершить заказ"),
        ],
        [
            Markup.button.callback("Назад"),

        ]
    ]);
    static makeComment = Markup.keyboard([
        [
            Markup.button.callback("Предпросмотр коментария"),

            Markup.button.callback("Отправить коментарий"),
        ],
        [
            Markup.button.callback("Назад"),

        ]
    ]);
    static remove = Markup.removeKeyboard();
}

module.exports = keyboards;