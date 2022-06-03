const basePage = require('./basePage')

const URL = '/thankyou'
const EXITLOGOUT = {css: '.pf-m-danger'}

class thankYouPage extends basePage {
    constructor(driver) {
        super(driver)
    }

    async load() {
        await this.visit(URL)
        if (!(await this.isDisplayed(EXITLOGOUT, 1000)))
            throw new Error('Login form not loaded')
    }

    async selectLogoutExitButton() {
        await this.click(EXITLOGOUT)
    }
}

module.exports = thankYouPage