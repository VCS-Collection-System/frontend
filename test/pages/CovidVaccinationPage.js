const path = require('path');
const { By } = require("selenium-webdriver");
const assert = require('assert');
const basePage = require('./basePage');

const ADD_DOSE = { xpath: "//a[@data-testid='add-dose']" };
const DATE_OF_BIRTH_FIELD = { xpath: "//input[@aria-label='date_of_birth']" };
const SHOT_1_DATE_FIELD = { xpath: "//input[@aria-label='shot-1-date']" };
const SHOT_2_DATE_FIELD = { xpath: "//input[@aria-label='shot-2-date']" };
const SHOT_1_VENDOR_DROPDOWN = { xpath: "//select[@aria-label='vaccine-vendor-1']" };
const SHOT_2_VENDOR_DROPDOWN = { xpath: "//select[@aria-label='vaccine-vendor-2']" };
const SHOT_1_LOT_NUMBER_FIELD = { xpath: "//input[@aria-label='lot-number-1']" };
const SHOT_2_LOT_NUMBER_FIELD = { xpath: "//input[@aria-label='lot-number-2']" };
const PROOF_TYPE_DROPDOWN = { xpath: "//select[@aria-label='proof-type']" };
const FILE_FIELD = { xpath: "//input[@type='file']" };
const CONSENT_FIELD = {xpath: "//input[@id='consent-checkbox']"};

const ACCEPT_BUTTON = { css: "button.pf-m-primary" };
const SUBMIT_BUTTON = { css: "button.pf-m-primary" };

class CovidVaccinationPage extends basePage {
    constructor(driver) {
        super(driver)
    }

    async enterVaccination(dateOfBirth, shot1Date, shot1LotNumber, shot2Date, shot2LotNumber, proofType) {
        console.log(". Entering vaccination information...")
        if(dateOfBirth != null) {
            console.log(". . Set Date of Birth: " + dateOfBirth);
            await this.type(DATE_OF_BIRTH_FIELD, dateOfBirth);
        }

        await this.driver.manage().setTimeouts({ implicit: 10000 });

        await this.click(CONSENT_FIELD);

        console.log(". . Add Second Dose")
        await this.click(ADD_DOSE);

        console.log(". . Set Date of Shot 1: " + shot1Date);
        await this.type(SHOT_1_DATE_FIELD, shot1Date);

        console.log(". . Set Vaccine dropdown field to \"Pfizer\" for Shot 1");
        await this.find(SHOT_1_VENDOR_DROPDOWN).findElement(By.xpath("option[. = 'Pfizer']")).click();

        console.log(". . Set Lot Number for Shot 1: " + shot1LotNumber);
        await this.type(SHOT_1_LOT_NUMBER_FIELD, shot1LotNumber);
        
        console.log(". . Set Date of Shot 2: " + shot2Date);
        await this.type(SHOT_2_DATE_FIELD, shot2Date);

        console.log(". . Set Vaccine dropdown field to \"Pfizer\" for Shot 2");
        await this.find(SHOT_2_VENDOR_DROPDOWN).findElement(By.xpath("option[. = 'Pfizer']")).click();

        console.log(". . Set Lot Number for Shot 2: " + shot2LotNumber);
        await this.type(SHOT_2_LOT_NUMBER_FIELD, shot2LotNumber);

        if(proofType != null) {
            console.log(". . Set Proof Type dropdown field to \"Other\"");
            await this.find(PROOF_TYPE_DROPDOWN).findElement(By.xpath("//option[. = '"+ proofType + "']")).click();
            console.log(". . Upload Image of Vaccination Record");
            const filePath = path.join(__dirname, "../../test_resources/covid_card.png");
            await this.find(FILE_FIELD).sendKeys(filePath);
        }

        // await this.driver.sleep(5000000);
    }

    async checkDateOfBirth(displayed) {
        return assert.equal(this.isDisplayed(DATE_OF_BIRTH_FIELD), displayed);
    }

    async accept() {
        console.log(". Accepting Vaccination Form.");
        await this.click(ACCEPT_BUTTON);
        await this.driver.sleep(500);
    }

    async submit() {
        console.log(". Submitting Vaccination Form...");
        await this.click(SUBMIT_BUTTON);
        await this.driver.sleep(5000);
        assert.equal(await this.driver.getTitle(), "VCS | Thank You", "Vaccination submission was rejected.");
        console.log(". Submitted successfully.");
    }
}

module.exports = CovidVaccinationPage;