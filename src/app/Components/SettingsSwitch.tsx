import React, {useEffect, useState} from 'react';
import { Controller } from "react-hook-form";
import { Checkbox, FormGroup, Switch, Text } from '@patternfly/react-core';
import { useKeycloak } from '@react-keycloak/web';
import { showFeature } from './Feature';

const SettingsSwitch = (props) => {
  const keycloak = useKeycloak();
  const [defaultValue, setDefaultValue] = useState(false);
  const [usesDefault, setUsesDefault] = useState(true);

  const setToDefault = () => {
    if(usesDefault) {
      props.form.setValue(props.name, defaultValue);
      onChangeSwitch(defaultValue);
    }
  }

  const onChangeGs = (value) => {
    if(value == usesDefault) {
      // state can be out of sync after changing countries because setValues() doesn't trigger onchange
      setToDefault();
      const switchElement = document.getElementById(props.name + "-switch") as HTMLFormElement;
      if(switchElement) {
        switchElement.disabled = usesDefault;
      }
    } else {
      setUsesDefault(value);
    }
  }

  const onChangeSwitch = (value) => {
    props.onChange && props.onChange(value);
  }

  const getOffStyles = () => {
    const fieldValue = props.form.getValues(props.name);
    const isChecked = props.invert ? !fieldValue : fieldValue;
    const color = (usesDefault || isChecked ? "#6a6e73" : "#151515");
    const fontWeight = (isChecked ? "normal" : "bold");
    return {color, fontWeight} as const;
  }

  const getGSLabel = (value) => {
    const gsValue = props.invert ? !defaultValue : defaultValue;
    const gsText = gsValue ? "On" : "Off";
    return (
      <>
        <Text style={{display: "inline-block"}}>Use Global Standard</Text>
        <Text style={{display: "inline-block", opacity: ".5", marginLeft: ".5rem"}} data-testid={props.name + "-gs-value"}>
          {(value ? "" : "(" + gsText + ")")}
        </Text>
      </>
    );
  }

  useEffect(() => {
    setToDefault();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usesDefault]);

  useEffect(() => {
    showFeature(props.name, keycloak, "default").then(config => {
      setDefaultValue(config);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Controller
        name={props.name + "-gs"} 
        control={props.form.control}
        defaultValue={true}
        render={({ field }) => (
          <FormGroup 
            fieldId={props.name + "-gs"}
            label={(
              <>
                <Text style={{display: "inline-block"}}>{props.label}</Text>
                <Text style={{display: "inline-block", marginLeft: "1rem", color: "red"}}>{props.hide ? "N/A" : ""}</Text>
              </>
            )}
            style={{
              marginTop: "1.5rem",
              display: (props.form.getValues("country") === "default" ? "none": ""),
              opacity: (props.hide ? ".25" : "1")
            }}
          >
            <Checkbox
              label={getGSLabel(field.value)}
              aria-label={props.name + "-gs"}
              id={props.name + "-gs"} 
              isChecked={field.value}
              isDisabled={props.hide}
              onChange={(value) => {
                field.onChange(value);
                onChangeGs(value);
              }}
            />
          </FormGroup>
        )}
      />
      <Controller
        name={props.name}
        control={props.form.control}
        defaultValue={false}
        render={({ field }) => (
          <FormGroup
            fieldId={props.name + "-switch"}
            label={props.form.getValues("country") === "default" ? (
              <>
                <Text>{props.label}</Text>
                <Text style={{marginLeft: "1rem", color: "red"}}>{props.hide ? "N/A" : ""}</Text>
              </>
            ) : null}
            style={{marginTop: ".75rem", opacity: (props.hide ? ".25": "1")}}
          >
            <Text
              style={{
                display: "inline-block",
                marginRight: "1rem",
                ...getOffStyles()
              }}
              data-testid={props.name + "-off-label"}>
              Off
            </Text>
            <Switch
              aria-label={props.name + "-switch"}
              label={<Text style={{fontWeight: "bold", display: "inline-block"}}>On</Text>}
              labelOff={<Text style={{display: "inline-block"}}>On</Text>}
              isChecked={props.invert ? !field.value : field.value}
              onChange={(value) => {
                field.onChange(props.invert ? !value : value);
                onChangeSwitch(value);
              }}
              id={props.name + "-switch"}
              isDisabled={usesDefault || props.hide}
              style={{display: "inline-block"}}
            />
          </FormGroup>
        )}
      />
    </>
  )
}

export default SettingsSwitch;