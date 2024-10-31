// profile/index.ts
import { Module } from 'vuex';
import { getters } from '@/store/modules/IRElements/getters';
import { actions } from '@/store/modules/IRElements/actions'
import { mutations } from '@/store/modules/IRElements/mutations'
import { RootState } from '@/store/types';
import { IRElementsListState } from './types';

export const state: IRElementsListState = {
    ElementType: null,
    SelectedElement: null,
    linkedEntriesChanged: false,
    SelectedElementEntries: [],
    SelectedElementEntities: [],
    SelectedElementFiles: [],
    SelectedElementHistory: [],
    SelectedElementPermissions: {},
    SelectedElementAbortController: null,
    ElementListAbortController: null,
    ElementList: null,
    view_count: null,
    totalElementListCount: 0,
    loading: false,
    entitiesLoaded: false,
    numEntitiesLoading: 0,
    SelectedElementFlairedEntities: [],
    flairedEnrichmentsandPivotsLoaded: null,
    flairVisible: true,
    flairDialog: false,
    flairMenuVisible: false,
    flairMenuX: -1,
    flairMenuY: -1,
    flairMenuEntity: null,
    fileDialog: false,
    elementPaneHeight: null,
    selectedElementSize: 0,
    retrievingElements: false,
    elementListPage: 1,
    elementListItemsPerPage: 50,
    elementListSortBy: undefined,
    elementListSortDesc: false,
    elementListFilter: {}
};

const namespaced: boolean = true;

export const IRElements: Module<IRElementsListState, RootState> = {
    namespaced,
    state,
    getters,
    actions,
    mutations
};