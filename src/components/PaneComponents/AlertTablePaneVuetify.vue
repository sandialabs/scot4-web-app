<template>
    <v-data-table :headers="vuetifyAlertGroupTableColumns"
                  :items="entitiesLoaded && flairVisible ? vuetifyAlertGroupTableRowsFlaired: vuetifyAlertGroupTableRows"
                  :hide-default-footer=true
                  :items-per-page=-1
                  :dense="true"
                  fixed-header
                  sort-by="id"
                  height="100%"
                  id="alertTable"
                  v-model=selectedAlerts>
        <template v-if="entitiesLoaded==false" v-slot:top>
            <v-progress-linear class="pt-4 mt-2" v-if="entitiesLoaded==false"
                               indeterminate
                               color="blue darken-2">
                <template v-slot:default>
                    <strong> Loading Flair </strong>
                </template>
            </v-progress-linear>
        </template>
        <template v-slot:item="{ item, isSelected, select, index }">
            <tr :id="'AlertRow' + index" @click="onAlertSelected(isSelected, index, select, $event)" @mousedown="preventTextSelection" :class="{'selectedRow': isSelected, 'notSelectedRow': !isSelected}">
                <td v-for="key in vuetifyAlertGroupTableColumns" :class="key.value == 'id' || key.value == 'status' ? 'text-center' : 'alert-cell'" :key="item.id+key.value">
                    <v-tooltip top v-if="key.value=='status' && item['status'] == 'promoted'">
                        <template v-slot:activator="{ on, attrs }">
                            <v-chip :href="item.promoted_ids && item.promoted_ids.length > 0 ? '/#/events/' + item.promoted_ids[0] : ''" v-on="on" v-bind="attrs" color=amber class="promotedAlertStatus">
                                Promoted
                            </v-chip>
                        </template>
                        <span> Alert promoted to event ID(s): {{item['promoted_ids'].join()}} </span>
                    </v-tooltip>
                    <v-chip :color="item['status'] == 'closed'? 'green': 'red'" v-else-if="key.value=='status' && item['status'] !='promoted'">
                        {{item[key.value]}}
                    </v-chip>

                    <v-container class="pa-0 alert-container" fluid v-else-if="isObjectOrArray(item[key.value]) != false && entitiesLoaded == true">
                        <span v-for="(nestedItem, index) in isObjectOrArray(item[key.value])" :key=index style="width:100%" class="text-left mt-n1 mb-1">

                            <FlairedTextComponent v-if='(plain_alert_columns + ["sparkline"]).includes(key.value)==false && flairVisible' :templateText="nestedItem" />
                            <span v-else-if="key.value=='sparkline'" v-html="nestedItem"></span>
                            <span v-else style="white-space: pre-wrap" class="text-left">
                                {{nestedItem}}
                            </span>
                            <br>
                        </span>
                    </v-container>

                    <span v-else-if="key.value=='sparkline'" v-html="item[key.value]">
                    </span>
                    <span v-else-if="entitiesLoaded==false || !item[key.value] || !flairVisible" class="text-left" style="white-space: pre-wrap"  v-html="item[key.value]">
                    </span>
                    <span v-else-if="key.value=='id'" class="text-left">
                        {{item[key.value]}}
                    </span>
                    <FlairedTextComponent v-else :templateText="item[key.value]" class="alert-container">
                    </FlairedTextComponent>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementMeta, IRElementStatus } from '@/store/modules/IRElements/types'
import FlairedTextComponent from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/FlairPlugin/FlairedTextComponent.vue'
import { plain_alert_columns } from '../../constants';
const namespace: string = 'IRElements';

    @Component({
        components: {
            FlairedTextComponent
        },
    })

    export default class AlertTablePaneVuetify extends Vue {

        @Getter('isAlertGroupElementType', { namespace }) isAlertGroupElementType: boolean;
        @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
        @Getter('vuetifyAlertGroupTableColumns', { namespace }) vuetifyAlertGroupTableColumns: Array<any>;
        @Getter('vuetifyAlertGroupTableRows', { namespace }) vuetifyAlertGroupTableRows: Array<any>;
        @Action('retrieveElementList', { namespace }) retrieveElementList: CallableFunction;
        @Action('retrieveSelectedElementbyID', { namespace }) retrieveSelectedElementbyID: CallableFunction;
        @Action('modifySelectedAlertIds', { namespace }) modifySelectedAlertIds: CallableFunction;
        @Getter('elementList', { namespace }) elementList: Array<IRElementMeta> | null;
        @Getter('flairVisible', { namespace }) flairVisible: boolean
        @Getter('vuetifyAlertGroupTableRowsFlaired', { namespace }) vuetifyAlertGroupTableRowsFlaired: Array<any>;
        @Getter('selectedElementEntities', { namespace }) selectedElementEntities: Record<string, any>;
        @Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean;
        @Getter('selectedElementAlertIds', { namespace }) selectedElementAlertIds: Array<string> | null;
        @Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction;
        @Action('modifySelectedAlertStatus', { namespace }) modifySelectedAlertStatus: CallableFunction;
        @Action('flairDialogSetToTrue', { namespace }) flairDialogSetToTrue: CallableFunction;

        resizeDivs: Array<HTMLDivElement> = []
        tableMouseMove: any = null
        tableMouseUp: any = null
        changingElements: boolean = true
        plain_alert_columns = plain_alert_columns
        lastSelectedIndex: number = -1
        ignoreSelectedAlertChanges: boolean = false

        async onAlertSelected(isSelected: boolean, index: number, select: CallableFunction, e: MouseEvent) {
            this.lastSelectedIndex = index
            if (!e.shiftKey && !e.ctrlKey) {
                // For performance reasons, don't let watchers run when clearing the selected alerts
                this.ignoreSelectedAlertChanges = true
                this.selectedAlerts = []
                await 0 // allow watches to fire
                this.ignoreSelectedAlertChanges = false
                // Select this alert and deselect other alerts on single click
                select(true)
            }
            else {
                // Perform normal selection functionality when shift/ctrl held down
                select(!isSelected)
            }
        }

        preventTextSelection(e: MouseEvent) {
            if (e.ctrlKey || e.shiftKey) {
                document.getSelection()?.removeAllRanges()
            }
        }

        isObjectOrArray(value: string) {
            try {
                let obj = JSON.parse(value)
                if (Array.isArray(obj)) {
                    return obj
                }
                else {
                    return false
                }
            }
            catch (e) {
                return false
            }

        }
        selectedAlerts = []

        @Watch('selectedAlerts')
        async onAlertIdsChanged(newVal: Array<any>, oldVal: Array<any>) {
            if (!this.ignoreSelectedAlertChanges) {
                let alertIds = newVal.map(alert => alert.id)
                await this.modifySelectedAlertIds({ alertIds: alertIds })
            }
        }

        // Extra watch to handle deleted alerts (performance issues?)
        @Watch('selectedElementAlertIds')
        async onSelectedAlertIdsChanged(newVal: Array<any>) {
            if (newVal && newVal.length == 0 && this.selectedAlerts.length > 0) {
                this.selectedAlerts = []
            }
        }

        onPromotedSelected(promotedIds: Array<number>) {
            const navDst: string = "/" + "events" + "/" + promotedIds[0]
            if (this.$router.currentRoute.path != navDst && promotedIds.length == 1) {
                this.$router.push(navDst)
            }
        }

        mounted() {
            document.addEventListener('keydown', this.handleKeyboardShortcuts)
            this.addColumnResizers()
        }

        async beforeDestroy() {
            document.removeEventListener("keydown", this.handleKeyboardShortcuts)
        }

        async handleKeyboardShortcuts(e: KeyboardEvent) {
            // Check for event target so this doesn't fire if someone's typing in a text box or something
            if (e.target && (e.target as HTMLElement).tagName == 'BODY' && !(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)) {
                if (e.code == "ArrowUp") {
                    const upIndex = this.lastSelectedIndex > 0 ? this.lastSelectedIndex - 1 : 0
                    const upElement = document.getElementById('AlertRow' + upIndex)
                    if (upElement) {
                        upElement.click()
                        upElement.scrollIntoView({ block: "nearest" })
                        e.preventDefault()
                    }
                }
                if (e.code == "ArrowDown") {
                    const downIndex = this.lastSelectedIndex < 0 ? 0 : this.lastSelectedIndex + 1
                    const downElement = document.getElementById('AlertRow' + downIndex)
                    if (downElement) {
                        downElement.click()
                        downElement.scrollIntoView({ block: "nearest" })
                        e.preventDefault()
                    }
                }
                if (e.key == 'c' && this.selectedElementAlertIds && this.selectedElementAlertIds.length > 0) {
                    await this.modifySelectedAlertStatus({ selectedAlertIds: this.selectedElementAlertIds, newStatus: IRElementStatus.Closed })
                }
                else if (e.key == 'c' && (!this.selectedElementAlertIds || this.selectedElementAlertIds.length == 0)) {
                    // Close all open alerts if no alert selected
                    const allAlertIds = this.vuetifyAlertGroupTableRows.filter(row => row.status == 'open').map(row => row.id)
                    await this.modifySelectedAlertStatus({ selectedAlertIds: allAlertIds, newStatus: IRElementStatus.Closed })
                }
                if (e.key == 'o' && this.selectedElementAlertIds && this.selectedElementAlertIds.length > 0) {
                    await this.modifySelectedAlertStatus({ selectedAlertIds: this.selectedElementAlertIds, newStatus: IRElementStatus.Open })
                }
                else if (e.key == 'o' && (!this.selectedElementAlertIds || this.selectedElementAlertIds.length == 0)) {
                    // Open all closed alerts if no alert selected
                    const allAlertIds = this.vuetifyAlertGroupTableRows.filter(row => row.status == 'closed').map(row => row.id)
                    await this.modifySelectedAlertStatus({ selectedAlertIds: allAlertIds, newStatus: IRElementStatus.Open })
                }
            }
        }

        @Watch("selectedElement")
        async onSelectedElementChange(oldVal: IRElement, newVal: IRElement) {
            // Clear selected alerts when we change alertgroups
            if (oldVal.id != newVal.id) {
                this.selectedAlerts = []
                this.changingElements = true
            }
        }

        @Watch('entitiesLoaded')
        async onEntitiesLoaded(newVal: boolean) {
            if (newVal && this.changingElements) {
                this.changingElements = false
                this.removeColumnResizers()
                await this.$nextTick()
                this.addColumnResizers()
            }
        }

        addColumnResizers() {
            // Modified from here: https://stackoverflow.com/questions/65313966/vuetify-v-data-table-drag-and-resizable-columns-together
            const tables = this.$el.getElementsByTagName('table');
            if (tables.length > 0) {
                // Get the table and its first row
                const table = tables[0]
                const row = table.getElementsByTagName('tr')[0],
                    cols: any = row ? row.children : undefined;
                if (!cols) return;
                var resizerHeight = '32'; // No longer table height because of problems with sticky headers
                // Create the draggable divs between each column
                const resizeDivs = [];
                var pageX: any, curCol: any, nxtCol: any, curColWidth: any, nxtColWidth: any;
                for (var i = 0; i < cols.length; i++) {
                    const div = createDiv(resizerHeight);
                    cols[i].appendChild(div);
                    // Add event listener when someone clicks and drags on the resize div
                    div.addEventListener('mousedown', function (e: any) {
                        curCol = e.target?.parentElement;
                        nxtCol = curCol.nextElementSibling;
                        pageX = e.pageX;
                        var padding = paddingDiff(curCol);
                        curColWidth = curCol.offsetWidth - padding;
                        if (nxtCol)
                            nxtColWidth = nxtCol.offsetWidth - padding;
                    });
                    resizeDivs.push(div)
                }
                // Add event listeners on the whole document for mouseup
                document.addEventListener('mousemove', tableMouseMove);
                document.addEventListener('mouseup', tableMouseUp);

                //Save stuff for deregistering later
                this.tableMouseMove = tableMouseMove
                this.tableMouseUp = tableMouseUp
                this.resizeDivs = resizeDivs
            }

            // Extra utility functions
            function createDiv(height: any) {
                var div = document.createElement('div');
                div.style.top = '0';
                div.style.right = '0';
                div.style.width = '5px';
                div.style.position = 'absolute';
                div.style.cursor = 'col-resize';
                div.style.userSelect = 'none';
                div.style.height = height + 'px';
                return div;
            }

            function paddingDiff(col: any) {

                if (getStyleVal(col, 'box-sizing') == 'border-box') {
                    return 0;
                }

                var padLeft = getStyleVal(col, 'padding-left');
                var padRight = getStyleVal(col, 'padding-right');
                return (parseInt(padLeft) + parseInt(padRight));

            }

            function getStyleVal(elm: any, css: any) {
                return (window.getComputedStyle(elm, null).getPropertyValue(css))
            }

            function tableMouseUp(e: any) {
                // If we were dragging a column, stop the next click event from firing
                if (curCol) {
                    document.addEventListener('click', function (e: any) {
                        e.stopPropagation()
                    }, { once: true, capture: true })
                }
                curCol = undefined;
                nxtCol = undefined;
                pageX = undefined;
                nxtColWidth = undefined;
                curColWidth = undefined;
            }

            function tableMouseMove(e: any) {
                if (curCol) {
                    var diffX = e.pageX - pageX;
                    //if (nxtCol) // This is disabled for now - making a column bigger does not make an adjacent column smaller
                    //    nxtCol.style['min-width'] = (nxtColWidth - (diffX)) + 'px';
                    curCol.style['min-width'] = (curColWidth + diffX) + 'px';
                }
            }
        }

        removeColumnResizers() {
            // Remove extraneous resize divs and event listeners
            if (this.tableMouseMove) {
                if (this.tableMouseUp) {
                    document.removeEventListener('mouseup', this.tableMouseUp)
                }
                if (this.tableMouseMove) {
                    document.removeEventListener('mousemove', this.tableMouseMove)
                }
                for (const div of this.resizeDivs) {
                    div.remove()
                }
                this.resizeDivs = []
                this.tableMouseMove = null
                this.tableMouseUp = null
            }
        }
    }
</script>

<style scoped>
    .theme--dark .selectedRow {
        background-color: steelblue;
    }

    .theme--dark .selectedRow:hover {
        cursor: pointer;
        background-color: steelblue !important;
    }

    .theme--light tr td:nth-of-type(odd) {
        background-color: rgba(0, 0, 0, .08);
    }

    .theme--dark tr td:nth-of-type(odd) {
        background-color: rgba(0, 0, 0, 0.5)
    }

    .selectedRow {
        background-color: skyblue;
    }

    .selectedRow:hover {
        cursor: pointer;
        background-color: skyblue !important;
    }

    .notSelectedRow:hover {
        cursor: pointer
    }

    .promotedAlertStatus {
        cursor: pointer;
    }

    .alert-cell {
        width: 150px;
        max-width: 200px;
        max-height: 200px;
        overflow: auto;
        min-height: 22px;
        overflow-wrap: break-word;
        padding: 0px 8px !important;
    }

    .alert-container {
        max-height: 200px;
        display: inline-block;
        overflow: auto;
        width: 100%;
    }
</style>
