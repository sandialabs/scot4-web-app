import Login from '@/views/Login.vue'
import { shallowMount } from '@vue/test-utils'
import { createLocalVue, mount } from '@vue/test-utils'
import Vue from 'vue';
import Vuex, { Store, StoreOptions } from 'vuex';
import { RootState } from '@/store/types';
import { user } from '@/store/modules/user/index'
import { team } from '@/store/modules/team/index'
import { cloneDeep } from 'lodash'

import { IRElements } from '@/store/modules/IRElements/index'
import Vuetify from 'vuetify'





describe('Actions.vue', () => {

const localVue = createLocalVue()

localVue.use(Vuex)
  let vuetify:any
  let actions:any
  let state 
  let store:any
beforeEach(() => {
  vuetify = new Vuetify()
  state = {}

 actions = {
  loginLocalUser: jest.fn()
 }
 store = new Vuex.Store({
   modules: {
     user: {
       state,
       actions,
       getters: user.getters,
       namespaced: true
     }
   }
 })
})

  it("has a login button that says login", () => {
    const wrapper = mount(Login, { store, vuetify, localVue})
    const loginButton = wrapper.find('#loginButton')
    expect(loginButton.text()).toBe('Login')
  })

  it("has a field for a username", () => {
    const wrapper = mount(Login, { store, vuetify, localVue})
    const userNameForm = wrapper.find('#userNameForm')
    expect(userNameForm.exists()).toBe(true)
  })
  it("has a field for a password", () => {
    const wrapper = mount(Login, { store, vuetify, localVue})
    const passwordForm= wrapper.find('#passwordForm')
    expect(passwordForm.exists()).toBe(true)
  })
  it("Login button should trigger action", () => {
    const wrapper = mount(Login, { store, vuetify, localVue})
    const loginButton = wrapper.find('#loginButton')
    loginButton.trigger('click')
    expect(actions.loginLocalUser).toHaveBeenCalled()
  })

})