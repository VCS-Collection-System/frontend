import React from 'react';
import { shallow, mount } from 'enzyme';
import { NotFound } from '../../../src/app/Pages/NotFound';

// mock history.push
import reactRouterDom from 'react-router-dom'
jest.mock('react-router-dom')
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({push: mockPush})

describe('NotFound Page', ()=> {
    it('should be defined', () => {
        expect(NotFound).toBeDefined()
    })
    it('should render without crashing', () => {
        const wrapper = shallow(<NotFound />)
        expect(wrapper)
    })
    it('should match existing snapshot', () => {
        const wrapper = shallow(<NotFound />)
        expect(wrapper).toMatchSnapshot()
    })
    it('Back button pushes to home page', async () => {
        const notfound = mount( <NotFound />)
        notfound.find('button').simulate('click')
        await Promise.resolve()
        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith('/')
      })
})
