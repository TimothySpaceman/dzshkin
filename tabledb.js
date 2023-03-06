const fs = require("fs")
const subjects = require('./subjects.js')
const times = require('./times.js')
const Time = require('./time.js')


module.exports = class TableDB {
    constructor() {
        this.CN = "[Table Database] "
        this.dbPath = 'database/table.json'
        this.db

        this.msInDay = 86400000
        this.msInWeek = this.msInDay * 7

        this.firstMonday = "Feb 20, 2023 00:00:00"

        this.currentWeek = Math.floor((new Date() - Date.parse(this.firstMonday)) / 604800000) % 2

        try {
            this.load()
            console.log(this.CN + 'Ready!')
        }
        catch (error) {
            console.log(this.CN + 'Error reading database\n', error)
        }

        this.setDates()
    }

    setDates() {
        const now = new Date()

        let week = Math.floor((Date.parse(now) - Date.parse(this.firstMonday)) / this.msInWeek)
        let currentMonday = Date.parse(this.firstMonday) + week * this.msInWeek
        this.currentWeek = week % 2

        for (let i = 0; i <= 4; i += 1) {
            this.db[5 * this.currentWeek + i].date = new Date(currentMonday + this.msInDay * i)
        }
        if (this.currentWeek == 0) {
            for (let i = 5; i <= 9; i += 1) {
                this.db[i].date = new Date(currentMonday + this.msInDay * i)
            }
        } else {
            for (let i = 0; i <= 4; i += 1) {
                this.db[i].date = new Date(currentMonday + this.msInDay * i + this.msInWeek)
            }
        }

        this.save('(Dates Setup)')
    }

    soonest(){
        let now = new Date()
        this.currentWeek = Math.floor((new Date() - Date.parse(this.firstMonday)) / 604800000) % 2
        if(now.getDay() >= 5 && now.getDay() <= 7){
            return 5*(1-this.currentWeek)
        }
        return this.today() + 1
    }

    today() {
        let now = new Date()

        if(now.getDay() == 6 || now.getDay() == 7){
            now = new Date(Date.parse(now) + this.msInDay * (8 - now.getDay()))
            now.setHours(0,0,0)
        }

        let today = now.getDate()

        for (let i = 0; i <= 9; i += 1) {
            if (new Date(this.db[i].date).getDate() == today)
                return i
        }

        console.log(this.CN + "Error: Couldn't find today's index")
        return 0
    }

    find(subject) {
        let lesson
        let nowTime = new Time()

        for (let dayi = this.today(); dayi <= 4 + 5 * this.currentWeek; dayi += 1) {
            for (let lessoni = 0; lessoni <= 6; lessoni += 1) {
                lesson = this.db[dayi].lessons[lessoni]
                if (lesson.subject == subject && lesson.type == "p" && ((dayi == this.today() && nowTime.totalMinutes < times[lessoni].start) || dayi != this.today()))
                    return dayi
            }
        }
        for (let dayi = 0; dayi <= 4; dayi += 1) {
            for (let lessoni = 0; lessoni <= 6; lessoni += 1) {
                lesson = this.db[5 * (1 - this.currentWeek) + dayi].lessons[lessoni]
                if (lesson.subject == subject && lesson.type == "p") return dayi
            }
        }
        if(this.currentWeek == 0){
            for (let dayi = 0; dayi < this.today(); dayi += 1) {
                for (let lessoni = 0; lessoni <= 6; lessoni += 1) {
                    lesson = this.db[dayi].lessons[lessoni]
                    if (lesson.subject == subject && lesson.type == "p") return dayi
                }
            }
        }
    }

    load() {
        try {
            let dbString = String(fs.readFileSync(this.dbPath))
            if (dbString == "") {
                console.log(this.CN + 'Error reading file: empty file! Generating...')
                this.generate()
            }
            //console.log(this.CN + 'Successfully read file')
            this.db = JSON.parse(dbString)

        }
        catch (error) {
            console.log(this.CN + "Error reading file\n", error)
        }
    }

    save(operation = "") {
        try {
            const jsonString = JSON.stringify(this.db)
            fs.writeFileSync(this.dbPath, jsonString)
            console.log(this.CN + `Successfully wrote updated file ${operation}`)
        }
        catch (error) {
            console.log(this.CN + `Error writing updated file ${operation}\n`, error)
        }
        this.load()
    }
}