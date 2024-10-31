import Login from '@/views/Login.vue'
import { shallowMount } from '@vue/test-utils'
import { createLocalVue, mount } from '@vue/test-utils'
import Vue from 'vue';
import Vuex, { Store, StoreOptions } from 'vuex';
import { RootState } from '@/store/types';
import { user } from '@/store/modules/user/index'
import { team } from '@/store/modules/team/index'
import { cloneDeep } from 'lodash'
import EntryCell from '@/components/JournalComponents/EntryCellComponents/EntryCell.vue'
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
})


  it("I can add the entry", () => {
    const wrapper = mount(EntryCell, {vuetify, localVue})
    const entryView = wrapper.find('.entryView')
  })

})