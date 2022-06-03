import React, { useEffect, useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Button,
  Card, 
  CardBody, 
  CardFooter,
  Grid,
  Flex,
  FlexItem,
  GridItem,
  Modal, 
  ModalVariant,
  Menu, 
  MenuContent, 
  MenuList, 
  MenuItem,
  MenuGroup,
  Split
} from '@patternfly/react-core';
import CardWithTitle from '@app/Components/CardWithTitle';
import { useHistory } from 'react-router-dom';
import authaxios from "@app/utils/axiosInterceptor";
import { HRVaxSubmit } from './AddRecord/HRVaxSubmit';
import { HRTestSubmit } from './AddRecord/HRTestSubmit';
import { dateConvert } from "@app/utils/utils";
import EmployeeInfoHorizontalCard from '@app/Components/EmployeeInfoHorizontalCard';
import { CaseReviewPanel } from './CaseReviewPanel';
import { EMPLOYEE_VAX_HISTORY_URL, EMPLOYEE_TEST_HISTORY_URL } from '@app/utils/constants'

const CaseHistory: React.FunctionComponent = () => {
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeDOB, setEmployeeDOB] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [activeItem, setActiveItem] = useState('0'); 
  const [vaxHistory, setVaxHistory] = useState([]);
  const [testHistory, setTestHistory] = useState([]);  
  const [hasSelectedItem, setHasSelectedItem] = useState(false); 
  const [updatePanel, setUpdatePanel] = useState(false);
  const [expanded, setExpanded] = useState('');

  useEffect(() => {
    const sessionEmployee = sessionStorage.getItem("searchResultInfo") || "{}"; 
    const employeeInfo = JSON.parse(sessionEmployee); 
    setEmployeeId(employeeInfo['employeeId']);
    setEmployeeName(employeeInfo['firstName'] + " " + employeeInfo['lastName']);
    setEmployeeDOB(employeeInfo['dateOfBirth']);
    setEmployeeEmail(employeeInfo['email']);

    authaxios.get(EMPLOYEE_VAX_HISTORY_URL + employeeInfo['employeeId'])
    .then(result => {
      result['data'].sort((a, b) => {
        return a['vaccineAdministrationDate'].localeCompare(b['vaccineAdministrationDate']);
      });
      setVaxHistory(result['data'])
    })

    authaxios.get(EMPLOYEE_TEST_HISTORY_URL + employeeInfo['employeeId'])
    .then(result => {
      setTestHistory(result['data'])
    })

  }, [refresh]);

  const closeModal = () => {
    setIsModalOpen(false);
    setRefresh(!refresh);
    setUpdatePanel(!updatePanel);
  }

  const onSelect = (event, itemId) => {
    setHasSelectedItem(true);
    setActiveItem(itemId);
    setUpdatePanel(!updatePanel)

    if(itemId.includes('TEST')){
      const dataIndex = parseInt(itemId.split(':')[1]);
      const testData = testHistory[dataIndex];
      sessionStorage.setItem("caseHistoryType", "TEST");
      sessionStorage.setItem("caseHistoryInfo", JSON.stringify(testData));
    }
    else if(itemId.includes('VAX')) {
      const dataIndex = parseInt(itemId.split(':')[1]);
      const vaxData = vaxHistory[dataIndex];
      sessionStorage.setItem("caseHistoryType", "VAX");
      sessionStorage.setItem("caseHistoryInfo", JSON.stringify(vaxData));
    }
  }

  const getTaskStatus = (value) => {
    if(value['review']) {
      return value['review']['reviewOutcome'];
    }
    return value['autoApproved'] ? "AUTO-ACCEPTED" : "NOT REVIEWED";
  }

  const AddRecordModal = () => {
    function onToggle(id) {
      if(id === expanded) {
        setExpanded('');
      }
      else {
        setExpanded(id); 
      }
    }


    return (
       <Modal
        aria-label="AddRecordModal"
        variant={ModalVariant.medium}
        title="Add Record"
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <Accordion>
          <AccordionItem>
            <AccordionToggle
              onClick={() => {
                onToggle('vax-toggle');
              }}
              isExpanded={expanded === 'vax-toggle'}
              id="vax-toggle"
            >
              Vaccine Submission
            </AccordionToggle>
            <AccordionContent id="vax-expand" isHidden={expanded !== 'vax-toggle'}>
              <HRVaxSubmit closeParentModal={closeModal}/>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem>
            <AccordionToggle
              onClick={() => {
                onToggle('test-toggle');
              }}
              isExpanded={expanded === 'test-toggle'}
              id="test-toggle"
            >
              Test Submission
            </AccordionToggle>
            <AccordionContent id="test-expand" isHidden={expanded !== 'test-toggle'}>
              <HRTestSubmit closeParentModal={closeModal}/>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <br />
        <Flex>
          <FlexItem align={{ default: "alignLeft" }}>
            <Button key="back" variant="plain" onClick={closeModal}>
              Back
            </Button>
          </FlexItem>
        </Flex>
      </Modal>
    )
  }

  const CovidTestHistory = () => {
    if(testHistory.length > 0) {
      return (
        <>
          <MenuItem 
            key={"TEST"} 
            itemId={"TEST"}
            isDisabled
          >
            <Flex justifyContent={{default: "justifyContentSpaceBetween"}}>
              <FlexItem>
              {"Test Date"}
              </FlexItem>
              <FlexItem>
              {"Test Result"}
              </FlexItem>
            </Flex>
          </MenuItem>
          {
            testHistory.map((x, i) => (
              <MenuItem 
                key={"TEST:" + i} 
                itemId={"TEST:"+i}
              >
                <Flex justifyContent={{default: "justifyContentSpaceBetween"}}>
                  <FlexItem>
                    {dateConvert(x['covidTestDate'])}
                  </FlexItem>
                  <FlexItem>
                  { x['covidTestResult'] }
                    {/* { x['covidTestResult'] === "POSITIVE" ? <CircleIcon color='firebrick'/>  : x['covidTestResult'] === "NEGATIVE" ?  <CircleIcon color="seagreen" />: <CircleIcon color="goldenrod"/> } */}
                  </FlexItem>
                </Flex>
              </MenuItem>
            ))
          }
        </>
      )
    }
    else{
      return (
        <MenuItem key="empty" itemId="empty" isDisabled>
          [No Test Results]
        </MenuItem>
      )
    }
  }

  const CovidVaccineHistory = () => {
    if(vaxHistory.length > 0) {
      return (
        <>
          <MenuItem 
            key={"VAX"} 
            itemId={"VAX"}
            isDisabled
          >
            <Flex justifyContent={{default: "justifyContentSpaceBetween"}}>
              <FlexItem>
                {"Vaccination Date"}
              </FlexItem>
              <FlexItem>
                {"Status"} 
              </FlexItem>
            </Flex>
          </MenuItem>
          {
            vaxHistory.map((value, index) => (
              <MenuItem 
                key={"VAX:" + index} 
                itemId={"VAX:" + index}
              >
                <Flex justifyContent={{default: "justifyContentSpaceBetween"}}>
                  <FlexItem>
                    { dateConvert(value['vaccineAdministrationDate']) }
                  </FlexItem>
                  <FlexItem>
                    { getTaskStatus(value) }
                  </FlexItem>
                </Flex>
              </MenuItem>
            ))
          }
        </>
      )
    }
    else{
      return (
        <MenuItem key="empty" itemId="empty" isDisabled>
          [No Vaccination Records]
        </MenuItem>
      )
    }
  }

  return (
    <Card isRounded>
      <AddRecordModal />
      <CardWithTitle title="Case History" info="Review Case History"/>
      <CardBody>
        <Grid hasGutter>
          <GridItem span={12}> 
            <EmployeeInfoHorizontalCard 
              employeeId={employeeId}
              employeeName={employeeName}
              employeeDOB={employeeDOB}
              employeeEmail={employeeEmail}
            />
          </GridItem>
          <GridItem span={4} rowSpan={6}> 
            <Card>
              <CardWithTitle title="Attestation Records"/>
                <Menu onSelect={onSelect} activeItemId={activeItem}>
                  <MenuContent menuHeight="875px">
                    <MenuGroup label="Test Results">
                      <MenuList className="indentList">
                        <CovidTestHistory />
                      </MenuList>
                    </MenuGroup>
                    <MenuGroup label="Vaccination Records">
                      <MenuList className="indentList">
                        <CovidVaccineHistory />
                      </MenuList>
                    </MenuGroup>
                  </MenuContent>
                </Menu>
            </Card>
          </GridItem>
          <GridItem span={8} rowSpan={6}>
            <CaseReviewPanel 
              hasSelectedItem={hasSelectedItem}
              setHasSelectedItem={setHasSelectedItem}
              updatePanel={updatePanel} 
              refreshCaseHistory={refresh}
              setResfreshCaseHistory={setRefresh}
            />
          </GridItem>
        </Grid>
      </CardBody>
      <CardFooter>
        <Split hasGutter>
          <Button variant="primary" onClick = { () => setIsModalOpen(!isModalOpen) }>
            Add Record
          </Button>
          <Button 
            variant="plain" 
            onClick={() => history.push("/hrdashboard")
          }>
            Back
          </Button>
        </Split>
      </CardFooter>
    </Card>
  );
}

export { CaseHistory };