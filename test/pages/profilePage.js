const basePage = require('./basePage')

const URL = '/profile'
const PROFILE_LABEL = {css: 'p'}
const PERSON_ID_LABEL = {css: '#employee-id-display .pf-c-form__label-text'}
const PERSON_ID_FIELD = {css: '#employee-id-display .pf-c-form-control'}
const FULL_NAME_LABEL = {css: '#employee-full-name .pf-c-form__label-text'}
const FULL_NAME_FIELD = {css: '#employee-full-name .pf-c-form-control'}
const EMAIL_LABEL = {css: '#employee-email-display .pf-c-form__label-text'}
const EMAIL_FIELD = {css: '#employee-email-display .pf-c-form-control'}
const ALTERNATE_EMAIL_LABEL = {css: '#alernative-email .pf-c-form__label-text'}
const ALTERNATE_EMAIL_FIELD = {css: '#alernative-email .pf-c-form-control'}
const AGENCY_LABEL = {css: '#employee-agency .pf-c-form__label-text'}
const AGENCY_FIELD = {css: '#employee-agency .pf-c-form-control'}
const ACCEPT_BUTTON = {css: '.pf-c-form__group-control > .pf-m-primary'}


class profilePage extends basePage {
    constructor(driver) {
        super(driver)
    }

    // @todo - implement profile.load function
    async load() {
        await this.visit(URL)
        if (!(await this.isDisplayed(PROFILE_LABEL, 1000)))
            throw new Error('Login form not loaded')
    }

    async verifyFields() {
        let buttonArray = [PROFILE_LABEL, PERSON_ID_LABEL, PERSON_ID_FIELD, FULL_NAME_LABEL, FULL_NAME_FIELD, DATE_OF_BIRTH_LABEL, DATE_OF_BIRTH_FIELD, EMAIL_LABEL,EMAIL_FIELD,
            ALTERNATE_EMAIL_LABEL, ALTERNATE_EMAIL_FIELD, AGENCY_LABEL, AGENCY_FIELD, AGENCY_FIELD]

        await this.visit(URL)
        buttonArray.forEach((element,index) => {
            if (!(this.isDisplayed(element, 1000)))
                throw new Error('Login form not loaded')
        })
    }
    async acceptProfile () {
        await this.click(ACCEPT_BUTTON)
    }
}

module.exports = profilePage