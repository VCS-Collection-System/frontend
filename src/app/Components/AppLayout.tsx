import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Alert,
  Page,
  Flex,
  FlexItem,
  PageHeader,
  SkipToContent,
  Title,
  Button,
} from '@patternfly/react-core';
import logo from '@app/Assets/Logo-RedHat-A-Color-RGB.svg';
import asciiLogo from '@app/Assets/Logo-RedHat-C-Color-Ascii.png';
import { useDarkMode } from  "@app/utils/customInputs"
import Feature from './Feature';
import GlobalStyle from '@app/utils/GlobalStyle';
import { MAINTENANCE_BANNER, MAINTENANCE_BANNER_TEXT } from "@app/utils/constants";

interface IAppLayout {
  children: React.ReactNode,
  loggedIn: boolean;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children, loggedIn}) => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMobileView, setIsMobileView] = React.useState(true); //NOSONAR
  const [themeSwitcher, setThemeSwitcher] = React.useState(false)
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };
  // Extract this for re-use
  const clearAndRedirect = () => {
    sessionStorage.clear();
    window.location.href = "/";
  }

  // Figure out why we can't control page layout without isNavOpen of this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Header = ( //NOSONAR
    <PageHeader
      isNavOpen={false}
    />
  );
  const pageId = 'primary-app-container';
  const PageSkipToContent = (
    <SkipToContent onClick={(event) => {
      event.preventDefault();
      const primaryContentContainer = document.getElementById(pageId);
      primaryContentContainer && primaryContentContainer.focus();
    }} href={`#${pageId}`}>
      Skip to Content
    </SkipToContent>
  );

  return (
    <Page
      style={{ backgroundColor: "rgb(222, 222, 222)" }}
      mainContainerId={pageId}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}
    >
      {MAINTENANCE_BANNER && (<Alert variant="info" title={MAINTENANCE_BANNER_TEXT} style={{width: "100vw"}}></Alert>)}
      <Flex
        alignItems={{ default: "alignItemsCenter" }}
        direction={{ default: "column" }}
        style={{ marginTop: "1rem" }}
      >
        <Flex 
          fullWidth={{ default: "fullWidth" }} 
          justifyContent={{ default: "justifyContentSpaceBetween" }}>
          <FlexItem style={{paddingLeft: "var(--pf-l-flex--spacer)"}}>
            <img src={logo} onClick={() => history.push("/")} alt="RH Logo" width="120px" style={{marginBottom: "-12px"}} />
          </FlexItem>
          <FlexItem alignSelf={{ default: "alignSelfFlexEnd" }}>
            <Button
              onClick={() => history.push("/contact")}
              variant="plain"
            >
              <span style={{ color: themeSwitcher ? "rgb(180, 180, 178)" : "black" }}>HELP</span>
            </Button>
            <Button
              onClick={() => history.push("/privacy")}
              variant="plain"
            >
              <span style={{ color: themeSwitcher ? "rgb(180, 180, 178)" : "black" }}>PRIVACY</span>
            </Button>
            {loggedIn ? (
              <Button onClick={clearAndRedirect} variant="plain">
                <span style={{ color: themeSwitcher ? "rgb(180, 180, 178)" : "black" }}>LOGOUT</span>
              </Button>
            ) : "" }
          </FlexItem>
        </Flex>
        <FlexItem style={{margin: "var(--pf-global--spacer--3xl) 0 var(--pf-global--spacer--2xl) 0"}}>
          <Title headingLevel="h1" size="3xl" style={{ fontWeight: 300 }}>
            Validation Check-In System
          </Title>
        </FlexItem>
        <FlexItem style={{ width: "95%" }}>{children}</FlexItem>
        {useDarkMode() ? (
          <Feature name="customInput"> 
            <Flex 
              fullWidth={{ default: "fullWidth" }} 
              justifyContent={{ default: "justifyContentCenter" }}
            >
              <FlexItem>
                {themeSwitcher ? <GlobalStyle /> : ""}
                <img src={asciiLogo} onClick={() => setThemeSwitcher(!themeSwitcher)} alt="RH Logo" width="120px" style={{marginRight: "12px"}} />
              </FlexItem>
            </Flex>
          </Feature>
        ) : ""}
      </Flex>
    </Page>
  );
}

export { AppLayout };