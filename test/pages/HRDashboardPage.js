const basePage = require('./basePage');
const InboxReviewPage = require('./InboxReviewPage');
const PriorityReviewPage = require('./PriorityReviewPage');
const assert = require('assert');
const { By } = require("selenium-webdriver");

const ALL_AVAILABLE_TASKS_XPATH = "//ul[@id='all-available-list']/li[not(.='[No Available Tasks]')";
const ALL_AVAILABLE_TASKS = { xpath: ALL_AVAILABLE_TASKS_XPATH + "]" };
const ALL_IN_PROGRESS_TASKS_XPATH = "//ul[@id='in-progress-list']/li[not(.='[No In-Progress Tasks]')";
const ALL_IN_PROGRESS_TASKS = { xpath: ALL_IN_PROGRESS_TASKS_XPATH + "]" };
const UAT_NAME = "User-UAT,Test";
const XAT_NAME = "User-XAT,Test"

const POSITIVE_TESTS = { xpath: "//ul[@id='positive-test-list']/li[not(.='[No Positive Tests]')]" };
const CERTIFICATES_OF_RECOVERY = { xpath: "//ul[@id='recovery-list']/li[not(.='[No Certificates of Recovery]')]" };

class HRDashboardPage extends basePage {

    constructor(driver) {
        super(driver)
    }

    async findAndClaimTask(userId, shotDate, shotNumber) {
        let allAvailableTasks = await this.findMultiple(ALL_AVAILABLE_TASKS);

        const taskIds = allAvailableTasks.map(async (task) => {
            const taskId = await task.getAttribute("data-id");
            const name = await task.findElement(By.css(".pf-c-menu__item-text")).getText();
            if(name === UAT_NAME || name === XAT_NAME) {
                return taskId;
            } else {
                return null;
            }
        });

        console.log(". Total available tasks: " + taskIds.length);
        console.log(". Searching all available tasks...");
        let matchingItems = 0;
        for(let i = 0; i < taskIds.length; i++) {
            const taskId = await taskIds[i];

            if(!taskId) {
                continue;
            }

            let clicked = true;
            await this.click(By.xpath(ALL_AVAILABLE_TASKS_XPATH + " and @data-id='" + taskId + "']"), () => {
                console.log(". . (Task " + taskId + " is no longer in available task list. Continuing.)");
                clicked = false;
            });
            if(!clicked) {
                continue;
            }
            await this.driver.sleep(1000);
            const inboxReview = new InboxReviewPage(this.driver);
            const dateAdministeredFieldText = await inboxReview.getDateAdministeredFieldText(shotNumber);
            if (dateAdministeredFieldText === shotDate) {
                console.log(". . Found vaccination submission for user " + userId + " and shot date " + shotDate + ".");
                console.log(". . Moving to In Progress.");
                matchingItems++;
                await this.navigateBack();
                await this.driver.sleep(500);
            } else {
                await inboxReview.back();
                await this.driver.sleep(500);
            }
        }

        console.log(". Search completed with " + matchingItems + " match(es).");
        assert.notEqual(matchingItems, 0, "No vaccination submission for user " + userId + " and shot date " + shotDate + " was found.");
        assert.equal(matchingItems, 1, "More than one vaccination submission for " + userId + " and shot date " + shotDate + " was found.");
    }

    async approveClaimedTask(userId, shotDate, shotNumber) {
        let inProgressTasks = await this.findMultiple(ALL_IN_PROGRESS_TASKS);
        const taskIds = inProgressTasks.map(async (task) => {
            const taskId = await task.getAttribute("data-id");
            return taskId;
        });
        console.log(". Total in progress tasks: " + inProgressTasks.length);
        console.log(". Searching in progress tasks...");
        let matchingItems = 0;
        for(let i = 0; i < taskIds.length; i++) {
            const taskId = await taskIds[i];
            let clicked = true;
            await this.click(By.xpath(ALL_IN_PROGRESS_TASKS_XPATH + " and @data-id='" + taskId + "']"), () => {
                console.log(". . (Task " + taskId + " is no longer in the in progress task list. Continuing.)");
                clicked = false;
            });
            if(!clicked) {
                continue;
            }
            await this.driver.sleep(1000);
            const inboxReview = new InboxReviewPage(this.driver);
            const dateAdministeredFieldText = await inboxReview.getDateAdministeredFieldText(shotNumber);
            if (dateAdministeredFieldText === shotDate) {
                console.log(". . Found vaccination submission for user " + userId + " and shot date " + shotDate + ".");
                console.log(". . Accepting.");
                matchingItems++;
                await inboxReview.accept();
                await this.driver.sleep(2500);
            } else {
                await inboxReview.back();
                await this.driver.sleep(500);
            }
        }

        console.log(". Search completed with " + matchingItems + " match(es).");
        assert.notEqual(matchingItems, 0, "No vaccination submission for user " + userId + " and shot date " + shotDate + " was found.");
        assert.equal(matchingItems, 1, "More than one vaccination submission for " + userId + " and shot date " + shotDate + " was found.");
    }

    async findPositiveTest(userId, testDate) {
        console.log("searching for test date: " + testDate)
        let positiveTests = await this.findMultiple(POSITIVE_TESTS);
        console.log("positive tests: " + positiveTests.length);
        if(positiveTests.length == 0) {
            return null;
        }
        console.log(". Total positive tests displayed in Priority Inbox: " + positiveTests.length);
        console.log(". Searching positive tests...");
        let matchingTests = 0;
        let positiveTest = null;
        for(const element of positiveTests) {
            const testUserId = await element.findElement(By.css("span.pf-c-menu__item-text")).getText();
            console.log("user id: " + testUserId);
            if(testUserId == userId) {
                const testDateText = await element.findElement(By.css("span.pf-c-menu__item-description > span")).getText();
                console.log("date: " + testDateText);
                if(testDateText === "Test Date: " + testDate) {
                    matchingTests++;
                    positiveTest = element;
                    console.log(". . Found positive test for user " + userId + " and test date " + testDate + ".");
                }
            }
        }
        console.log(". Search completed with " + matchingTests + " match(es).");

        assert(matchingTests <= 1, "More than one positive test for " + userId + " and test date " + testDate + " was found.");
        return positiveTest;
    }

    async findCertificateOfRecovery(userId, recoveryDate) {
        console.log("searching for recovery date: " + recoveryDate)
        let cors = await this.findMultiple(CERTIFICATES_OF_RECOVERY);
        if(cors.length == 0) {
            return null;
        }
        console.log(". Total certificates of recovery displayed in Priority Inbox: " + cors.length);
        console.log(". Searching certificates of recovery...");
        let matchingCors = 0;
        let cor = null;
        for(const element of cors) {
            const testUserId = await element.findElement(By.css("span.pf-c-menu__item-text")).getText();
            console.log("user id: " + testUserId);
            if(testUserId == userId) {
                const testDateText = await element.findElement(By.css("span.pf-c-menu__item-description > span")).getText();
                console.log("date: " + testDateText);
                if(testDateText === "Test Date: " + recoveryDate) {
                    matchingCors++;
                    cor = element;
                    console.log(". . Found certificate of recovery for user " + userId + " and test date " + recoveryDate + ".");
                }
            }
        }
        console.log(". Search completed with " + matchingCors + " match(es).");

        assert(matchingCors <= 1, "More than one certificate of recovery for " + userId + " and test date " + recoveryDate + " was found.");
        return cor;
    }

    async confirmPriorityItem(item) {
        await item.click();
        const priorityReview = new PriorityReviewPage(this.driver);
        console.log(". Confirming priority item.");
        await priorityReview.confirm();
    }
}

module.exports = HRDashboardPage;