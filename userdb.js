const fs = require("fs")
module.exports = class UserDB {
    constructor() {
        this.CN = "[User Database] "
        this.dbPath = 'database/users.json'
        this.db

        this.emptyTemp = {
            "week": "empty",
            "day": "empty",
            "subject": "empty"
        }

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
        const usersTemplate = {
            "770066016": {
                "name": "._.",
                "link": "SmthFromSpace",
                "permission": 2,
                "status": 101,
                "temp": this.emptyTemp,
                "settings": {
                    "dailySend": false,
                    "dailyTime": 990,
                    "nextSend": false
                }
            }
        }

        this.db = usersTemplate

        this.save('(generation)')
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
            if(operation != "silent") console.log(this.CN + `Successfully wrote updated file ${operation}`)
        }
        catch (error) {
            console.log(this.CN + `Error writing updated file ${operation}\n`, error)
        }
        this.load()
    }

    register = (id, name, link, permission = 1) => {
        const userData = {
            "name": `${name}`,
            "link": `${link}`,
            "permission": `${permission}`,
            "status": 101,
            "temp": this.emptyTemp,
            "settings": {
                "dailySend": false,
                "dailyTime": 990,
                "nextSend": false
            }
        }

        this.load()
        this.db[id] = userData

        this.save(`(register ${id})`)
    }
}