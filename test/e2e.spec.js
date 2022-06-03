const globals = require("../test_resources/globals")
const path = require('path')
const assert = require('assert')
const attestMenuPage = require('./pages/attestMenuPage')
const CovidVaccinationPage = require('./pages/CovidVaccinationPage')
const CovidTestPage = require('./pages/CovidTestPage')
const basePage = require("./pages/basePage")
const eulaPage = require('./pages/eulaPage')
const loginPage = require('./pages/loginPage')
const profilePage = require('./pages/profilePage')
const thankYouPage = require('./pages/thankYouPage')
const createDatesClass = require('./pages/createDatesClass')
const createLotsClass = require('./pages/createDatesClass') // TODO: Combine with ^createDatesClass^
const HRDashboardPage = require('./pages/HRDashboardPage')
const SettingsPage = require('./pages/SettingsPage')
const { By, Builder } = require("selenium-webdriver");
const webdriver = require("selenium-webdriver");
var remote = require('selenium-webdriver/remote');
const { Options } = require("selenium-webdriver/chrome")
const { ChromecastIcon } = require("@patternfly/react-icons")

// For local
// require("chromedriver");
// const AllureReporter = require("mocha-allure-reporter")
describe('End to End - Smoke Test', function () {
    this.timeout(120000)
    let driver
    let base
    let login
    let eula
    let profile
    let createDates
    let thankyou
    let attestMenu
    let hrpanels
    let vaccinationDates
    let dateShotOne
    let dateShotTwo
    let unprivDob
    let privDob
    let testSetting
    let testSettingValue
    let testUseGs

    before(async function () {

        // For Selenium Grid 
        driver = new Builder().forBrowser(globals.browser).usingServer(globals.webDriverUrl)

        // Sandbox mode causes a crash if running within ocp. Disable sandbox for chrome. See:
        // https://stackoverflow.com/questions/53902507/unknown-error-session-deleted-because-of-page-crash-from-unknown-error-cannot
        if (globals.browser == "chrome") {

            options = new Options()
            options.addArguments(['no-sandbox', 'ignore-certificate-errors', 'ignore-ssl-errors=yes'])
            driver.setChromeOptions(options)
        }
        driver = driver.build()
        console.log("Driver created for " + globals.browser + " using selenium grid at " + globals.webDriverUrl)
        console.log("Application under test is " + globals.appRoute)
        driver.setFileDetector(new remote.FileDetector());

        // For local
        // driver = new webdriver.Builder().forBrowser(globals.browser).build();

        // Enable ouia IDs
        driver.executeScript(function () {
            localStorage.setItem("ouia", "true");
        });

        base = new basePage(driver)
        eula = new eulaPage(driver)
        login = new loginPage(driver)
        profile = new profilePage(driver)
        covidVaxPage = new CovidVaccinationPage(driver)
        covidTestPage = new CovidTestPage(driver)
        createDates = new createDatesClass()
        createLots = new createLotsClass()
        thankyou = new thankYouPage(driver)
        attestMenu = new attestMenuPage(driver)
        hrDashboardPage = new HRDashboardPage(driver)
        settingsPage = new SettingsPage(driver);
        vaccinationDates = createDates.randomVaccineDates()
        testDate = createDates.randomTestDate()
        recoveryDate = createDates.randomTestDate()
        lotNumbers = createLots.randomVaccineLots()
        dateShotOne = vaccinationDates[0].toString()
        dateShotTwo = vaccinationDates[1].toString()
        lotShotOne = lotNumbers[0].toString()
        lotShotTwo = lotNumbers[1].toString()
        unprivDob = createDates.randomDob().toString()
        privDob = createDates.randomDob().toString()
        testSetting = "dateOfBirth";
        testUseGs = false;
    })

    // For local
    // beforeEach(async function() {
    //     const png = await driver.takeScreenshot();
    //     allure.createAttachment("Screenshot", Buffer.from(png, "base64"), "image/png");
    //     });

    // For local
    // afterEach(async function() {
    //     const png = await driver.takeScreenshot();
    //     allure.createAttachment("Screenshot", Buffer.from(png, "base64"), "image/png");
    //     });

    after(async function () {
        await driver.quit()
    })

    it('Launch application', async function () {

        console.log("Launch application");
        await driver.sleep(500);
        await driver.get(globals.appRoute)
    });
    it('Accept Privacy Policy', async function () {
        console.log("Accept Privacy Policy");
        await driver.sleep(500);
        await eula.clickEluaAcceptButton()
    });
    it('Login as an Unprivileged user', async function () {
        console.log("Login as Unprivileged user");
        await driver.sleep(2000);
        await login.authenticate(globals.unprivUsername, globals.unprivPassword)
    });
    it('Accept profile', async function () {
        console.log("Accept profile");
        await driver.sleep(500);
        await driver.findElement(By.css(".pf-c-form__group-control > .pf-m-primary")).click()
    });

    it('Select Vax Submission Item', async function () {
        console.log("Select \"Submit Vaccination Record\" button");
        await base.click({ css: '#submit-vax-card-menu-button > p:nth-child(2)' })
    });

    it('Fill out Vax Submission form', async function () {
        console.log("\nBegin Submit Vaccination");
        await covidVaxPage.enterVaccination(unprivDob, dateShotOne, lotShotOne, dateShotTwo, lotShotTwo, 'Other');
    });

    it('Accept Vax Form', async function () {
        await covidVaxPage.accept();
    });

    it('Review and Submit Vax Form', async function () {
        await driver.takeScreenshot().then(
            function (image) {
                require('fs').writeFileSync('uat-reports/screenshot-vax.png', image, 'base64');
            }
        );
        await covidVaxPage.submit();
        console.log("End Submit Vaccination");
    });

    it('Select Test Result Submission Item', async function () {
        await base.visit("/attestmenu");
        await driver.sleep(2500);
        await base.click({ css: "#submit-vax-test-menu-button" });
    });

    it('Fill out Test Submission form', async function () {
        console.log("\nBegin Submit Positive Test");
        await covidTestPage.enterPositiveTest(unprivDob, testDate);
    });

    it('Accept Test Form', async function () {
        await covidTestPage.accept();
    });

    it('Review and Submit Test Form', async function () {
        await driver.takeScreenshot().then(
            function (image) {
                require('fs').writeFileSync('uat-reports/screenshot-test.png', image, 'base64');
            }
        );
        await covidTestPage.submit();
        console.log("End Submit Positive Test");
    });

    it('Select Certificate of Recovery Submission Item', async function () {
        await base.visit("/attestmenu");
        await driver.sleep(2500);
        await base.click({ css: "#submit-vax-test-menu-button" });
    });

    it('Fill out Certificate of Recovery form', async function () {
        console.log("\nBegin Submit Certificate of Recovery");
        await covidTestPage.enterCertificateOfRecovery(unprivDob, recoveryDate);
    });

    it('Accept Certificate of Recovery Form', async function () {
        await covidTestPage.accept();
    });

    it('Review and Submit Certificate of Recovery Form', async function () {
        await driver.takeScreenshot().then(
            function (image) {
                require('fs').writeFileSync('uat-reports/screenshot-recovery.png', image, 'base64');
            }
        );

        await covidTestPage.submit();
        console.log("End Submit Certificate of Recovery");
    });

    it('Logout Unprivileged User', async function () {
        console.log("\nLogout user");
        await driver.sleep(2500);
        await thankyou.selectLogoutExitButton();
    });

    console.log("Log back in as user with HR Approver role");
    it('Accept Privacy Policy again', async function () {
        console.log("Accept Privacy Policy");
        await eula.clickEluaAcceptButton();
    });

    it('Login as User with HR Approver role', async function () {
        console.log("Authenticate HR Approver");
        await login.authenticate(globals.privUsername, globals.privPassword)
    });

    it('Accept profile', async function () {
        console.log("Accept profile");
        await driver.findElement(By.css(".pf-c-form__group-control > .pf-m-primary")).click()
    });

    it('Select HR Dashboard Item', async function () {
        console.log("Select HR Dashboard Item");
        await attestMenu.selectHrDashboard()
    });

    it('Click through new tasks and move matching to In Progress', async function () {
        console.log("\nBegin Accept Vaccination Submission");
        await hrDashboardPage.findAndClaimTask(4200000, dateShotTwo, 1);
    });

    it('Find review task based on 2nd shot date and Accept attestation', async function () {
        await hrDashboardPage.approveClaimedTask(4200000, dateShotTwo, 1);
        console.log("End Accept Vaccination Submission");
    });

    it('Find and confirm positive test submission', async function () {
        console.log("\nBegin HR Confirm Positive Test");
        const positiveTest = await hrDashboardPage.findPositiveTest(4200000, testDate);
        assert(positiveTest, "No positive test for user 4200000 and test date " + testDate + " was found.");

        await hrDashboardPage.confirmPriorityItem(positiveTest);
        assert(await hrDashboardPage.findPositiveTest(4200000, testDate) == null, "Positive test for user 4200000 and test date " + testDate + " is still displayed in the Priority Inbox.");
        console.log("End HR Confirm Positive Test");
    });

    it('Find and confirm certificate of recovery submission', async function () {
        console.log("\nBegin HR Confirm Certificate of Recovery");
        const cor = await hrDashboardPage.findCertificateOfRecovery(4200000, recoveryDate);
        assert(cor, "No certificate of recovery for user 4200000 and test date " + recoveryDate + " was found.");

        await hrDashboardPage.confirmPriorityItem(cor);
        assert(await hrDashboardPage.findCertificateOfRecovery(4200000, recoveryDate) == null, "Certificate of recovery for user 4200000 and test date " + recoveryDate + " is still displayed in the Priority Inbox.");
        console.log("End HR Confirm Certificate of Recovery");
    });

    it('Select Settings item', async function () {
        await base.visit("/attestmenu");
        await driver.sleep(2500);
        await base.click({ css: "#settings-button" });
    });

    it('Change a setting', async function () {
        console.log("\nBegin Change Date of Birth Setting");
        testUseGs = settingsPage.changeSetting(testSetting);
        console.log("End Change Date of Birth Setting");
    });

    it('Test a setting', async function () {
        console.log("\nBegin Check Date of Birth Setting");
        await base.visit("/attestmenu");
        await driver.sleep(2500);
        await base.click({ css: '#submit-vax-card-menu-button > p:nth-child(2)' });
        covidVaxPage.checkDateOfBirth(false);
        console.log("End Check Date of Birth Setting");
    });

    it('Select Settings item', async function () {
        await base.visit("/attestmenu");
        await driver.sleep(2500);
        await base.click({ css: "#settings-button" });
    });

    it('Reset a setting', async function () {
        console.log("\nBegin Reset Date of Birth Setting");
        settingsPage.resetSetting(testSetting, testUseGs);
        console.log("End Reset Date of Birth Setting");
    });

    it('Logout HR Approver', async function () {
        console.log("\nLogout HR Approver");
        await base.logout();
    });
})
