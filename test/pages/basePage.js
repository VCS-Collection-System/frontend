const globals = require('../../test_resources/globals')
const Until = require('selenium-webdriver').until
const fsp = require('fs').promises

class basePage {

    constructor(driver) {
        this.driver = driver
    }

    async visit(path) {
        let url = new URL(path, globals.appRoute)
        await this.driver.get(url.href.toString())
    }

    async logout() {
        return await this.click({xpath: '//*[@id="primary-app-container"]/div/div[1]/div[2]/button[3]'});
    }

    async getCurrentUrl(path) {
        return await this.driver.getCurrentUrl()
    }

    find(locator) {
        return this.driver.findElement(locator)
    }

    findMultiple(locator) {
        return this.driver.findElements(locator)
    }

    async click(locator, catchFn = null) {
        const displayed = await this.isDisplayed(locator, 5000);
        if(displayed) {
            await this.find(locator).click()
        } else if(catchFn) {
            catchFn()
        }
    }

    async type(locator, inputText) {
        await this.isDisplayed(locator, 5000)
        await this.find(locator).sendKeys(inputText)
    }

    async getText(locator) {
        await this.isDisplayed(locator, 5000)
        let text = await this.find(locator).getAttribute('value')
        return text
    }

    async navigateBack() {
        await this.driver.navigate().back();
    }

    async isDisplayed(locator, timeout) {
        if (timeout) {
            try {
                await this.driver.wait(Until.elementLocated(locator), timeout)
                await this.driver.wait(
                    Until.elementIsVisible(this.find(locator)),
                    timeout
                )
                return true
            } catch (error) {
                return false
            }
        } else {
            try {
                return await this.find(locator).isDisplayed()
            } catch (error) {
                return false
            }
        }
    }

    async takeScreenshot(file){
        let image = await this.driver.takeScreenshot()
        await fsp.writeFile(file, image, 'base64')
    }
}

module.exports = basePage