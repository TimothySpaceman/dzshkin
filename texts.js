const Time = require('./time.js')
const days = require('./days.js')
const times = require('./times.js')
const subjects = require('./subjects.js')
const books = ["📕", "📗", "📘", "📙", "📔", "📓", "📕", "📗", "📘", "📙", "📔", "📓", "📕", "📗", "📘", "📙", "📔", "📓"]
const perms = ["🤷🏻‍♂️", "👨🏻‍💻", "👨🏻‍🔧"]

module.exports = {
    "hello": "🙃*Привіт!*🤓\n\nМене звати ДЗшкін, і мета мого існування - організувати домашнє завдання📚",
    "unregistered": (id) => { return `🤔*Схоже, ти не є зареєстрованим користувачем!*🤷🏻‍♂️\n\nНажаль, через це ти не маєш доступ до мого функціоналу...😔\n\nЯкщо це помилка, або ти бажаєш зареєструватися і використовувати функціонал бота, повідом про це розробникам!👨🏻‍💻\n\n*Твій id: *\`${id}\`\n_(Натисни, щоб скопіювати)_` },
    "registered": "👾*Щоб дізнатися інформацію про мене і мій функціонал, використовуй команду /info*",
    "info": "👾*Ось інформація про мене!*📘\n\n🤓Команда /get - отримати ДЗ з певного предмету або на певний день (в тому числі на наступний навчальний день з урахуванням вихідних)\n\n📝Команда /set - записати ДЗ з певного предмету\n\n⚙️Команда /settings - перейти до персональних налаштувань\n\n\n🤔Якщо виникли питання, проблеми, помилки або пропозиції - повідом про це *розробникам*👨🏻‍💻\n\n🙃*Приємного використання!*🤝",
    "invalidData": "😔*Не можу розпізнати твоє повідомлення...*\n\nПеревір правильність введених даних!\n\n_В будь-який момент для припинення виконання команди використовуй /default_",
    "default": "👾*Дію скасовано!*\n\nТепер ти в звичайному стані",
    "selecthw": "📗*Яке саме ДЗ тебе цікавить?*📙",
    "selectSubject": "📚*З якого предмету потрібно записати дз?*📝",
    "hwSubject": (subject) => { return `📚*${subjects[`${subject}`]}*` },
    "askOverwrite": (subject, hw) => {
        return `📚*${subjects[`${subject}`]}*\n\n‼️На цей предмет вже записано домашнє завдання:\n${hw}\n\n📝*Замінити вже існуюче ДЗ на нове?*`
    },
    "askHw": "👇*Напиши нове домашнє завдання для цього предмету (одним текстовим повідомленням)*\n\nЩоб скасувати дію, використовуй /default",
    "setLeave": "✅*Залишено вже записане домашнє завдання!*👌",
    "setOverwrite": "✅*Нове домашнє завдання успішно записано!*🤝",
    "subjecthw": (subject, hw, date, dayName) => {
        return `📚*${subjects[`${subject}`]}*\n\n${books[Math.floor(Math.random() * 6)]}${hw}\n\n📆*Найближча пара:*\n_${date} _(${dayName})`
    },
    "dayhw": (day, date, lessons, hws) => {
        let result = `📚*${day} *_(${date})_\n\n`

        lessons.forEach((lesson, index) => {
            if (lesson == "empty") return
            let start = new Time(times[index].start)
            let end = new Time(times[index].end)
            result += `${books[index]}*${subjects[`${lesson}`]}*\n_${start.format()} - ${end.format()}_\n${hws[index]}\n\n`
        })

        return result
    },
    "dailyhw": (day, date, lessons, hws) => {
        let result = `📬<b>Щоденне нагадування!</b>\n\n📚<b>${day}</b><i>(${date})</i>\n\n`

        lessons.forEach((lesson, index) => {
            if (lesson == "empty") return
            let start = new Time(times[index].start)
            let end = new Time(times[index].end)
            result += `${books[index]}<b>${subjects[`${lesson}`]}</b>\n<i>${start.format()} - ${end.format()}</i>\n${hws[index]}\n\n`
        })

        return result
    },
    "settings": "👾*Твої налаштування*⚙️\n\n📬*Щоденне нагадування*: я надсилатиму тобі щодня ДЗ на наступний робочий день\n\n⏰*Час для цього нагадування*: година і хвилина, о котрій я надсилатиму це ДЗ\n\n👇_Натисни на кнопку щоб змінити відповідний параметр!_",
    "askDailyTime": "👇*Введи новий час для щоденного нагадування*\n_(Наприклад, 16:30)_\n\nЩоб скасувати дію, використовуй /default",
    "setDailyTime": "⏰*Новий час для щоденного нагадування встановлено*👌",
    "regDone": (id) => { return `👾*Користувача *_${id}_* зареєстровано!*🥳` },
    "regErr": (id) => { return `👾*Не вдалося зареєструвати користувача *_${id}_*!*😔` },
    "setPerm": (id, perm) => { return `👾*Встановлено рівень прав *\`${perm}\`* для користувача *\`${id}\`*!*${perms[perm]}` },
    "setPermErr": "👾*Не вдалося встановити рівень прав для користувача!*🚫"
}