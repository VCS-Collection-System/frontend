const basePage = require('./basePage')

const SAVE_BUTTON = {css: '.pf-c-form__group-control > .pf-m-primary'}
const SUCCESS_MODAL = {css: 'pf-c-modal-box pf-m-sm'}

class SettingsPage extends basePage {
  constructor(driver) {
      super(driver)
  }

  async changeSetting(settingName) {
    console.log(". Changing " + settingName + " setting...");
    const settingSwitch = await this.find(By.css("input#" + settingName + "-switch"));

    let useGs = false;
    if(!settingSwitch.isEnabled()) {
      useGs = true;
      // disable global standard
      await this.click(By.css("input#" + settingName + "-gs"));
    }

    await settingSwitch.click();

    await this.click(SAVE_BUTTON);
    console.log(". Saving setting...");

    await this.driver.sleep(5000);
    assert.equal(await this.isDisplayed(SUCCESS_MODAL));
    console.log(". Setting saved...");

    return useGs;
  }

  async resetSetting(settingName, useGs) {
    console.log(". Resetting " + settingName + " setting...");
    
    if(useGs) {
      // enable global standard
      await this.click(By.css("input#" + settingName + "-gs"));
    } else {
      await this.click(By.css("input#" + settingName + "-switch"));
    }

    await this.click(SAVE_BUTTON);
    console.log(". Saving setting...");

    await this.driver.sleep(5000);
    assert.equal(await this.isDisplayed(SUCCESS_MODAL));
    console.log(". Setting saved...");
  }
}

module.exports = SettingsPage;