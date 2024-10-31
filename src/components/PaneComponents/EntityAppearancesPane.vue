<template>
    <v-data-table v-if="viewedEntity"
                  :headers="entityAppearancesHeaders"
                  :items="viewedEntity.appearances"
                  :items-per-page="10"
                  :loading="viewedEntity.appearances == undefined"
                  :footer-props="{ dense: true }"
                  dense
                  fixed-header>
        <template  v-slot:body="{ items, headers }">
            <tbody v-if="viewedEntity.appearances != undefined">
                <tr v-for="(item) in items" :key="item.id+item.type.toString()">
                    <td v-for="header in headers" :key="header.text">
                        <span v-if="header.value == 'status' && Array.isArray(item.status)">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-chip v-on="on" v-bind="attrs" :color="alertGroupStatusColor(item.status)" class="status-chip">
                                        <v-icon left>
                                            {{alertGroupStatusIcon(item.status)}}
                                        </v-icon>
                                        {{item.status[0]}}/{{item.status[1]}}/{{item.status[2]}}
                                    </v-chip>
                                </template>
                                <span> {{item.status[0]}} Alerts Open, {{item.status[1]}} Alerts Closed, {{item.status[2]}} Alerts Promoted </span>
                            </v-tooltip>
                        </span>
                        <span v-else-if="header.value == 'status'">
                            <v-chip :color="objectStatusColor(item.status)" class="status-chip" :href="item.promoted_ids && item.promoted_ids.length > 0 && item.status == 'promoted' ? '/#/events/' + item.promoted_ids[0] : null">
                                {{item.status}}
                            </v-chip>
                        </span>
                        <span v-else-if="header.value == 'last_updated'">
                            <span v-if="$vuetify.breakpoint.xl">
                                {{ transformDateString(item[header.value])['date'] }} {{ transformDateString(item[header.value])['time'] }}
                            </span>
                            <span v-else>
                                {{ transformDateString(item[header.value])['date'] }}<br />{{ transformDateString(item[header.value])['time'] }}
                            </span>
                        </span>
                        <span v-else-if="header.value == 'id'">
                            <router-link v-if="item.type == 'alert'" :to="'/alertgroups/' + item.alertgroup_id">
                                {{ item.id }}
                            </router-link>
                            <router-link v-else :to="'/' + pluralizeElementType(item.type) + '/' + item.id.toString()">
                                {{ item.id }}
                            </router-link>
                        </span>
                        <span v-else>
                            {{ item[header.value] }}
                        </span>
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
              Loading Entity Appearances
            </tbody>
        </template>
    </v-data-table>
</template>


<script lang="ts">
import { Component, Vue, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter } from 'vuex-class';
import { Entity, IRElement, IRElementType } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';



@Component({
  components: {
    },
})

export default class EntityAppearancesPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
    @Getter('entityAppearances', { namespace }) entityAppearances: Array<any> | undefined;
    @Prop({ default: null }) entity: any

    entityAppearancesHeaders: Array<any> = [{ "text": "ID", "value": "id", "class": "text-no-wrap" }, { "text": "Type", "value": "type", "class": "text-no-wrap" }, { "text": "Subject", "value": "subject", "class": "text-no-wrap" }, { "text": "Status", "value": "status", "class": "text-no-wrap" }, { "text": "Last Updated", "value": "last_updated" }]
    viewedEntity: Entity | IRElement | null = null

    async mounted() {
        
        if (this.entity != null) {
            this.viewedEntity = this.entity
        }
        else if (this.selectedElement?.ElementType == IRElementType.Entity) {
            this.viewedEntity = this.selectedElement
        }
        
    }

    transformDateString(dateString: string) {
        const date: any = new Date(dateString)
        const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
        return { date: date.toLocaleDateString(undefined, options), time: date.toLocaleTimeString('en-US') }
    }

    objectStatusColor(status: string) {
        switch (status) {
            case "open":
            case "disabled":
                return "red"
            case "closed":
            case "enabled":
                return "green"
            case "promoted":
                return "amber"
            default:
                return "white"
        }
    }

    pluralizeElementType(elementType: string) {
        if (elementType == "entity") {
            return "entities"
        }
        else if (elementType == "dispatch") {
            return "dispatches"
        }
        else if (elementType == "entityclass") {
            return "entity classes"
        }
        else {
            return elementType + "s"
        }
    }
}
</script>

<style scoped>
.status-chip {
    width: 100%;
    justify-content: center;
    height: 90%;
}
</style>