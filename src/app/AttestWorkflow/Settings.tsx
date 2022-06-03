import React, { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useKeycloak } from '@react-keycloak/web';
import { useHistory } from "react-router-dom";
import { 
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  Select,
  SelectOption,
  SelectVariant } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';
import CardWithTitle from '@app/Components/CardWithTitle';
import { showFeature } from '@app/Components/Feature';
import SettingsSwitch from '@app/Components/SettingsSwitch';
import { getEmployeeInfo } from "@app/utils/getEmployeeInfo";
import authaxios from "@app/utils/axiosInterceptor";
import { SAVE_CONFIG_URL } from '@app/utils/constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const countries = require("../Assets/countries.json");

const options = [<SelectOption value="default" key={0}>Global Standard</SelectOption>].concat(
  countries.map((country, i) => (
    <SelectOption value={country["alpha-3"]} key={i+1}>
      {country["name"]}
    </SelectOption>
  ))
)

const Settings: React.FunctionComponent = () => {
  const history = useHistory();
  const { keycloak } = useKeycloak();
  const form = useForm();
  const [ proofEnabled, setProofEnabled ] = useState(false);
  const [ hrEnabled, setHREnabled ] = useState(false);
  const [ isSelectOpen, setIsSelectOpen ] = useState(false);
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  
  const userCountry = getEmployeeInfo(keycloak).country;
  const [ country, setCountry ] = useState(userCountry ? userCountry : "default");


  const isEnabled = async (feature) => {
    return await showFeature(feature, keycloak, form.getValues("country"));
  }

  const resetValues = () => {
    let countryConfig = sessionStorage.getItem("globalconfig-" + form.getValues("country"));
    if(countryConfig) {
      countryConfig = JSON.parse(countryConfig);
    }

    for(const field in form.getValues()) {
      if(field !== "country" && field.search("-gs") < 0) {
        isEnabled(field).then(value => {
          form.setValue(field, value);
          const switchElement = document.getElementById(field + "-switch") as HTMLFormElement;
          if(switchElement && countryConfig && countryConfig[field] != null) {
            form.setValue(field + "-gs", false);
            // manually enable because setValue doesn't trigger onChange
            switchElement.disabled = false;
          } else if(switchElement) {
            form.setValue(field + "-gs", true);
            // manually disaable because setValue doesn't trigger onChange
            switchElement.disabled = true;
          }
        });
      }
    }
  }

  useEffect(() => {
    resetValues();

    showFeature("proof", keycloak, country).then(config => {
      setProofEnabled(config);
    });

    showFeature("hrDashboard", keycloak, country).then(config => {
      setHREnabled(config);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const onSubmit = (data) => {
    const formData = new FormData();
    const configData = {};
    
    for(const field in data) {
      if(field === "country") {
        // all db gets/persists must use lowercase country
        configData["agencyName"] = data["country"].toLowerCase();
        continue;
      }

      // skip global standard checkbox fields
      if(field.indexOf("-gs") > 0) {
        continue;
      }

      if(data["country"] !== "default" && form.getValues(field + "-gs")) {
        // set to null if using global standard
        configData[field] = null;
      } else {
        configData[field] = data[field];
      }
    }

    formData.append("configuration", new Blob([JSON.stringify(configData)], { type: "application/json" }));

    authaxios.post(SAVE_CONFIG_URL, formData).then(() => {
      sessionStorage.setItem("globalconfig-" + country, JSON.stringify(configData));
      setIsModalOpen(true);
    });
  }

  return (
    <>
      <Card isRounded>
        <CardWithTitle
          title="Application Settings"
          info="Update global default or country-specific settings."
        />
        <CardBody>
          <Form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={e => {if(e.code === "Enter") e.preventDefault()}}>
            <Controller
              name="country"
              control={form.control}
              defaultValue={userCountry ? userCountry : "default"}
              render={({ field }) => (
                <FormGroup
                  fieldId="country-select"
                  label="Country"
                >
                  <Select
                    variant={SelectVariant.typeahead}
                    onToggle={isOpen => setIsSelectOpen(isOpen)}
                    onSelect={(event, value) => {
                      field.onChange(value);
                      setCountry(value);
                      setIsSelectOpen(false);
                    }}
                    onFilter={(event, value) => {
                      if (!value || value === "") {
                        return options;
                      }

                      const input = new RegExp(value, 'i');
                      return options.filter((option) => {
                        if(option.props) {
                          return input.test(option.props.value) || input.test(option.props.children);
                        }

                        return false;
                      });
                    }}
                    selections={field.value}
                    isOpen={isSelectOpen}
                    typeAheadAriaLabel="country-select"
                    style={{maxHeight: "400px", overflowY: "scroll"}}
                  >
                    {options}
                  </Select>
                </FormGroup>
              )}
            />
            <Card>
              <CardTitle>Submissions</CardTitle>
              <CardBody>
                <SettingsSwitch
                  name="consentCheckbox"
                  label="Require acknowledgment of employee consent"
                  form={form}
                />
                <SettingsSwitch
                  name="consentCheckboxAlternate"
                  label="Require acknowledgement of employee consent (alternate message)"
                  form={form}
                />
                <SettingsSwitch
                  name="dateOfBirth"
                  label="Enable collection of employee date of birth"
                  form={form}
                />
                <SettingsSwitch
                  name="covidTest"
                  label="Enable submission of COVID test results"
                  form={form}
                />
                <SettingsSwitch
                  name="recovery"
                  label="Enable submission of Certificates of Recovery"
                  form={form}
                />
              </CardBody>
            </Card>
            <Card>
              <CardTitle>Documentation</CardTitle>
              <CardBody>
                <SettingsSwitch
                  name="proof"
                  label="Enable uploading of vaccination proof"
                  onChange={(value) => {
                    setProofEnabled(value);
                  }}
                  form={form}
                />
                <SettingsSwitch
                  name="proofOptional"
                  label="Require vaccination proof"
                  invert
                  hide={!proofEnabled}
                  form={form}
                />
                <SettingsSwitch
                  name="allowPdf"
                  label="Allow PDF files as proof"
                  hide={!proofEnabled}
                  form={form}
                />
                <CardTitle style={{paddingLeft: 0, paddingTop: "3rem", paddingBottom: 0, opacity: !proofEnabled ? ".25" : "1"}}>Proof Types</CardTitle>
                <SettingsSwitch
                  name="cdc"
                  label="Allow CDC Vaccination Record"
                  hide={!proofEnabled}
                  form={form}
                />
                <SettingsSwitch
                  name="greenPass"
                  label="Allow Green Pass"
                  hide={!proofEnabled}
                  form={form}
                />
                <SettingsSwitch
                  name="divoc"
                  label="Allow DIVOC"
                  hide={!proofEnabled}
                  form={form}
                />
                <SettingsSwitch
                  name="eugc"
                  label="Allow EUGC"
                  hide={!proofEnabled}
                  form={form}
                />
              </CardBody>
            </Card>
            <Card>
              <CardTitle>HR Dashboard</CardTitle>
              <CardBody>
                <SettingsSwitch
                  name="hrDashboard"
                  label="Enable HR Dashboard"
                  onChange={(value) => {
                    setHREnabled(value);
                  }}
                  form={form}
                />
                <SettingsSwitch
                  name="hrSearch"
                  label="Enable HR Search"
                  hide={!hrEnabled}
                  form={form}
                />
              </CardBody>
            </Card>
            <FormGroup fieldId="accept buttons">
              <Button 
                icon={<CheckCircleIcon />} 
                type="submit" 
                variant="primary"
              >
                Save
              </Button>
              <Button 
                onClick={() => history.push("/attestmenu")} 
                variant="plain"
              >
                Back
              </Button>
            </FormGroup>
          </Form>
        </CardBody>
      </Card>
      <Modal
        title="Configuration Saved"
        data-testid="saved"
        variant={ModalVariant.small}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        actions={[
          <Button key="confirm" variant="primary" onClick={() => {setIsModalOpen(false)}}>
            OK
          </Button>
        ]}
      >
        Settings for {form.getValues("country")} saved successfully.
      </Modal>
    </>
  )
};

export { Settings };

