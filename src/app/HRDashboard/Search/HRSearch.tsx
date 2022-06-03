import React, { useState } from 'react';
import { 
  Menu, 
  MenuContent, 
  MenuList, 
  MenuItem, 
  SearchInput, 
  Card, 
  Button, 
  GridItem, 
  Grid
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import CardWithTitle from '@app/Components/CardWithTitle';
import authaxios from "@app/utils/axiosInterceptor";
import { EMPLOYEE_URL } from '@app/utils/constants'

const HRSearch: React.FunctionComponent = () => {
  const [activeItem, setActiveItem] = useState('0'); 
  const [search, setSearch] = useState(''); 
  const [searchResult, setSearchResult] = useState<string[]>([])
  const [searchResultInfo, setSearchResultInfo] = useState<string[]>([])
  const [hasNoResult, setHasNoResult] = useState(false)
  const history = useHistory();
  
  const onSelect = (event, itemId) => {
    const itemIndex = parseInt(itemId)
    sessionStorage.setItem("searchResultInfo", JSON.stringify(searchResultInfo[itemIndex]))
    setActiveItem(itemId)
    history.push('/hrdashboard/history');
  }

  const onSearchChange = (value) => {
    setSearch(value);
    setSearchResult([])
    setHasNoResult(false)
  }

  const onSearchClear = () => {
    setSearch('')
    setSearchResult([])
    setHasNoResult(false)
  }

  const onSearchEnter = () => {
    authaxios.get(EMPLOYEE_URL + search)
    .then(result => {
      if(result['data']) {
        const employee = result['data'];
        const resultLabel = employee['lastName'] + ", " + employee['firstName'] + "  [" + employee['employeeId'] + "]";
        
        setHasNoResult(false)
        setSearchResult([resultLabel])
        setSearchResultInfo([employee])
      }
      else {
        setHasNoResult(true)
      }
    })
    .catch(() => {
      setHasNoResult(true)
    })
  }

  return (
    <Card isRounded>
      <CardWithTitle title="Red Hat VCS Search" info="Search Employee" />
      <Menu onSelect={onSelect} activeItemId={activeItem}>
        <Grid>
          <GridItem span={9}>
            <SearchInput
              placeholder='Search by Employee ID'
              value={search}
              onChange={onSearchChange}
              onClear={onSearchClear}
              onKeyPress={(event) => {
                if(event.key === 'Enter') {
                  onSearchEnter()
                }
              }}
            />
          </GridItem>
          <GridItem span={3}>
            <Button isBlock variant="control" onClick={onSearchEnter}>Search</Button>
          </GridItem>
        </Grid> 
        <MenuContent menuHeight="315px">
          <MenuList>
            <MenuItem isDisabled itemId="title">
              Search Result:
            </MenuItem>
            {
              searchResult &&
              searchResult.map((data, index) =>
              <MenuItem key={index} itemId={index}>
                {data}
              </MenuItem> ) 
            }
            {
              hasNoResult &&
              <MenuItem isDisabled itemId='NoResults'>
                No results for {search}
              </MenuItem>
            }
          </MenuList>
        </MenuContent>
      </Menu>
    </Card>
  );
};

export { HRSearch };