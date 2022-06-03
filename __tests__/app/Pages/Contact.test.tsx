import React from 'react';
import { shallow, mount } from 'enzyme';
import { Contact } from '../../../src/app/Pages/Contact';

// mock history.push
import reactRouterDom from 'react-router-dom'
jest.mock('react-router-dom')
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({push: mockPush})

describe('Contact Page', ()=> {
    it('should be defined', () => {
        expect(Contact).toBeDefined()
    })
    it('should render without crashing', () => {
        const wrapper = shallow(<Contact />)
        expect(wrapper)
    })
    it('should match existing snapshot', () => {
        const wrapper = shallow(<Contact />)
        expect(wrapper).toMatchSnapshot()
    })

    it('Back button pushes to home page', async () => {
        const contact = mount( <Contact />)
        contact.find('button').simulate('click')
        await Promise.resolve()
        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith('/')
      })
})
