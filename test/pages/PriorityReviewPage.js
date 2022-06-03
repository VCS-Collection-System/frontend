const basePage = require('./basePage');

const CONFIRM_BUTTON = { css: "button.pf-m-primary" };

class PriorityReviewPage extends basePage {

    constructor(driver) {
        super(driver);
    }

    async confirm() {
        await this.click(CONFIRM_BUTTON);
        await this.driver.sleep(2500);
    }
}

module.exports = PriorityReviewPage;