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
const { By, Builder } = require("selenium-webdriver");
const webdriver = require("selenium-webdriver");
var remote = require('selenium-webdriver/remote');
const { Options } = require("selenium-webdriver/chrome")
const { ChromecastIcon } = require("@patternfly/react-icons")

// For local
// require("chromedriver");
// const AllureReporter = require("mocha-allure-reporter")
describe('End to End - Featureless Test', function () {
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
    let privDob

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
        vaccinationDates = createDates.randomVaccineDates()
        testDate = createDates.randomTestDate()
        recoveryDate = createDates.randomTestDate()
        lotNumbers = createLots.randomVaccineLots()
        dateShotOne = vaccinationDates[0].toString()
        dateShotTwo = vaccinationDates[1].toString()
        lotShotOne = lotNumbers[0].toString()
        lotShotTwo = lotNumbers[1].toString()
        privDob = createDates.randomDob().toString()
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
        await login.authenticate(globals.xatUsername, globals.xatPassword)
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
        await covidVaxPage.enterVaccination(null, dateShotOne, lotShotOne, dateShotTwo, lotShotTwo, null);
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
        await login.authenticate(globals.xatPrivUsername, globals.xatPrivPassword)
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
        await hrDashboardPage.findAndClaimTask(4200003, dateShotTwo, 1);
    });

    it('Find review task based on 2nd shot date and Accept attestation', async function () {
        await hrDashboardPage.approveClaimedTask(4200003, dateShotTwo, 1);
        console.log("End Accept Vaccination Submission");
    });

    it('Logout HR Approver', async function () {
        console.log("\nLogout HR Approver");
        await base.logout();
    });
})
