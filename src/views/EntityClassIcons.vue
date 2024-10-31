<template>
<v-container fluid>
 <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
  <v-data-table
    :headers="entityClassHeaders"
    :items="entityClassesList"
    :items-per-page="-1"
    :search="search"
    :hide-default-footer="true"
  >
      <template v-slot:[`item.icon`]="{ item }">
      <v-icon>
          {{ item.icon }}
      </v-icon>
    </template>
  
  </v-data-table>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import { default_title } from '@/constants';



const namespace: string = 'team';

@Component({
    components: {
  
    },
})

export default class EntityClassIconsView extends Vue {
    @Action('retrieveAllEntityClassesGeneralList', { namespace }) retrieveAllEntityClasses: CallableFunction;
    @Getter('entityClassesList', { namespace }) entityClassesList: Array<any>;

    search = ''
    entityClassHeaders = [{'text': 'Name', 'value':'name'}, {'text':'Description', 'value':'description'}, {'text':'Icon', 'value':'icon'}]
    async mounted() {
        document.title = default_title
        if(this.entityClassesList.length == 0){
            await this.retrieveAllEntityClasses()
        }
    }
   }
</script>

<style scoped lang="scss">
    .selectedRow {
        background-color: skyblue !important;
    }

    .theme--dark .selectedRow {
        background-color: steelblue !important;
    }

    .selectedRow:hover {
        cursor: pointer
    }

    .notSelectedRow:hover {
        cursor: pointer
    }

    .v-data-table {
        max-height: 100%;
        display: flex;
        flex-direction: column;
    }

    .v-data-table td {
        overflow-wrap: break-word;
        word-break: break-word;
    }

    .v-data-table .no-line-breaks {
        word-break: normal;
        overflow-wrap: normal;
        white-space: nowrap;
    }

    .status-chip {
        width: 100%;
        justify-content: center;
        height: 90%;
    }

    .theme--light tbody tr:nth-of-type(odd) {
        background-color: rgba(0, 0, 0, .03);
    }

    .theme--dark tbody tr:nth-of-type(odd) {
        background-color: rgba(0, 0, 0, 0.5)
    }

    .v-chip {
        padding: 0 4px;
    }

    .v-data-footer {
        min-height: 50px;
        align-self: end;
        width: 100%
    }
    .v-data-table{
    overflow-x: auto;
    overflow-y: scroll !important;
}
  .container--fluid {
    max-width: 100%;
    height: 92%;
  }

.v-data-table{
    max-height: 100%;
    display: block;
    overflow-y: scroll;
    flex-direction: column;
}
</style>
