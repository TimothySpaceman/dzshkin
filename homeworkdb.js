const fs = require("fs")
const subjects = require('./subjects.js')

module.exports = class HomeworkDB {
    constructor() {
        this.CN = "[Homework Database] "
        this.dbPath = 'database/homework.json'
        this.db

        try {
            this.load()
            console.log(this.CN + 'Ready!')
        }
        catch (error) {
            console.log(this.CN + 'Error reading database. Generating...\n', error)
            try {
                this.generate()
                this.db = this.load()
                console.log(this.CN + 'Ready!')
            }
            catch (error) {
                console.log(this.CN + 'Error preparing database\n', error)
            }
        }
    }

    generate = () => {
        let dbTemplate = {}

        for(let i = 1; i <= 8; i += 1){
            dbTemplate[`${subjects[i]}`] = []
        }

        console.log(dbTemplate)

        this.db = dbTemplate

        this.save('(generation)')
    }

    write(subject, text, user){
        let hw = {
            "date": new Date(),
            "user": `${user}`,
            "text": `${text}`
        }

        this.db[subject].unshift(hw)
        this.save(`(write hw for ${subject})`)
    }

    load = () => {
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

    save = (operation = "") => {
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