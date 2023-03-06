const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

const bot = new Telegraf("5966619175:AAHdawA6DaQF3WHbh8RGJ4PiVMNZoky_RcE")

let texts = require('./texts.js')

let Time = require('./time.js')

let UserDB = require('./userdb.js')
let HomeworkDB = require('./homeworkdb.js')
let TableDB = require('./tabledb.js')
let userDB = new UserDB()
let hwDB = new HomeworkDB()
let tDB = new TableDB()

let Commands = require('./commands.js')
let commands = new Commands(userDB, hwDB, tDB)
let Clocker = require('./clocker.js')
let clocker = new Clocker(userDB, hwDB, tDB, bot)

bot.command('info', async (ctx) => {commands.info(ctx)})
bot.command('get', async (ctx) => {commands.get(ctx)})
bot.command('set', async (ctx) => {commands.set(ctx)})
bot.command('default', async (ctx) => {commands.default(ctx)})
bot.command('settings', async (ctx) => {commands.settings(ctx)})

bot.command('register', async (ctx) => {commands.register(ctx)})
bot.command('permission', async (ctx) => {commands.setPermission(ctx)})

bot.on(message('text'), async (ctx) => {commands.message(ctx)})


bot.action('toggle-daily', async (ctx) => {commands.dailyToggle(ctx)})
bot.action('set-daily-time', async (ctx) => {commands.setDailyTime(ctx)})

bot.action('get', async (ctx) => {commands.reGet(ctx)})

bot.action('get-soonest', async (ctx) => {commands.getSoonest(ctx)})

bot.action('get-week', async (ctx) => {commands.getWeek(ctx)})

bot.action('get-day 1', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.week = 1; commands.getDay(ctx)})
bot.action('get-day 2', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.week = 2; commands.getDay(ctx)})

bot.action('get-day-hw 1', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.day = 0; commands.getDayHw(ctx)})
bot.action('get-day-hw 2', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.day = 1; commands.getDayHw(ctx)})
bot.action('get-day-hw 3', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.day = 2; commands.getDayHw(ctx)})
bot.action('get-day-hw 4', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.day = 3; commands.getDayHw(ctx)})
bot.action('get-day-hw 5', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.day = 4; commands.getDayHw(ctx)})

bot.action('get-subject', async (ctx) => {commands.getSubject(ctx)})

bot.action('get-subject-hw 1', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 1; commands.getSubjectHw(ctx)})
bot.action('get-subject-hw 2', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 2; commands.getSubjectHw(ctx)})
bot.action('get-subject-hw 3', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 3; commands.getSubjectHw(ctx)})
bot.action('get-subject-hw 4', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 4; commands.getSubjectHw(ctx)})
bot.action('get-subject-hw 5', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 5; commands.getSubjectHw(ctx)})
bot.action('get-subject-hw 6', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 6; commands.getSubjectHw(ctx)})
bot.action('get-subject-hw 7', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 7; commands.getSubjectHw(ctx)})
bot.action('get-subject-hw 8', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 8; commands.getSubjectHw(ctx)})


bot.action('set-hw 1', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 1; commands.setHw(ctx)})
bot.action('set-hw 2', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 2; commands.setHw(ctx)})
bot.action('set-hw 3', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 3; commands.setHw(ctx)})
bot.action('set-hw 4', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 4; commands.setHw(ctx)})
bot.action('set-hw 5', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 5; commands.setHw(ctx)})
bot.action('set-hw 6', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 6; commands.setHw(ctx)})
bot.action('set-hw 7', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 7; commands.setHw(ctx)})
bot.action('set-hw 8', async (ctx) => {userDB.db[`${ctx.update.callback_query.from.id}`].temp.subject = 8; commands.setHw(ctx)})

bot.action('set-overwrite', async (ctx) => {commands.setOverwriteHw(ctx)})
bot.action('set-leave', async (ctx) => {commands.setLeave(ctx)})



bot.launch()