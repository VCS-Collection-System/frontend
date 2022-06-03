# Contributing guide

Contribution guidelines are currently a work-in-progress. Developer documentation can be found below.

## Reporting an issue

@TODO

## Before you contribute

@TODO

### Code reviews

@TODO

### Coding guidelines

@TODO

### Continuous Integration

@TODO

#### Environment Definitions

All relevant application-specific environment configurations (e.g. URLs, namespaces, etc.) are outlined here: <https://docs.jboss.org/display/RHVCS/Environments>.

### Tests and Documentation

@TODO

## Setup

@TODO

### Prep your workspace

Note: You must be on VPN to connect to hosted services

You can run the following commands to get your system ready for development:

```sh
# Clone the git repository
git clone https://github.com/VCS-Collection-System/frontend.git

# Go to the git repository directory
cd vcs-frontend

# Create a directory named public if it doesn't already exist
mkdir public 
```

### Local config files needed for local development

The values in the config.js and the keycloak.json correspond to the yaml in the vcs-frontend-config repo. You will likely update these files (specifically the config.js file) when you are turning features on/off for specific regions. Your local config files should not be checked into vcs-frontend.

#### Create keycloak.json

Running the following will populatate your keycloak.json file:

```sh
cat << EOF > keycloak/keycloak.json
{
  "auth-server-url": "https://auth.test.vcs.example.com/auth",
  "realm": "rhvcs-devtest",
  "resource": "rhvcs-frontend-devtest"
}
EOF
```

#### Create config.js

Running the following will populate your config.js file:
@TODO: Move to external example file

```sh
cat << EOF > public/config.js
window.REACT_APP_PAM_URL_BASE="https://api.example.com"
window.REACT_APP_PAM_USER=""
window.REACT_APP_PAM_PASSWORD=""
window.REACT_APP_KEYCLOAK_COUNTRY="attributes.agency[0]"
window.REACT_APP_KEYCLOAK_EMAIL="email"
window.REACT_APP_KEYCLOAK_FIRST_NAME="firstName"
window.REACT_APP_KEYCLOAK_GEO="Geo"
window.REACT_APP_KEYCLOAK_ID="attributes.workforceid[0]"
window.REACT_APP_KEYCLOAK_LAST_NAME="lastName"
window.REACT_APP_KEYCLOAK_TITLE="JobTitle"
window.REACT_APP_KEYCLOAK_TYPE="PersonType"
window.REACT_APP_FEATURE_FLAGS=[{see below}]
window.REACT_APP_MAX_DOSES={"AstraZeneca":2,"Comirnaty":2,"Covaxin":2,"Covishield":2,"Covovax":2,"Janssen":1,"Johnson":1,"Moderna":2,"Novavax":2,"Oxford":2,"Pfizer":2,"Sinopharm":2,"Sinovac_Coronavac":2,"Spikevax":2,"Sputnik":2,"Vaxzevria":2}
window.REACT_APP_ALTERNATE_CONSENT_LABEL="By checking this box, I agree that I am voluntarily providing my COVID-19 3G status (vaccinated/recovered/tested) to [COMPANY], and I agree that [COMPANY] may collect, process, and record my COVID-19 3G status, including the submission and validity dates, for the purposes and as described in [COMPANY]'s COVID-19 and VCS Privacy Notice (e.g., for protection of health and safety, resource and team planning, and complying with legal requirements), which includes further information about the processing of my personal data (including the retention and recipients of my personal data) and my rights as outlined in [COMPANY]'s Employee Personal Information Privacy Statement."
window.REACT_APP_CONSENT_LABEL="By checking, I agree to the collection and processing of my COVID-19 related information for the purposes set forth in [COMPANY]'s COVID-19 and VCS Privacy Notice, which also includes further information about the processing of my personal data including my relevant rights as described in the referenced Employee Personal Information Privacy Statement."
window.REACT_APP_BLOCKED_COUNTRIES=[]
window.INJECTED_VIA_CONFIG_MAP="true"
window.REACT_APP_GLOBAL_CONFIG={{
    "AUS": {"dateOfBirth": true, "proof": false, "proofType": {"divoc": false}, "recovery": false},
    "AUT": {"consentCheckboxAlternate": true, "covidTest": true, "proofType": {"divoc": false}},
    "CAN": {"proofOptional": true, "recovery": false},
    "CZE": {"proofOptional": true, "covidTest": true},
    "DEU": {"consentCheckboxAlternate": true, "covidTest": true, "proof": false, "proofType": {"divoc": false}},
    "ESP": {"proofOptional": true},
    "GBR": {"recovery": false},
    "HUN": {"proofOptional": true},
    "IDN": {"recovery": false},
    "IND": {"dateOfBirth": true, "recovery": false},
    "IRL": {"proofOptional": true, "recovery": false},
    "ISR": {"recovery": false},
    "ITA": {"proofOptional": true, "proofType": {"greenPass": true, "divoc": false}},
    "MYS": {"recovery": false},
    "NOR": {"recovery": false},
    "NZL": {"proofOptional": true, "recovery": false},
    "PER": {"consentCheckbox": false},
    "SAU": {"recovery": false},
    "SGP": {"consentCheckbox": false, "dateOfBirth": true, "proofType": {"divoc": false}, "recovery": false},
    "SVK": {"proofOptional": true},
    "TWN": {"proofOptional": true},
    "USA": {"consentCheckbox": false, "dateOfBirth": true, "proofType": {"cdcvax": true, "divoc": false}, "recovery": false},
    "UAT": {"allowPdf": true, "dateOfBirth": true, "consentCheckbox": false, "consentCheckboxAlternate": false, "covidTest": true, "customInput": true, "hrdashboard": true, "hrsearch": true, "proofType": {"cdcvax": true, "divoc": true, "greenPass": true}, "recovery": true},
    "default": {"allowPdf": false, "dateOfBirth": false, "consentCheckbox": true, "consentCheckboxAlternate": false, "covidTest": false, "customInput": true, "hrdashboard": true, "hrsearch": true, "proof": true, "proofOptional": false, "proofType": {"cdcvax": false, "divoc": true, "greenPass": false}, "recovery": true}
}
EOF
```

## Feature Flags

Feature flags (the term is currently used loosely) are being utilized by the frontend to control if certain _features_ should be rendered in the application.

The flag definitions when used locally are set in config.js and are overridden by the various environment-specific configurations

### How to use Feature Flags

The Feature Flag mechanism is represented by an array of feature flag objects, where each object represents a specific feature.

To use any of the features, simply add the corresponding feature flag object into the window.REACT_APP_FEATURE_FLAGS in public/config.js

The structure of a feature flag object is as follows:

```sh
window.REACT_APP_FEATURE_FLAGS=[
  { 
    "name": "featureName", // Required. Name of the feature
    "active": true | false, // Required. Turns on or off the feature flag. Must be either true or false
  }
]
```

### Selectively Turning Features ON/OFF

Use the following table as a guide for correctly setting the scope of your Feature Flag:

| featureFlag "active"<sup>1</sup> | globalConfig[{userCountry}] | globalConfig[default] | scope |
|----|----|----|----|
| true | true | true | turned on for all countries |
| true | true | true | turned on for user country but off for others |
| true | false | true | turned off for user country but on for others |
| true | false | false | turned off for all countries |
| false | any | any | turned off for all countries |

1. Add the feature flag to the `featureFlag` object and set the "active" value accordingly.
2. Add ('true') or omit ('false') to the `globalConfig.default` object in the format `{"featureName", true/false}`.
3. (If different than default value above) Add ('true') or omit ('false') to the `globalConfig.{userCountry}` object in the format `{"featureName", true/false}`.

### Global Config

The REACT_APP_GLOBAL_CONFIG property allows for configuration of application components on a country-by-country basis, since specific application requirements can differ based on which country the user is located in. It is represented by an object of country keys and their associated config values. The final "country" in the configuration is the default configuration which represents default config for any country/property not explicitly defined elsewhere in the GLOBAL_CONFIG property.

### List of currently available Feature Flags

To use any of these features, add it to window.REACT_APP_FEATURE_FLAGS in public/config.js:

#### allowPdf

When true, this property allows PDF files to be submitted as vaccine documentation proof.

#### consentCheckbox

When true, this property displays the consent disclaimer checkbox on the vaccine form.

#### consentCheckboxAlternate

When true, this property displays the alternate consent disclaimer checkbox on the vaccine form (defined by `window.REACT_APP_ALTERNATE_CONSENT_LABEL`).

#### covidTest

When true, this property enables the COVID test form.

#### dateOfBirth

When true, this property displays the Date of Birth field on vaccine and test/recovery forms.

#### hrdashboard

When true, this property enables the HR Dashboard.

#### hrsearch 

When true, this property enables an HR user to search for a user by user ID on the HR Dashboard.

#### proof

When true, this property displays the Proof Type dropdown and Proof Image Upload fields on the vaccine form.

#### proofOptional

When true, this property makes the Proof Type dropdown and Proof Image fields optional on the vaccine form.
This property is not applicable when the `proof` property is `false`.

#### proofType

This property expects an object of proof type keys, either enabled (true) or disabled (false). Available proof types are:

`cdc` (CDC Vaccination Card)
`divoc` (Digital Certificate of Vaccination)
`greenPass` (Green Pass)

Proof type "Other" is always available for all countries.

#### recovery

This feature exposes the capability to submit Certificates of Recovery.

```json
{ 
  "name": "recovery",
  "active": true
}
```

### Country Codes

To find the appropriate country code to use in config.js, see <https://spaces.redhat.com/display/RHVCS/Test+Users>

## Build

Run the following commands to perform various build activities:

```sh
# Install development/build dependencies
npm install

# Start the development server
# This will open a browser window to `localhost:9000`
# It is highly recommended to open an incognito window and navigate to `localhost:9000` instead of using the default window session
npm run start:dev

# Run a production build (outputs to "dist" dir; rarely performed locally)
npm run build
```

## Test

To run various tests, choose from the commands below:

```sh
# Run the full test suite including unit tests, linting, etc. (always a good idea before making commits)
npm run test

# Run a specific test
npm run test -- -t 'SPECIFIC_TEST_NAME'

Example: `npm run test -- -t '<EmployeeInfoCard />'

# Run the test suite with coverage
npm run test:coverage

# Run the linter
npm run lint

# Run the code formatter
npm run format

# Launch a tool to inspect the bundle size
npm run bundle-profile:analyze

# Start the express server (run a production build first)
npm run start
```

### Git + Husky

To prevent accidental pushes of untested code, the team has added a Husky pre-push hook that ensures that all unit tests first pass before completing the `git push` action.

There might be times when this functionality needs to be quickly overcome. Simply run `git push --no-verify` and your code will not be checked via the pre-push hook.

### Local Area Network Testing (not used often)

> :warning: **Ask yourself if this is really necessary**: You might be able to achieve the same level of testing using your browser's Device Emulation feature in Developer Tools.

If you would like to view the application on another device on your network (e.g. mobile device testing), you will need to do a few things:

#### Allow External/Other Hosts

Update the `HOST` variable in `webpack.dev.js` from `localhost` to `0.0.0.0`

#### Open Firewall Port

Open the firewall port the application is served on...

```sh

sudo systemctl start firewalld

export PORT=9000

sudo firewall-cmd --zone=public --add-port=${PORT}/tcp

```

#### Configure Keycloak

Ensure that the Keycloak instance is configured to receive requests from your deployment URL. In the past this was `localhost`, but is likely now `${YOUR_IP}`. The *easiest* way to do this is to change the setting in Keycloak to allow from all origins (`*`). However, this is inherently insecure. A better approach is to have your IP or domain added explicitly. This may be difficult/impossible to do if you do not manage the Keycloak instance, in which case you're out of luck.

### UI Testing Framework

#### Quick Start

```sh
git clone <repo>
cd vcs-frontend
./test_resources/prep_test_env.sh
./test_resources/run_tests.sh
```

#### Technology Overview

- Selenium - Browser based UI test automation
- Mocha - JavaScript test framework running on Node.js
- Allure - Test output visualization. Jenkins plugin available to get the reports directly in Jenkins attached to the builds.

#### Configuration of Environment Variables

Environment Variables that are required:

- `APP_ROUTE` : `Application Under Test Base Url`
- `WEB_DRIVER_URL` : `Selenium Grid URL`
- `BROWSER` : `chrome` or `firefox`
- `USER1` : `Non-privileged username`
- `USER1_PASS` : `USER1 password`
- `USER2` : `Username with HR Approver role`
- `USER2_PASS` : `USER2 password`

For example, if running locally you should set these in the terminal window where the test command will be executed via `export APP_ROUTE=my.vcs.deployment.com`

#### Manually Invoke Tests

Invoke tests via Mocha. Tests are discovered in `./test`

```sh
# Execute tests
./node_modules/mocha/bin/mocha

# Execute a specific test

./node_modules/mocha/bin/mocha ./test/example.spec.js

# Execute tests and generate allure report data

./node_modules/mocha/bin/mocha --reporter mocha-allure-reporter

```

#### Test Creation

##### Overview

Leverage the Selenium IDE browser extension as a base for you tests. This can be downloaded [selenium ide](https://www.selenium.dev/selenium-ide/). This tool will allow you to record test scripts and export them in a variety of languages.

In order to create a test:

1. Record a script with your desired test case.
2. Right click on the name of the test and select "export". For this project export as `JavaScript - Mocha`.
3. Save your file to the `./test` directory
4. Run the `./test_resources/fix_export.sh` script against the exported file
5. Set the environment variables for user logins.

```sh
export USER1="<user1>"
export USER1_PASS="<user1pass>"

export USER2="<user2>"
export USER2_PASS="<user2pass>"
```

`USER1` will be used to submit a new vaccine document while`USER2` will search for this new submission and approve it via the HR Dashboard.  At a minimum `USER2` will need to have the ability to access the HR Dashboard for the successful completion of selenium test.

##### Run Against a Local Selenium Driver

By default the tests will run against the `WEB_DRIVER_URL`. In order to execute the tests on your local machine (which can be helpful for debugging purposes) you will need to do the following:

**Command line changes**

```sh
npm install chromedriver

npm install geckodriver
```

> Note: If running on a machine where managed by Corporate IT (e.g. RHEL CSB) you will need to pay attention to your pre-installed Google Chrome version. For chromedriver the version installed needs to matches the Chrome version that's already on your system. If Corporate IT manages this installation you _may_ be behind the latest version (e.g. `96`) and should take the following actions:
> - First, determine your Chrome version: Open Chrome -> Open the Three-Dot Menu -> Select Help -> Choose About Google Chrome. This will show you your Chrome version (e.g. `Version 95.0.4638.69 (Official Build) (64-bit)`).
> - Next, remove any existing chromedriver installations: `npm remove chromedriver`
> - Finally, install the chromedriver that matches the latest version of your Chrome installation: `CHROMEDRIVER_VERSION=LATEST_95 npm install chromedriver`

**Changes to .js files**

Additional libraries need to be included for local test execution. Specifically the browser drivers. For local execution you need to add either the `chromedriver` or `geckodriver` npm libraries.

```js
// For local
require("chromedriver");
```

The way the selenium web driver gets instantiated needs to change from:

```js
// For Selenium Grid
driver = new Builder().forBrowser(globals.browser).usingServer(globals.webDriverUrl).build()
driver.setFileDetector(new remote.FileDetector());
```

To:

```js
// For local
driver = new webdriver.Builder().forBrowser(globals.browser).build();
```

> _NOTE:_
In the future it would be nice to figure out a way to have these implementations switched via an environment variable

#### Allure Reports

The output of running the Mocha tests is a raw data file for Allure. From this output you can then generate the reports.

##### Adding Allure Test and Steps to use case

The export will put all test steps into a single test case. To provide more granular reporting we want to break these up into multiple test cases.

- `describe` function should wrap entire test case
- `it` function should label each step

See `./test/e2e.spec.js`

##### Manually Invoke Allure Reports

When you run the mocha tests with the `--reporter mocha-allure-reporter` parameter you will end up with the allure report data in a raw format. To generate the report dashboard from this data you can run the following:

```sh
# Use Allure CLI to generate the usable Reports which are saved to ./allure-report

./node_modules/allure-commandline/bin/allure generate allure-results --clean -o allure-report
```

To start a node server locally to view the reports you can run:

```sh
# Spins up a node server to host the generated report, and opens your default browser to it. 

./node_modules/allure-commandline/bin/allure open
```

## Documentation

@TODO

## Frequently Asked Questions (FAQs)

@TODO

### How do I get access to the RH internal Keycloak instance?

If you need an account to access the internal Keycloak instance, reach out to @HunterGerlach. He can help get you a Keycloak account created for use during development.
