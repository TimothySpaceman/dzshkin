const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const texts = require('./texts.js')
const times = require('./times.js')

module.exports = class Clocker {
    constructor(userdb, hwdb, tabledb, bot) {
        this.udb = userdb
        this.hwdb = hwdb
        this.tdb = tabledb
        this.bot = bot

        this.msInMinute = 60000
        this.msInDay = this.msInMinute * 1440

        this.clock(this.daily, this.udb, this.tdb, this.hwdb, this.bot, times)
        setInterval(this.clock, this.msInMinute, this.daily, this.udb, this.tdb, this.hwdb, this.bot, times)
    }

    plan() {
        let now = new Date()
        let nowMs = ((parseInt(now.getHours()) * 60 + parseInt(now.getMinutes())) * 60 + parseInt(now.getSeconds())) * 1000 + parseInt(now.getMilieconds())
        setTimeout(this.plan, this.msInDay - nowMs)

        for (let [key, value] of Object.entries(this.udb.db)) {
            if (!value.settings.dailySend) continue
            if (value.settings.dailyTime * this.msInMinute <= nowMs) continue
            setTimeout(this.daily, value.settings.dailyTime * this.msInMinute - nowMs, key, this.tdb, this.hwdb, this.bot)
        }
    }

    clock(daily, udb, tdb, hwdb, bot, times) {
        let now = new Date()
        let nowMin = ((parseInt(now.getHours()) * 60 + parseInt(now.getMinutes())))
        let nowMs = nowMin + parseInt(now.getSeconds()) * 1000 + parseInt(now.getMilliseconds())

        for (let [key, value] of Object.entries(udb.db)) {
            if (!value.settings.dailySend) continue
            if (value.settings.dailyTime != nowMin) continue
            daily(key, tdb, hwdb, bot)
        }

        const day = tdb.today()
        let lesson

        for (let i = 0; i <= 6; i += 1) {
            lesson = tdb.db[day].lessons[i]
            if (lesson.type != "p") continue
            if (nowMin == parseInt(times[i].start) + 45) {
                hwdb.write(lesson.subject, "empty", "clocker")   
            }
        }

        console.log("Clock")
    }

    daily(id, tdb, hwdb, bot) {
        const day = tdb.soonest()
        const date = new Date(tdb.db[day].date)
        const dayName = tdb.db[day].name

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
            lesson = tdb.db[day].lessons[i]
            lessons[i] = lesson.subject
            if (lesson.type == "e") continue
            if (lesson.type == "l") {
                hws[i] = "(Лекція)"
                continue
            }

            subjecthw = hwdb.db[`${lesson.subject}`]
            if (subjecthw[0].text == "empty") {
                hws[i] = "(Відсутнє записане домашнє завдання)"
            } else {
                hws[i] = subjecthw[0].text
            }
        }

        bot.telegram.sendMessage(id, texts.dailyhw(dayName, dayDate, lessons, hws), { parse_mode: 'HTML' })
    }
}