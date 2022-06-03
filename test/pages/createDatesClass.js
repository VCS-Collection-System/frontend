class createDatesClass {
    constructor() {
        this.vaxDate1 = '06-01-2020'
    }

    randomVaccineDates () {
        // Set timeframe in which it is possible to receive a vaccine.
        let date1 = new Date(this.vaxDate1)
        let date2 = new Date()

        // Ensure a date which is in the future can not be selected by moving date back 15 days from current date.
        date2.setDate(date2.getDate() - 15);

        // Get random date in possible vaccine timeframe.
        let vaxDate1 = this.randomDate(date1, date2)

        // Set vaxDate2 to 15 days past vaxDate1
        let vaxDate2 = new Date(vaxDate1)
        vaxDate2.setDate(vaxDate2.getDate() + 15);

        return [vaxDate1, vaxDate2.toLocaleString().split(/\D/).slice(0,3).map(num=>num.padStart(2,"0")).join("-")]
    }

    randomTestDate () {
        let earliest = "08-01-2021";
        let today = new Date();

        return this.randomDate(earliest, today);
    }

    randomDate (min, max) {
        let date1 = max
        let date2 = min
        date1 = new Date(date1).getTime()
        date2 = new Date(date2).getTime()
        if (date1 > date2) {
            return new Date(this.randomValueBetween(date2, date1)).toLocaleString().split(/\D/).slice(0,3).map(num=>num.padStart(2,"0")).join("-")
        } else {
            return new Date(this.randomValueBetween(date1, date2)).toLocaleString().split(/\D/).slice(0,3).map(num=>num.padStart(2,"0")).join("-")
        }
    }

    randomValueBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomDob() {
        return this.randomDate('01/01/2002', '01/01/1950')
    }
    
    randomVaccineLots () {
        //TODO: create actually random lot values
        let lot1 = "LOT1234"
        let lot2 = "LOT9876"

        return [lot1, lot2]
    }
}

module.exports = createDatesClass