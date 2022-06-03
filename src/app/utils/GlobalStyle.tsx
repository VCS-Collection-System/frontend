import * as React from 'react';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = () => {

  const fontColor = "rgb(180, 180, 178)"; 
  const backgroundColor200 = "var(--pf-global--BackgroundColor--dark-200)";
  const backgroundColor300 = "var(--pf-global--BackgroundColor--dark-300)";
  const backgroundColor400 = "var(--pf-global--BackgroundColor--dark-400)"; 
  const borderColor200 = "var(--pf-global--BorderColor--200)"; 

  const GlobalStyles = createGlobalStyle`
    .pf-c-page__main {
      background-color: ${backgroundColor400}
    }
    .pf-c-button.pf-m-plain#span {
      color: ${fontColor};
    }
    .pf-c-title.pf-m-3xl { 
      color: ${fontColor};
    }
    .pf-c-card {
      --pf-c-card--BackgroundColor: ${backgroundColor200};
      color: ${fontColor};
    }
    .pf-c-card .pf-c-card{
      --pf-c-card--BackgroundColor: ${backgroundColor400};
      color: ${fontColor};
    }
    .pf-c-card .pf-c-card .pf-c-card{
      --pf-c-card--BackgroundColor: ${backgroundColor200};
      color: ${fontColor};
    }
    .pf-c-form-control:disabled {
      --pf-c-form-control--BackgroundColor: ${backgroundColor300};
      color: ${fontColor};
    };
    .pf-c-form-control {
      --pf-c-form-control--BackgroundColor: ${backgroundColor300};
      --pf-c-form-control--BorderTopColor: ${backgroundColor300};
      --pf-c-form-control--BorderRightColor: ${backgroundColor300};
      --pf-c-form-control--BorderBottomColor: ${backgroundColor300};
      --pf-c-form-control--BorderLeftColor: ${backgroundColor300};
      color: ${fontColor};
    };
    .pf-c-button.pf-m-tertiary {
      color: ${fontColor};
    };
    .pf-c-button.pf-m-control {
      background-color: ${backgroundColor300};
      --pf-c-button--after--BorderColor: ${backgroundColor300};
      color: ${fontColor};
    };
    .pf-c-calendar-month {
      --pf-c-calendar-month--BackgroundColor: ${backgroundColor300};
      color: ${fontColor};
    };
    .pf-c-calendar-month__dates-cell::before {
      background-color: ${backgroundColor300};
      color: ${fontColor};
    };
    .pf-c-calendar-month__date {
      color: ${fontColor};
    };
    .pf-c-select__toggle {
      background-color: ${backgroundColor300};
      color: ${fontColor};
    };
    .pf-c-form-control[readonly] {
      background-color: ${backgroundColor300};
      color: ${fontColor};
    };
    .pf-c-form__helper-text {
      color: ${fontColor};
    };
    .pf-c-menu {
      --pf-c-menu--BackgroundColor: ${backgroundColor300};
      color: color: ${fontColor};
    };
    .pf-c-menu__item {
      background-color: ${backgroundColor300};
      color: ${fontColor};
    }
    .pf-c-input-group {
      --pf-c-input-group--BackgroundColor: ${backgroundColor300};
    }
    .pf-c-search-input {
      --pf-c-search-input__text--before--BorderColor: ${borderColor200};
      --pf-c-search-input__text--after--BorderBottomColor: ${borderColor200};
      color: ${fontColor};
    }
    .pf-c-search-input__text-input {
      color: ${fontColor};
    }
    .pf-c-modal-box {
      --pf-c-modal-box--BackgroundColor: ${backgroundColor300};
      color: ${fontColor};
    }
    .pf-c-radio {
      --pf-c-radio__label--Color: ${fontColor};
    }
    .pf-c-button.pf-m-plain {
      color: ${fontColor};
    }
    `;

    return <GlobalStyles />
};

export default GlobalStyle;