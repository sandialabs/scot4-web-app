<template>
    <v-dialog v-model="dialogOpen" max-width="800px">
        <v-card v-if="target != null && target != undefined" :loading="loading" class="flex-column-noscroll">
            <v-card-title v-if="allowedTypes.length == 1 && allowedTypes[0] == 'read'">{{ targetElementType }} {{ target.id }} View History</v-card-title>
            <v-card-title v-else>{{ targetElementType }} {{ target.id }} Edit History</v-card-title>
            <v-card-text class="scroll-child">
                <div v-for="audit in filteredHistory()" v-html="auditEntryDisplay(audit)" :key="audit.id">
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="dialogOpen = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
    import { Getter, Action } from 'vuex-class'
    import { IRElement, IRElementType } from '../../store/modules/IRElements/types'
    import { Audit } from '../../store/modules/team/types'

    const namespace = "IRElements"

    @Component({
        components: {
        },
    })
    export default class HistoryDialog extends Vue {
        @Prop() target: IRElement | null
        @Prop({ default: false }) value: boolean
        @Prop({ default: () => [] }) allowedTypes: Array<string>

        @Getter('selectedElement', { namespace }) selectedElement: IRElement
        @Action('retrieveElementHistory', { namespace }) retrieveElementHistory: CallableFunction

        loading: boolean = false
        dialogOpen: boolean = false
        showHelp: boolean = false
        submitLoading: boolean = false
        propagateEntriesCheckbox: boolean = false
        targetElementType: IRElementType | null = null
        history: Array<Audit> = []

        async created() {
            if (this.target && 'entry_class' in this.target) { // Target is an entry
                this.targetElementType = IRElementType.Entry
            }
            else if (this.target?.ElementType) {
                this.targetElementType = this.target.ElementType
            }
            this.dialogOpen = this.value
        }

        transformDateString(dateString: string | Date) {
            const date: any = new Date(dateString)
            const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
            return date.toLocaleDateString(undefined, options) + ' ' + date.toLocaleTimeString('en-US')
        }

        @Watch('value')
        async onValueChange(newVal: boolean) {
            this.dialogOpen = newVal
            if (this.dialogOpen) {
                this.getElementHistory()
            }
        }

        @Watch('dialogOpen')
        async onDialogChange(newVal: boolean) {
            this.$emit('input', newVal)
        }

        async getElementHistory() {
            if (this.target != null) {
                this.loading = true
                this.history = []
                if ('entry_class' in this.target) { // Target is an entry
                    this.targetElementType = IRElementType.Entry
                }
                else if (this.target?.ElementType) {
                    this.targetElementType = this.target.ElementType
                }
                this.history = await this.retrieveElementHistory({
                    elementID: this.target.id,
                    elementType: this.targetElementType
                })
                this.loading = false
            }
        }

        filteredHistory() {
            return this.history.filter((a) => (this.allowedTypes.length == 0 || this.allowedTypes.includes(a.what))).sort((a, b) => b.when_date < a.when_date ? 1 : -1)
        }

        auditEntryDisplay(audit: Audit) {
            if (audit.what == 'read') {
                return `${this.transformDateString(audit.when_date)} <b>${audit.username}</b> from IP ${audit.src_ip}`
            }
            if (audit.what == 'update') {
                let finalDisplay = ''
                for (const key in audit.audit_data) {
                    finalDisplay += `${this.transformDateString(audit.when_date)} <b>${audit.username}</b> changed ${key} to ${JSON.stringify(audit.audit_data[key])}`
                }
                return finalDisplay
            }
            if (audit.what == 'create') {
                return `${this.transformDateString(audit.when_date)} <b>${audit.username}</b> created ${audit.thing_type} ${audit.thing_id}`
            }
            if (audit.what == 'delete') {
                return `${this.transformDateString(audit.when_date)} <b>${audit.username}</b> deleted ${audit.thing_type} ${audit.thing_id}`
            }
            return 'NO FORMAT'
        }
    }
</script>

<style>
    .v-dialog{
        display: flex;
        flex-direction: column;
    }

    .flex-column-noscroll {
        min-height: 100%;
        display: flex;
        flex-direction: column;
    }

    .scroll-child {
        max-height: 100%;
        overflow-y: auto;
    }
</style>