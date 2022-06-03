const globals = require('../../test_resources/globals');
const basePage = require('./basePage')
const SUBMIT_BUTTON = { css: ".pf-c-card__footer > .pf-c-button" }


class eulaPage extends basePage {

    constructor(driver) {
        super(driver)
    }

    // @todo - Create logic for keycloak url checking.
    async clickEluaAcceptButton () {
        if (this.getCurrentUrl() == toString(globals.appRoute + '/')) {
            await this.click(SUBMIT_BUTTON)
        } else {
            await this.click(SUBMIT_BUTTON)
        }
    }
}

module.exports = eulaPage