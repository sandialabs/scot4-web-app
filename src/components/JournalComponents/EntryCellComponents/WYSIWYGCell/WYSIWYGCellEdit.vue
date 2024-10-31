<template>
<v-card elevation="3" :style="getOptionalDarkModeStyle()">

    <VDialog
      v-model="editConfirmDialog"
      max-width="50vw"
      persistent
    >
        <v-card>
            <v-card-title>
                Entry Modified
            </v-card-title>
            <v-card-text>
                This entry was modified by someone else while you were editing it. Submit your edits anyway and overwrite the other edits?
            </v-card-text>
            <v-card-actions>
                <v-btn color="green darken-1" text @click="onSubmit">
                    Confirm
                </v-btn>
                <v-btn color="red darken-1" text @click="editConfirmDialog = false">
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </VDialog>

<ckeditor id="editor" :style="{'height': editorHeight +'px', 'max-height': '100vh' }" :editor="editor" @input="onEditorInput" @ready="onEditorReady" :disabled="!entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType).editMode" v-model=currentEditorInput :config="editorConfig"></ckeditor>

</v-card>
</template>


<script lang="ts">
import { Component, Vue, Prop, Watch} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'
import { User }from '@/store/modules/user/types'
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import CKEditor from '@ckeditor/ckeditor5-vue2'
import { EventInfo } from '@ckeditor/ckeditor5-utils';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import List from '@ckeditor/ckeditor5-list/src/list';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Font from '@ckeditor/ckeditor5-font/src/font';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import DragDrop from '@ckeditor/ckeditor5-clipboard/src/dragdrop'
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableClipboard from '@ckeditor/ckeditor5-table/src/tableclipboard';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold'
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import EditorSavePlugin from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/EditorSavePlugin'
import EditorCancelPlugin from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/EditorCancelPlugin'
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import FlairPlugin from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/FlairPlugin/FlairPlugin'
//import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import { VDialog } from 'vuetify/lib'
const namespace: string = 'IRElements';
import MyUploadPlugin from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/fileUploadPlugin/uploadPlugin'
import ScotUploadAdapter from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/fileUploadPlugin/imageUploadPlugin'

@Component({
  components: {
    ckeditor: CKEditor.component,
    VDialog
    },
})

export default class WYSIWYGCellEdit extends Vue{
@Prop() entryId: number;
@Prop({default: null}) linkedElementType:IRElementType|null
@Prop({default: null}) linkedElementId: number|null
@Prop({default: null}) linkedElementIndex: number|null 
@Prop({default:""}) treePath: string;
@Prop({default: false}) fullScreen: boolean



@Getter('entryById', { namespace }) entryById: CallableFunction
@Getter('selectedElement', { namespace }) selectedElement: IRElement
@Getter('elementType', { namespace }) elementType: IRElementType
@Action('editEntryModeOff', { namespace }) editEntryModeOff: CallableFunction
@Action('cacheEditorContent', { namespace }) cacheEditorContent: CallableFunction
@Action('retrieveCachedEditorContent', { namespace }) retrieveCachedEditorContent: CallableFunction
@Action('updateOrCreateEntryContent', { namespace }) updateOrCreateEntryContent: CallableFunction
@Getter('currentUser', { 'namespace':'user' }) currentUser: User;
@Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean


@Watch('entitiesLoaded')
async onChange(oldVal:boolean, newVal:boolean){
  if(this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, 
  this.linkedElementType).entry_data.flaired_html){
      this.currentEditorInput = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, 
  this.linkedElementType).entry_data.flaired_html
  }
}

editorReadOnly = false

splunkTableData = ""
htmlFormatted = ""
editConfirmDialog = false
modifiedDateOnEdit = null
currentEditorInput: string = ""
editor: any = ClassicEditor
editorConfig: any =
{
    plugins: [
        EssentialsPlugin,
        ItalicPlugin,
        BoldPlugin,
        Strikethrough,
        Underline,
        Superscript,
        Subscript,
        LinkPlugin,
        ParagraphPlugin,
        Font,
        FontFamily,
        FontSize,
        FontColor,
        FontBackgroundColor,
        Alignment,
        ParagraphButtonUI,
        PasteFromOffice,
        Image,
        ImageUpload,
        ImageCaption,
        ImageToolbar,
        ImageStyle,
        AutoImage,
        CodeBlock,
        Table,
        TableClipboard,
        TableToolbar,
        TableProperties,
        TableCellProperties,
        TableCaption,
        TableColumnResize,
        List,
        ListProperties,
        Heading,
        Clipboard,
        ParagraphButtonUI,
        GeneralHtmlSupport,
        FlairPlugin,
        SourceEditing,
        MyUploadPlugin,
        ImageResize,
        Code,
        ScotUploadAdapter
    ],
    extraPlugins: [EditorSavePlugin, EditorCancelPlugin],
    htmlSupport: {
        allow: [{ name: "pre" }],
        disallow: []
    },
    simpleUpload: {
        uploadUrl: 'http://localhost',
    },
    scotUpload: {
        uploadFunction: this.onUploadFile
    },
    image: {
        toolbar: [
            'imageStyle:inline', 'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', '|',
            'toggleImageCaption'
        ]
    },
    list: {
        properties: {
            styles: true,
            startIndex: true,
            reversed: true
        }
    },
    table: {
        contentToolbar: ['toggleTableCaption', '|', 'tableColumn', 'tableRow', 'mergeTableCells', '|', 'tableProperties', 'tableCellProperties'],
        tableProperties: {
            defaultProperties: {
                float: 'left'
            }
        }
    },
    toolbar: {
        items: [
            'editorSavePlugin',
            'editorCancelPlugin',
            '-',
            'undo',
            'redo',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'code',
            'subscript',
            'superscript',
            'link',
            '|',
            'fontColor',
            'fontBackgroundColor',
            'fontSize',
            'fontFamily',
            'heading',
            '|',
            'alignment',
            'bulletedList',
            'numberedList',
            'insertTable',
            '|',
            'sourceEditing',
            //'insertFile' Disabled until we support file entry types
        ],
        shouldNotGroupWhenFull: true
    }
}

editorHeight: string|number = "fit-content"

onEditorReady(editor: any) {
    // Disable editor inspector for now
    // CKEditorInspector.attach(editor)
    editor.entryId = this.entryId
    editor.fullScreen = this.fullScreen

    editor.editing.view.change((writer: any) => {
        writer.setStyle('height', this.editorHeight + 'px', editor.editing.view.document.getRoot())
    })

    const toolbarElement = editor.ui.view.toolbar.element;
    if (this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
        this.linkedElementType).editMode != true) {
        toolbarElement.style.display = 'none'
        this.currentEditorInput = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
            this.linkedElementType).entry_data.html
    }
    else {
        toolbarElement.style.display = 'flex'
        this.currentEditorInput = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
            this.linkedElementType).entry_data.html
    }

    editor.on('change:isReadOnly', (evt: any, propertyName: any, isReadOnly: any) => {
        if (isReadOnly) {
            toolbarElement.style.display = 'none';
            this.currentEditorInput = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
                this.linkedElementType).entry_data.html

        } else {
            toolbarElement.style.display = 'flex';
            this.currentEditorInput = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
                this.linkedElementType).entry_data.html
        }
    });
}

async onEditorInput(e: string) {
    this.currentEditorInput = e
    let entryObj = null
    entryObj = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)
    const entryType = entryObj.entry_class
    const entryOwner = entryObj.owner
    const entryTLP = entryObj.tlp
    if (entryObj.editMode == true) {
        await this.cacheEditorContent({
            editorContent: e, entryId: this.entryId, elementId: this.selectedElement.id, elementType: this.elementType, entryType: entryType, owner: entryOwner, tlp: entryTLP,
            linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId, linkedElementIndex: this.linkedElementIndex, treePath: this.treePath
        })
    }

}

async onUploadFile(file: Blob, progressCallback: any, abortController: AbortController) {
    if (this.entryId == -1) {
        return await Vue.prototype.$api.file.createFile(file, undefined, undefined, progressCallback, abortController)
    }
    else {
        return await Vue.prototype.$api.file.createFile(file, IRElementType.Entry, this.entryId, progressCallback, abortController)
    }
}

async onSubmit() {
    //Make an api call to update and refresh the entry
    return await this.updateOrCreateEntryContent({
        entryId: this.entryId, elementId: this.selectedElement.id, elementType: this.elementType, entryOwner: this.currentUser.username,
        entryContent: { html: this.currentEditorInput ? this.currentEditorInput : "" }, linkedElementType: this.linkedElementType,
        linkedElementId: this.linkedElementId, linkedElementIndex: this.linkedElementIndex, treePath: this.treePath
    })
}

async onCancel() {
    await this.editEntryModeOff({
        entryId: this.entryId, elementId: this.selectedElement.id, elementType: this.elementType,
        linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId, linkedElementIndex: this.linkedElementIndex, treePath: this.treePath
    })
    if (this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
        this.linkedElementType) != undefined && this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
            this.linkedElementType).entry_data) {
        this.currentEditorInput = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
            this.linkedElementType).entry_data.flaired_html
    }
    else {
        if (this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
            this.linkedElementType)) {
            this.currentEditorInput = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
                this.linkedElementType).entry_data.html
        }

    }
}

    async mounted() {
        this.editorConfig.scotUpload.entryId = this.entryId
        this.modifiedDateOnEdit = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
            this.linkedElementType).modified
        // First check the indexedDB for any current entry cells that have cached editor content
        await this.$nextTick()
        if (this.fullScreen) {
            let top = document.getElementById('editor')?.getBoundingClientRect().top
            let bottom = window.innerHeight
            if (top) {
                this.editorHeight = bottom - top - 52
            }
        }
        // Kill all old listeners, if there are any
        this.$root.$off(`onEditorSave+${this.entryId}+${this.fullScreen}`)
        this.$root.$on(`onEditorSave+${this.entryId}+${this.fullScreen}`, async ({ entryId, submitButtonView }: { entryId: number, submitButtonView: any }) => {
            if (this.entryId == entryId) {
                if (this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex,
                    this.linkedElementType).modified != this.modifiedDateOnEdit) {
                    this.editConfirmDialog = true
                }
                else {
                    const result = await this.onSubmit()
                    if (!result) {
                        submitButtonView.isEnabled = true
                    }
                }
            }
        })

        this.$root.$off(`onEditorCancel+${this.entryId}+${this.fullScreen}`)
        this.$root.$on(`onEditorCancel+${this.entryId}+${this.fullScreen}`, async (entryId: number) => {
            if (this.entryId == entryId) {
                await this.onCancel()
            }
        })

        await this.retrieveCachedEditorContent({
            entryId: this.entryId, elementId: this.selectedElement.id, elementType: this.elementType,
            linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId, linkedElementIndex: this.linkedElementIndex, treePath: this.treePath
        })

    }

    getOptionalDarkModeStyle() {
        // This is a custom dark mode ckeditor theme based on https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/theme-customization.html
        if (this.$vuetify.theme.dark) {
            document.documentElement.style.setProperty('--ck-color-base-background', 'rgb(39, 39, 39)')
            document.documentElement.style.setProperty('--ck-color-base-foreground', 'hsl(255, 3%, 18%)')
            document.documentElement.style.setProperty('--ck-color-base-text', 'rgb(255, 255, 255, 0.98)')
            document.documentElement.style.setProperty('--ck-color-base-border', 'hsl(300, 1%, 32%)')
            return {
                '--ck-color-button-default-background': 'rgb(39, 39, 39)',
                '--ck-color-toolbar-background': 'rgb(39, 39, 39)',
                '--ck-color-panel-background': 'rgb(39, 39, 39)',

                '--ck-color-button-default-hover-background': 'hsl(270, 1%, 22%)',
                '--ck-color-button-default-active-background': 'hsl(270, 2%, 20%)',
                '--ck-color-button-default-active-shadow': 'hsl(270, 2%, 23%)',
                '--ck-color-button-default-disabled-background': 'rgb(39, 39, 39)',

                '--ck-color-button-on-background': 'rgb(64, 64, 64)',
                '--ck-color-button-on-hover-background': 'hsl(255, 4%, 16%)',
                '--ck-color-button-on-active-background': 'hsl(255, 4%, 14%)',
                '--ck-color-button-on-active-shadow': 'hsl(240, 3%, 19%)',
                '--ck-color-button-on-disabled-background': 'rgb(64, 64, 64)',

                '--ck-color-button-action-background': 'hsl(168, 76%, 42%)',
                '--ck-color-button-action-hover-background': 'hsl(168, 76%, 38%)',
                '--ck-color-button-action-active-background': 'hsl(168, 76%, 36%)',
                '--ck-color-button-action-active-shadow': 'hsl(168, 75%, 34%)',
                '--ck-color-button-action-disabled-background': 'hsl(168, 76%, 42%)',
                '--ck-color-button-action-text': 'rgb(255, 255, 255)',

                '--ck-color-dropdown-panel-background': 'rgb(39, 39, 39)',
                '--ck-color-dropdown-panel-border': 'rgb(64, 64, 64)',

                '--ck-color-split-button-hover-background': 'var(--ck-color-button-default-hover-background)',
                '--ck-color-split-button-hover-border': 'rgb(64, 64, 64)',

                '--ck-color-focus-border': 'hsl(208, 90%, 62%)',
            }
        }
        else {
            document.documentElement.style.setProperty('--ck-color-base-background', '#fff')
            document.documentElement.style.setProperty('--ck-color-base-foreground', '#fafafa')
            document.documentElement.style.setProperty('--ck-color-base-text', '#333')
            document.documentElement.style.setProperty('--ck-color-base-border', '#c4c4c4')
            return {}
        }
    }

}
</script>

<style>
.ck.ck-toolbar > .ck-toolbar__items {
    margin-right: 156px;
}

.large-right-neg-margin {
    margin-right: -156px !important;
}

.ck-editor__editable {
    max-height: 100vh;
    min-height: 180px;
}

.flairEntity{
  background-color: yellow;
}

.theme--dark .ck-source-editing-area textarea {
    color: white;
}

.flairEntity:hover{
  cursor: pointer;
}

</style>
