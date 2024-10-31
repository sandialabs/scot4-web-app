<template>
<v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      app
      hide-overlay
      persistent
      fixed
      width="500"
      clipped
    >
      <!--- 
      We'll need to transition to vuetify 3 to fix the width issue in the future. 
      --->
    <v-toolbar v-if="!mini">
        <v-toolbar-title v-if="elementTypePluralized !='nulls'"> {{elementTypePluralized}} </v-toolbar-title>
        <v-progress-linear v-else
                           indeterminate
                           color="yellow darken-2"></v-progress-linear>

        <v-spacer></v-spacer>
        <v-btn v-if="elementType!='Alertgroup'" icon
               @click="createNewElement()">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn icon>
            <v-icon>mdi-filter</v-icon>
        </v-btn>
        <v-btn icon>
            <v-icon>mdi-sort</v-icon>
        </v-btn>
        <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

    </v-toolbar>


    <v-toolbar v-else
    >
         <v-btn icon @click.stop="mini = !mini"> 
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>

    </v-toolbar>

    <v-list two-line>
      <v-list-item-group
        v-model="selected"
        active-class="yellow--text"
      >
        <v-list-item class="pa-0" v-for="item in elementList" :key="item.id" @click="onElementSelected(item.id)">
        <template v-if="mini">
        <v-card width="100%">
        <v-card-title>{{item.id}}</v-card-title>
        </v-card>
        </template>
        <AlertInboxElement v-if="elementType=='Alertgroup'" v-bind:element="item"> </AlertInboxElement>
        <EventInboxElement v-if="elementType=='Event'" v-bind:element="item"> </EventInboxElement>

        </v-list-item>

      </v-list-item-group>
    </v-list>
    </v-navigation-drawer>
    </template>

<script lang="ts">
import { Component, Vue} from 'vue-property-decorator'
import EventInboxElement from '@/components/InboxComponents/InboxElements/EventInboxElement.vue'
import AlertInboxElement from '@/components/InboxComponents/InboxElements/AlertInboxElement.vue'
import { State, Action, Getter } from 'vuex-class';
import { IRElementMeta, IRElementsListState, IRElementType } from '@/store/modules/IRElements/types'
import { User } from '@/store/modules/user/types'

const namespace: string = 'IRElements';

@Component({
    components: {
        AlertInboxElement,
        EventInboxElement,
    },
})

export default class InboxNavDrawer extends Vue {
    @Action('retrieveElementList', { namespace }) retrieveElementList: any;
    @Action('retrieveSelectedElementbyID', { namespace }) retrieveSelectedElementbyID: any;
    @Action('createElement', { namespace }) createElement: CallableFunction;
    @Getter('elementList', { namespace }) elementList: Array<IRElementMeta> | null;
    @Getter('elementType', { namespace }) elementType: IRElementType | null;
    @Getter('elementTypePluralized', { namespace }) elementTypePluralized: string | null;
    @Getter('currentUser', { namespace: 'user' }) currentUser: User;

    mini: boolean = false
    items: Array<any> = []
    drawer: any = null
    selected: number | null = null

    async retrieveInboxItems(itemType: IRElementType) {
        await this.retrieveElementList(itemType)
    }

    onElementSelected(id: number) {
        let newRouteString = "/" + this.elementTypePluralized?.toLowerCase() + "/" + id /** need to pluralize the element type to match the route */
        this.$router.push(newRouteString).catch((err: any) => { return })
    }

    async createNewElement(createData: any = {}) {
        if (this.elementType != null) {
            if (!("owner" in createData)) {
                createData.owner = this.currentUser.username
            }
            const newElement = await this.createElement({ elementType: this.elementType, createData })
            await this.retrieveInboxItems(this.elementType)
            this.onElementSelected(newElement.id)
        }
    }


}
</script>
