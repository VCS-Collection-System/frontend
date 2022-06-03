import React, { ReactElement, useEffect, useState } from 'react';
import { useKeycloak } from "@react-keycloak/web";
import { getEmployeeInfo } from "@app/utils/getEmployeeInfo";
import authaxios from "@app/utils/axiosInterceptor";
import { CONFIG_URL, FEATURE_FLAGS, GLOBAL_CONFIG } from "@app/utils/constants";

interface FeatureProps {
  name: string;
  employeeCountry?: string;
  renderOff?: () => ReactElement;
  children?: React.ReactNode
}

const getFeatureFlag = (name) => {
  const feature = FEATURE_FLAGS.find(featureFlag => featureFlag.name === name);
  return feature ? feature : {}; 
}

const isFeatureFlag = (name) => {
  return FEATURE_FLAGS.find(featureFlag => featureFlag.name === name);
}

const getConfig = async (country) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let defaultConfig: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let countryConfig: any = null;
  const sessionDefault = sessionStorage.getItem("globalconfig-default");
  const sessionCountry = sessionStorage.getItem("globalconfig-" + country);

  if(sessionDefault && sessionDefault !== "") {
    defaultConfig = JSON.parse(sessionDefault);
  } else {
    try {
      await authaxios.get(CONFIG_URL + "default").then(config => {
        defaultConfig = config.data;
        sessionStorage.setItem("globalconfig-default", JSON.stringify(config.data));
      });
    } catch {
      defaultConfig = GLOBAL_CONFIG["default"];
    }
  }

  if(sessionCountry && sessionCountry !== "") {
    countryConfig = JSON.parse(sessionCountry);
  } else {
    try {
      // all db gets/persists must use lowercase country
      await authaxios.get(CONFIG_URL + country.toLowerCase()).then(config => {
        countryConfig = config.data;
        sessionStorage.setItem("globalconfig-" + country, JSON.stringify(config.data));
      });
    } catch {
      countryConfig = defaultConfig;
    }
  }

  return [defaultConfig, countryConfig];
}

const showForCountry = async (name, keycloak, employeeCountry) => {
  let userCountry = "default";
  if(keycloak.profile) {
    // get user country if logged in
    const employee = getEmployeeInfo(keycloak);
    if(employeeCountry && employeeCountry !== "" && employee && employee.isApprover) {
      userCountry = employeeCountry;
    } else if(employee && employee.country) {
      userCountry = employee.country;
    }
  }

  const [defaultConfig, countryConfig] = await getConfig(userCountry);

  // get default config for feature
  let featureConfig = false;
  if(defaultConfig[name] != null) {
    featureConfig = defaultConfig[name];
  } else {
    // if not defined in default config, return false
    return featureConfig;
  }

  // get country specific config
  if(countryConfig && countryConfig[name] != null) {
    // use country-specific feature override
    featureConfig = countryConfig[name];
  }

  return featureConfig;
}

const Feature = ({name, employeeCountry, renderOff, children}: FeatureProps) => {
  const { keycloak } = useKeycloak();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showFeature(name, keycloak, employeeCountry).then(show => {
      setVisible(show);
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if(visible) {
    return (<>{children}</>)
  } else {
    return (renderOff ? renderOff() : null);
  }
}; 

export const showFeature = async (name, keycloak, employeeCountry = "") => {
  const show = await showForCountry(name, keycloak, employeeCountry);
  return (isFeatureFlag(name) ? getFeatureFlag(name).active && show : show);
}

export default Feature;
