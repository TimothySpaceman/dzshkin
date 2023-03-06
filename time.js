module.exports = class Time {
    constructor(minutes) {
        if (!minutes) {
            const now = new Date()
            this.totalMinutes = now.getHours() * 60 + now.getMinutes()
        } else {
            this.totalMinutes = minutes
        }

        this.hours = Math.floor(this.totalMinutes / 60)
        this.minutes = this.totalMinutes % 60
    }

    format(){
        let result = `${this.hours}:${this.minutes}`
        if(this.minutes < 10) result = `${this.hours}:0${this.minutes}`
        return result
    }
}