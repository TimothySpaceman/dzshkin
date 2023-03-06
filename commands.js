const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const Time = require('./time.js')
const texts = require('./texts.js')
const subjects = require('./subjects.js')

let isNumber = (arg) => {
    if (parseFloat(arg) == NaN) return false
    return true
}

module.exports = class Commands {
    constructor(userdb, hwdb, tabledb) {
        this.udb = userdb
        this.hwdb = hwdb
        this.tdb = tabledb
    }

    updateUserContacts(ctx) {
        const id = ctx.message.chat.id
        this.udb.db[`${id}`].name = ctx.message.chat.first_name
        if (ctx.message.chat.last_name) this.udb.db[`${id}`].name += " " + ctx.message.chat.last_name

        if (ctx.message.chat.username)
            this.udb.db[`${id}`].link = ctx.message.chat.username
        else
            this.udb.db[`${id}`].link = "empty"
        this.udb.save('silent')
    }

    checkPermission(id, permission) {
        if (!this.udb.db[`${id}`] || this.udb.db[`${id}`].permission < permission) {
            return false
        }
        return true
    }

    isRegistered(ctx) {
        const id = ctx.message.chat.id
        if (!this.checkPermission(id, 1)) {
            ctx.replyWithMarkdown(texts.unregistered(id))
            return false
        }
        this.updateUserContacts(ctx)
        return true
    }

    default(ctx) {
        if (!this.isRegistered(ctx)) return
        const id = ctx.message.chat.id
        this.udb.db[`${id}`].status = 101
        ctx.replyWithMarkdown(texts.default)
    }

    message(ctx) {
        if (!this.isRegistered(ctx)) return
        const id = ctx.message.chat.id
        if (this.udb.db[`${id}`].status == 401) {
            this.hwdb.write(`${subjects[`${this.udb.db[`${id}`].temp.subject}`]}`, ctx.message.text, id)
            ctx.replyWithMarkdown(texts.setOverwrite)
            this.udb.db[`${id}`].status = 101
        }
        if (this.udb.db[`${id}`].status == 701) {
            let args = ctx.message.text.split(':')

            if (args.length != 2 || !(isNumber(args[0]) && isNumber(args[1])) || args[0] < 0 || args[0] > 23 || args[1] < 0 || args[1] > 59) {
                ctx.replyWithMarkdown(texts.invalidData)
                return
            }

            this.udb.db[`${id}`].settings.dailyTime = parseInt(args[0]) * 60 + parseInt(args[1])
            this.udb.save()

            ctx.replyWithMarkdown(texts.setDailyTime)

            this.udb.db[`${id}`].status = 101
        }

        this.udb.save()
        this.hwdb.save()
    }

    info(ctx) {
        const id = ctx.message.chat.id
        if (!this.isRegistered(ctx)) return
        ctx.replyWithMarkdown(texts.info)
    }

    settings(ctx) {
        const id = ctx.message.chat.id
        if (!this.isRegistered(ctx)) return

        let dailySend
        if (this.udb.db[`${id}`].settings.dailySend == true) {
            dailySend = "Увімк.🟢"
        } else {
            dailySend = "Вимк.🔴"
        }

        let dailyTime = new Time(this.udb.db[`${id}`].settings.dailyTime)

        ctx.replyWithMarkdown(texts.settings, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `Щоденне нагадування: ${dailySend}`, callback_data: "toggle-daily" }],
                    [{ text: `Час для нього: ${dailyTime.format()}`, callback_data: "set-daily-time" }]
                ]
            }
        })
    }

    dailyToggle(ctx) {
        const id = ctx.update.callback_query.from.id

        ctx.answerCbQuery()
        this.udb.db[`${id}`].settings.dailySend = !this.udb.db[`${id}`].settings.dailySend

        let dailySend
        if (this.udb.db[`${id}`].settings.dailySend == true) {
            dailySend = "Увімк.🟢"
        } else {
            dailySend = "Вимк.🔴"
        }

        let dailyTime = new Time(this.udb.db[`${id}`].settings.dailyTime)

        ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [{ text: `Щоденне нагадування: ${dailySend}`, callback_data: "toggle-daily" }],
                [{ text: `Час для нього: ${dailyTime.format()}`, callback_data: "set-daily-time" }]
            ]
        }
        )

        this.udb.save()
    }

    setDailyTime(ctx) {
        const id = ctx.update.callback_query.from.id

        ctx.answerCbQuery()
        this.udb.db[`${id}`].status = 701
        ctx.replyWithMarkdown(texts.askDailyTime)

        this.udb.save()
    }

    get(ctx) {
        const id = ctx.message.chat.id

        if (!this.isRegistered(ctx)) return
        this.udb.db[`${id}`].temp = this.udb.emptyTemp
        ctx.replyWithMarkdown(texts.selecthw, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Обрати Тиждень📆", callback_data: "get-week" }],
                    [{ text: "Обрати предмет📚", callback_data: "get-subject" }],
                    [{ text: "ДЗ на найближчий день🌅", callback_data: "get-soonest" }]
                ]
            }
        })
        this.udb.save()
    }

    reGet(ctx) {
        const id = ctx.update.callback_query.from.id

        ctx.answerCbQuery()
        this.udb.db[`${id}`].temp = this.udb.emptyTemp
        ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [{ text: "Обрати Тиждень📆", callback_data: "get-week" }],
                [{ text: "Обрати предмет📚", callback_data: "get-subject" }],
                [{ text: "ДЗ на найближчий день🌅", callback_data: "get-soonest" }]
            ]
        })
        this.udb.save()
    }

    getSoonest(ctx) {
        const id = ctx.update.callback_query.from.id

        this.udb.db[`${id}`].temp.week = Math.floor(this.tdb.soonest() / 5) + 1
        this.udb.db[`${id}`].temp.day = this.tdb.soonest() % 5
        this.getDayHw(ctx)
    }

    getWeek(ctx) {
        const id = ctx.update.callback_query.from.id

        ctx.answerCbQuery()
        this.udb.db[`${id}`].temp.week = "empty"
        ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [{ text: "Тиждень 1", callback_data: "get-day 1" }],
                [{ text: "Тиждень 2", callback_data: "get-day 2" }],
                [{ text: "Назад", callback_data: "get" }]]
        })
        this.udb.save()
    }

    getDay(ctx) {
        const id = ctx.update.callback_query.from.id

        ctx.answerCbQuery()
        this.udb.db[`${id}`].temp.day = "empty"
        ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [{ text: "Понеділок", callback_data: "get-day-hw 1" }],
                [{ text: "Вівторок", callback_data: "get-day-hw 2" }],
                [{ text: "Середа", callback_data: "get-day-hw 3" }],
                [{ text: "Четвер", callback_data: "get-day-hw 4" }],
                [{ text: "П’ятниця", callback_data: "get-day-hw 5" }],
                [{ text: "Назад", callback_data: "get-week" }]]
        })
        this.udb.save()
    }

    getDayHw(ctx) {
        const id = ctx.update.callback_query.from.id

        const day = this.udb.db[`${id}`].temp.day + ((this.udb.db[`${id}`].temp.week - 1) * 5)
        const date = new Date(this.tdb.db[day].date)
        const dayName = this.tdb.db[day].name

        let formatDate = date.getDate()
        if (formatDate < 10) formatDate = "0" + formatDate
        let formatMonth = date.getMonth() + 1
        if (formatMonth < 10) formatMonth = "0" + formatMonth

        const dayDate = `${formatDate}.${formatMonth}.${date.getFullYear()}`


        let lesson
        let subjecthw
        let lessons = []
        let hws = []

        for (let i = 0; i <= 6; i += 1) {
            lesson = this.tdb.db[day].lessons[i]
            lessons[i] = lesson.subject
            if (lesson.type == "e") continue
            if (lesson.type == "l") {
                hws[i] = "(Лекція)"
                continue
            }

            subjecthw = this.hwdb.db[`${lesson.subject}`]
            if (subjecthw[0].text == "empty") {
                hws[i] = "(Відсутнє записане домашнє завдання)"
            } else {
                hws[i] = subjecthw[0].text
            }
        }

        ctx.answerCbQuery()
        ctx.replyWithMarkdown(texts.dayhw(dayName, dayDate, lessons, hws))
    }

    getSubject(ctx) {
        const id = ctx.update.callback_query.from.id

        this.udb.db[`${ctx.update.callback_query.from.id}`].temp.subject = "empty";

        let keyboard = []

        for (let i = 1; i <= 8; i += 1) {
            keyboard[i - 1] = [{ text: `${subjects[`${subjects[`${i}`]}`]}`, callback_data: `get-subject-hw ${i}` }]
        }

        keyboard[8] = [{ text: "Назад", callback_data: "get" }]


        this.udb.db[`${id}`].temp.subject = "empty"

        ctx.answerCbQuery()
        ctx.editMessageReplyMarkup({
            inline_keyboard: keyboard
        })

        this.udb.save()
    }

    getSubjectHw(ctx) {
        const id = ctx.update.callback_query.from.id

        const subject = subjects[`${this.udb.db[`${id}`].temp.subject}`]
        const day = this.tdb.find(subject)
        const dayName = this.tdb.db[day].name

        let hw

        const date = new Date(this.tdb.db[day].date)
        let formatDate = date.getDate()
        if (formatDate < 10) formatDate = "0" + formatDate
        let formatMonth = date.getMonth() + 1
        if (formatMonth < 10) formatMonth = "0" + formatMonth

        const dayDate = `${formatDate}.${formatMonth}.${date.getFullYear()}`

        let subjecthw = this.hwdb.db[`${subject}`]
        if (subjecthw[0].text == "empty") {
            hw = "(Відсутнє записане домашнє завдання)"
        } else {
            hw = subjecthw[0].text
        }

        ctx.answerCbQuery()
        ctx.replyWithMarkdown(texts.subjecthw(subject, hw, dayDate, dayName))
    }

    set(ctx) {
        const id = ctx.message.chat.id

        if (!this.isRegistered(ctx)) return
        this.udb.db[`${id}`].temp = this.udb.emptyTemp

        let keyboard = []

        for (let i = 1; i <= 8; i += 1) {
            keyboard[i - 1] = [{ text: `${subjects[`${subjects[`${i}`]}`]}`, callback_data: `set-hw ${i}` }]
        }

        this.udb.db[`${id}`].temp.subject = "empty"

        ctx.replyWithMarkdown(texts.selectSubject, {
            reply_markup: { inline_keyboard: keyboard }
        })

        this.udb.save()
    }

    setHw(ctx) {
        ctx.answerCbQuery()
        const id = ctx.update.callback_query.from.id

        const subject = subjects[`${this.udb.db[`${id}`].temp.subject}`]

        let subjecthw = this.hwdb.db[`${subject}`]
        let hw = subjecthw[0].text

        ctx.editMessageReplyMarkup({
            inline_keyboard: [[]]
        })
        if (hw != "empty") {
            ctx.replyWithMarkdown(texts.askOverwrite(subject, hw), {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Так, записати нове", callback_data: "set-overwrite" }],
                        [{ text: "Ні, залишити вже існуюче", callback_data: "set-leave" }]
                    ]
                }
            })
            return
        }
        ctx.replyWithMarkdown(texts.hwSubject(subject))
        ctx.replyWithMarkdown(texts.askHw)
        this.udb.db[`${id}`].status = 401
    }

    setOverwriteHw(ctx) {
        ctx.answerCbQuery()
        const id = ctx.update.callback_query.from.id
        ctx.editMessageReplyMarkup({
            inline_keyboard: [[]]
        })
        ctx.replyWithMarkdown(texts.askHw)
        this.udb.db[`${id}`].status = 401
        this.udb.save()
    }

    setLeave(ctx) {
        ctx.answerCbQuery()

        ctx.editMessageReplyMarkup({
            inline_keyboard: [[]]
        })

        ctx.replyWithMarkdown(texts.setLeave)
    }

    register(ctx) {
        const id = ctx.message.chat.id
        if (!this.isRegistered(ctx)) return
        if (!this.checkPermission(id, 2)) return
        let args = ctx.message.text.split(' ')
        if (args.length < 2) {
            ctx.replyWithMarkdown(texts.invalidData)
            return
        }
        try {
            this.udb.register(args[1], "empty", "empty")
        }
        catch (error) {
            ctx.replyWithMarkdown(texts.regErr(args[1]))
            return
        }
        ctx.replyWithMarkdown(texts.regDone(args[1]))
    }

    setPermission(ctx) {
        const id = ctx.message.chat.id
        if (!this.isRegistered(ctx)) return
        if (!this.checkPermission(id, 2)) return
        let args = ctx.message.text.split(' ')
        if (args.length < 3 || args[2] < 0 || args[2] > 2) {
            ctx.replyWithMarkdown(texts.invalidData)
            return
        }
        try {
            this.udb.db[`${args[1]}`].permission = parseInt(args[2])
            this.udb.save()
        }
        catch (error) {
            ctx.replyWithMarkdown(texts.setPermErr)
            return
        }
        ctx.replyWithMarkdown(texts.setPerm(args[1], args[2]))
    }
}