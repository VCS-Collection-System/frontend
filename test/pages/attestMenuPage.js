const basePage = require('./basePage')

const URL = '/attestmenu'
const MENU_H1 = {css: 'p:nth-child(1)'}
const SUBMIT_VACCINATION_RECORD_BUTTON = {id: 'submit-vax-card-menu-button'}
const SUBMIT_COVID_TEST_RESULTS_BUTTON = {id: 'submit-vax-test-menu-button'}
const SUBMIT_HR_DASHBOARD_BUTTON = {id: 'validate-submissions-button'}


class attestMenuPage extends basePage {
    constructor(driver) {
        super(driver)
    }

    async load() {
        await this.visit(URL)
        if (!(await this.isDisplayed(MENU_H1, 1000)))
            throw new Error('Login form not loaded')
    }

    async verifyUserFields(user) {
        let buttonArray = ''
        if (toString(user) === 'hr') {
            buttonArray = [SUBMIT_VACCINATION_RECORD_BUTTON, SUBMIT_COVID_TEST_RESULTS_BUTTON, SUBMIT_HR_DASHBOARD_BUTTON]
        } else if (toString(user) === 'unprivileged') {
            buttonArray = [SUBMIT_VACCINATION_RECORD_BUTTON, SUBMIT_COVID_TEST_RESULTS_BUTTON]
        } else {
            console.warn("Valid user values are 'unprivileged' or 'hr'.");
        }

        await this.visit(URL)
        for (let element in buttonArray) {
            if (!(this.isDisplayed(button, 1000))) {
                throw new Error('Login form not loaded')
            }
        }
    }
    async selectHrDashboard() {
        await this.click(SUBMIT_HR_DASHBOARD_BUTTON);
        await this.driver.sleep(2500);
    }
}

module.exports = attestMenuPage