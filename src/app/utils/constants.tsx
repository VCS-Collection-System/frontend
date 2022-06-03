declare global {  
  interface Window {
    REACT_APP_PAM_URL_BASE: string;
    REACT_APP_PAM_CONTAINER_ID: string;
    REACT_APP_KEYCLOAK_COUNTRY: string;
    REACT_APP_KEYCLOAK_EMAIL: string;
    REACT_APP_KEYCLOAK_FIRST_NAME: string;
    REACT_APP_KEYCLOAK_ID: string;
    REACT_APP_KEYCLOAK_LAST_NAME: string;
    REACT_APP_MAINTENANCE_BANNER: boolean;
    REACT_APP_MAINTENANCE_BANNER_TEXT: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    REACT_APP_FEATURE_FLAGS: Array<Record<string, any>>;
    REACT_APP_MAX_DOSES: Record<string, number>;
    REACT_APP_CONSENT_LABEL: string;
    REACT_APP_ALTERNATE_CONSENT_LABEL: string;
    REACT_APP_BLOCKED_COUNTRIES: Array<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    REACT_APP_GLOBAL_CONFIG: Record<string, any>;
  }
}

// PAM urls
export const PAM_BASE_URL = window.REACT_APP_PAM_URL_BASE; 
export const SUBMIT_VAX_URL = PAM_BASE_URL + '/attestation/vax';
export const SUBMIT_TEST_URL = PAM_BASE_URL + '/attestation/covid-test-result';
export const PAM_TASK_URL = PAM_BASE_URL + '/tasks/';
export const RESERVED_TASK_URL = PAM_TASK_URL + 'owners?status=Reserved&user=';
export const INPROGRESS_TASK_URL = PAM_TASK_URL + 'owners?status=InProgress&user=';
export const ALL_TASK_URL = PAM_TASK_URL + 'owners?status=Ready&pageSize=200';
export const PRIORITY_URL = PAM_BASE_URL + '/query/priority-results';
export const PRIORITY_CONFIRM_URL = PAM_BASE_URL + '/query/priority-result/';
export const ATTACHMENT_URL = PAM_BASE_URL + '/attestation/attachment';
export const EMPLOYEE_URL = PAM_BASE_URL + '/query/employee/';
export const EMPLOYEE_NAME_URL = PAM_BASE_URL + '/query/employee-name/';
export const EMPLOYEE_VAX_HISTORY_URL = PAM_BASE_URL + '/query/vax-document/';
export const EMPLOYEE_TEST_HISTORY_URL = PAM_BASE_URL + '/query/test-result-document/';
export const VAX_TASK_DOCUMENT_URL = PAM_BASE_URL + '/query/task/document/';
export const DELETE_VAX_URL = PAM_BASE_URL + '/attestation/delete-vax-record/';
export const CONFIG_URL = PAM_BASE_URL + '/query/country-configs/';
export const SAVE_CONFIG_URL = PAM_BASE_URL + '/attestation/country-configs';

// List of countries allow to use this app
export const BLOCKED_COUNTRIES = window.REACT_APP_BLOCKED_COUNTRIES || []

export const KONAMI_CODE = [ "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];

// Maintenance Banner
export const MAINTENANCE_BANNER = window.REACT_APP_MAINTENANCE_BANNER || false
export const MAINTENANCE_BANNER_TEXT = window.REACT_APP_MAINTENANCE_BANNER_TEXT || ""

// Keycloak claims
export const KEYCLOAK_COUNTRY = window.REACT_APP_KEYCLOAK_COUNTRY
export const KEYCLOAK_EMAIL = window.REACT_APP_KEYCLOAK_EMAIL
export const KEYCLOAK_FIRST_NAME = window.REACT_APP_KEYCLOAK_FIRST_NAME
export const KEYCLOAK_ID = window.REACT_APP_KEYCLOAK_ID
export const KEYCLOAK_LAST_NAME = window.REACT_APP_KEYCLOAK_LAST_NAME
export const FEATURE_FLAGS = window.REACT_APP_FEATURE_FLAGS || []

// Maximum doses allowed by vaccine manufacturer
export const MAX_DOSES = window.REACT_APP_MAX_DOSES || {}

export const CONSENT_LABEL = window.REACT_APP_CONSENT_LABEL
export const ALTERNATE_CONSENT_LABEL = window.REACT_APP_ALTERNATE_CONSENT_LABEL

// Global country config
export const GLOBAL_CONFIG = window.REACT_APP_GLOBAL_CONFIG || {};

