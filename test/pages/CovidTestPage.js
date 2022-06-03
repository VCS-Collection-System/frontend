const path = require('path');
const { By } = require("selenium-webdriver");
const assert = require('assert');
const basePage = require('./basePage');

const DATE_OF_BIRTH_FIELD = { xpath: "//input[@aria-label='date_of_birth']" };
const RESULT_DROPDOWN = { xpath: "//select[@aria-label='test-results-input']" };
const DATE_FIELD = { xpath: "//input[@aria-label='test-results-date']" };
const FILE_FIELD = { xpath: "//input[@type='file']" };
const CLEAR_BUTTON = { xpath: "//button[. = 'Clear']" };

const ACCEPT_BUTTON = { css: "button.pf-m-primary" };
const SUBMIT_BUTTON = { css: "button.pf-m-primary" };

class CovidTestPage extends basePage {
    constructor(driver) {
        super(driver)
    }

    async enterPositiveTest(dateOfBirth, testDate, resultValue) {
        console.log(". Entering positive test information...");
        console.log(". . Set Date of Birth: " + dateOfBirth);
        if(dateOfBirth != null) {
            await this.find(DATE_OF_BIRTH_FIELD).clear();
            await this.type(DATE_OF_BIRTH_FIELD, dateOfBirth);
        }

        console.log(". . Set Test Result to \"Positive\"");
        await this.find(RESULT_DROPDOWN).findElement(By.xpath("option[. = 'Positive']")).click();

        console.log(". . Set Test Date: " + testDate);
        await this.find(DATE_FIELD).clear();
        await this.type(DATE_FIELD, testDate);

        console.log(". . Upload Image of Test Result");
        const filePath = path.join(__dirname, "../../test_resources/covid_card.png");
        if(await this.find(CLEAR_BUTTON).isEnabled()) {
            await this.click(CLEAR_BUTTON);
        }
        await this.find(FILE_FIELD).sendKeys(filePath);
    }

    async enterCertificateOfRecovery(dateOfBirth, recoveryDate) {
        console.log(". Entering certificate of recovery information...");
        console.log(". . Set Date of Birth: " + dateOfBirth);
        if(dateOfBirth != null) {
            await this.find(DATE_OF_BIRTH_FIELD).clear();
            await this.type(DATE_OF_BIRTH_FIELD, dateOfBirth);
        }

        console.log(". . Set Test Result to \"Certificate of Recovery\"");
        await this.find(RESULT_DROPDOWN).findElement(By.xpath("option[. = 'Certificate of Recovery']")).click()

        console.log(". . Set Certificate Date: " + recoveryDate)
        await this.find(DATE_FIELD).clear();
        await this.type(DATE_FIELD, recoveryDate)

        console.log(". . Upload Image of Test Result");
        const filePath = path.join(__dirname, "../../test_resources/covid_card.png");
        if(await this.find(CLEAR_BUTTON).isEnabled()) {
            await this.click(CLEAR_BUTTON);
        }
        await this.find(FILE_FIELD).sendKeys(filePath);
    }

    async accept() {
        console.log(". Accepting Test/Recovery Form.");
        await this.driver.sleep(2500);
        await this.click(ACCEPT_BUTTON);
    }

    async submit() {
        console.log(". Submitting Test/Recovery Form...");
        await this.click(SUBMIT_BUTTON);
        await this.driver.sleep(5000);
        assert.equal(await this.driver.getTitle(), "VCS | Thank You", "Vaccination submission was rejected.");
        console.log(". Submitted successfully.");
    }
}

module.exports = CovidTestPage