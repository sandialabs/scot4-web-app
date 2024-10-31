<template>
<v-card :class="{ 'darkmode-summary': entryClass == 'summary' && $vuetify.theme.dark, 'yellow lighten-4': entryClass == 'summary' && !$vuetify.theme.dark, 'ck-content pa-4 content-card table': true }" v-observe-visibility="onVisibilityChange">
  <span v-if="entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType)==null"></span>
  <span v-else-if="!entryFlairedHtml || !entitiesLoaded || (!hasBeenSeen && !isVisible) || !flairVisible" v-html="entryUnflairedHtml"></span>
  <FlairedTextComponent v-else :templateText="entryFlairedHtml"></FlairedTextComponent>
</v-card>
</template>



<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'
import { User } from '@/store/modules/user/types'
import FlairedTextComponent from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/FlairPlugin/FlairedTextComponent.vue'
const namespace: string = 'IRElements';


@Component({
    components: {
        FlairedTextComponent
    },
})

export default class WYSIWYGCellView extends Vue{
    @Prop() entryId: number;
    @Prop({ default: null }) linkedElementType: IRElementType | null
    @Prop({ default: "" }) treePath: string;
    @Prop({ default: null }) linkedElementId: number | null
    @Prop({ default: null }) linkedElementIndex: number | null
    @Action('editEntryModeOn', { namespace }) editEntryModeOn: CallableFunction
    @Action('removeEntryByID', { namespace }) removeEntryByID: CallableFunction
    @Action('addNewEntryWithEditModeOn', { namespace }) addNewEntryWithEditModeOn: CallableFunction;
    @Getter('currentUser', { 'namespace': 'user' }) currentUser: User;
    @Getter('entryById', { namespace }) entryById: CallableFunction
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('elementType', { namespace }) elementType: IRElementType | null;
    @Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean
    @Getter('flairVisible', { namespace }) flairVisible: boolean
    @Action('toggleExpandEntry', { namespace }) toggleExpandEntry: CallableFunction

    isVisible: boolean = false
    hasBeenSeen: boolean = false

    async deleteEntry() {
        await this.removeEntryByID({
            entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex
        })
    }

    async editClicked() {
        await this.editEntryModeOn({
            entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex
        })
    }

    onVisibilityChange(isVisible: boolean, entries: any,) {
        if (this.entitiesLoaded && (isVisible || this.isVisible)) {
            this.hasBeenSeen = true
        }
        this.isVisible = isVisible
    }

    get entryClass() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).entry_class
    }

    get entryUnflairedHtml() {
        if (this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)?.entry_data) {
            return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).entry_data.html
        }
        return undefined
    }

    get entryFlairedHtml() {
        if (this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)?.entry_data) {
            return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)?.entry_data?.flaired_html
        }
        return undefined
    }
}
</script>
<style>
/* CKEditor table styles */
/* I didn't want to do it this way, but we're doing it this way for now */
/* ckeditor5-table/theme/table.css */
.ck-content table {
    display: table;
    border-collapse: collapse;
    border-spacing: 0;
    border: 1px double hsl(0, 0%, 70%);
}
/* ckeditor5-table/theme/table.css */
.ck-content table td,
.ck-content table th {
    min-width: 2em;
    border: 1px solid hsl(0, 0%, 75%);
    padding: .2em;
}
/* ckeditor5-table/theme/table.css */
.ck-content table th {
    font-weight: bold;
    background: hsla(0, 0%, 0%, 5%);
}
/* ckeditor5-table/theme/table.css */
.ck-content[dir="rtl"] th {
    text-align: right;
}
/* ckeditor5-table/theme/table.css */
.ck-content[dir="ltr"] th {
    text-align: left;
}
/* ckeditor5-table/theme/tablecaption.css */
.ck-content > figcaption {
    display: table-caption;
    caption-side: top;
    word-break: break-word;
    text-align: center;
    color: var(--ck-color-table-caption-text);
    background-color: var(--ck-color-table-caption-background);
    padding: .6em;
    font-size: .75em;
    outline-offset: -1px;
}

pre {
    white-space: pre-wrap;
}

.content-card {
    max-height: 100vh;
    overflow: auto;
}

.darkmode-summary {
    background-color: #404000 !important;
}

.theme--dark .ck-content pre {
    color: inherit;
}
</style>