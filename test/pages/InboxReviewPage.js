const basePage = require('./basePage')
const { By } = require("selenium-webdriver");

const DOSES = { css: ".pf-c-accordion__expanded-content" };
const DATE_ADMINISTERED_FIELD = "vaccine-date-administered-";
const ACCEPT_BUTTON = { css: "button.pf-m-primary" };
const BACK_BUTTON = { xpath: "//button[. = 'Back']" };

class InboxReviewPage extends basePage {

    constructor(driver) {
        super(driver)
    }

    async getDateAdministeredFieldText(doseNumber) {
        const doses = await this.findMultiple(DOSES);
        if(doseNumber >= doses.length) {
            return "";
        }
        return this.getText(By.id(DATE_ADMINISTERED_FIELD + doseNumber));
    }

    async accept() {
    	await this.click(ACCEPT_BUTTON);
    	await this.driver.sleep(2500);
    }

    async back() {
    	await this.click(BACK_BUTTON);
    	await this.driver.sleep(500);
    }
}

module.exports = InboxReviewPage;
