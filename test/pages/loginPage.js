const globals = require('../../test_resources/globals');
const basePage = require('./basePage')

const LOGIN_FORM = {css: 'div > h1'}
const USERNAME_FIELD = { id: 'username' }
const PASSWORD_INPUT = { id: 'password' }
const SUBMIT_BUTTON = { id: 'kc-login' }
const INVALID_MESSAGE_SELECTOR = {id: 'input-error'}
const INVALID_MESSAGE = 'Invalid username or password.'
const LOGOUT_BUTTON = {css: 'css=.pf-c-button:nth-child(2) > span'}

class loginPage extends basePage {
    constructor(driver) {
        super(driver)
    }

    // @todo - Create logic for keycloak url checking.
    async load() {
        await this.visit('/login')
        if (!(await this.isDisplayed(LOGIN_FORM, 2500)))
            throw new Error('Login form not loaded')
    }

    async authenticate(username, password) {
        await this.type(USERNAME_FIELD, username)
        await this.type(PASSWORD_INPUT, password)
        await this.click(SUBMIT_BUTTON)
    }

    async verifyFields() {
        if (!(await this.isDisplayed(USERNAME_FIELD, 2500)))
            throw new Error('Login form not loaded')
        if (!(await this.isDisplayed(PASSWORD_INPUT, 2500)))
            throw new Error('Login form not loaded')
        if (!(await this.isDisplayed(SUBMIT_BUTTON, 2500)))
            throw new Error('Login form not loaded')
    }

    async assertFailMessageDisplayed (timeout) {
        await this.isDisplayed(INVALID_MESSAGE_SELECTOR, timeout)
    }

    async logout (timeout) {
        await this.click(LOGOUT_BUTTON)
    }


}

module.exports = loginPage