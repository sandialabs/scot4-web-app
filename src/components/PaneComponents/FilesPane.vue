<template>
    <v-data-table :headers="filesTableHeaders"
                  :items="retrievingFiles ? []: selectedElementFiles"
                  id="filesTable"
                  v-model=selectedFiles
                  ref="filesTable"
                  show-select
                  single-select
                  :items-per-page=-1
                  :hide-default-footer="true"
                  :loading="retrievingFiles == true">
        <template v-slot:footer>
            <v-divider></v-divider>
            <v-btn color="green" small class="mr-1" @click="setFileDialogVisible(true)">
                <v-icon>
                    mdi-plus-circle
                </v-icon>
                Add File
            </v-btn>
            <v-btn v-if="selectedFiles.length > 0" color="green" small class="mr-1" :href="downloadFiles" target="_blank">
                <v-icon>
                    mdi-file-download
                </v-icon>
                {{selectedFiles.length > 1 ? "Download Files" : "Download File"}}
            </v-btn>
            <v-btn v-if="selectedFiles.length > 0" color="red" small @click="removeFiles">
                <v-icon>
                    mdi-delete
                </v-icon>
                {{selectedFiles.length > 1 ? "Delete Files" : "Delete File"}}
            </v-btn>
        </template>
    </v-data-table>
</template>


<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action, Mutation } from 'vuex-class';
import { IRElement, ScotFile } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';

@Component({
  components: {
    },
})

export default class FilesPane extends Vue {
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('selectedElementFiles', { namespace }) selectedElementFiles: Array<ScotFile>
    @Mutation('setFileDialogVisible', { namespace }) setFileDialogVisible: CallableFunction;
    @Action('retrieveSelectedElementFilesbyID', { namespace }) retrieveSelectedElementFilesbyID: CallableFunction
    @Action('deleteFile', { namespace }) deleteFile: CallableFunction
    @Action('retrieveElementEntriesbyID', { namespace }) retrieveElementEntriesbyID: CallableFunction

    filesTableHeaders: Array<any> = [{ "text": "ID", "value": "id" }, { "text": "File Name", "value": "filename" }, { "text": "File Size", "value": "filesize" }, { "text": "Content Type", "value": "content_type" }]
    tab = null
    selectedFiles: Array<any> = []
    retrievingFiles = false

    async removeFiles() {
        if (this.selectedElement) {
            this.retrievingFiles = true
            await this.deleteFile({ fileId: this.selectedFiles.map((el: any) => el.id), targetId: this.selectedElement.id, targetType: this.selectedElement?.ElementType })
            await this.retrieveSelectedElementFilesbyID({ elementType: this.selectedElement?.ElementType, elementID: this.selectedElement.id })
            this.retrievingFiles = false
        }
    }

    async onFileSelected(isSelected: any, select: any, e: any, entity: any) {
        select(!isSelected)
    }

    get downloadFiles() {
        if (this.selectedElement) {
            const fileId = this.selectedFiles.map(obj => obj.id)[0]
            return `${Vue.axios.defaults.baseURL}/file/download/${fileId}`
        }
        else {
            return null
        }
    }

    async mounted() {
        if (this.selectedElement) {
            this.retrievingFiles = true
            await this.retrieveSelectedElementFilesbyID({ elementType: this.selectedElement?.ElementType, elementID: this.selectedElement.id })
            this.retrievingFiles = false
        }
    }

    @Watch('selectedElement.id')
    async onSelectedElementChange() {
        if (this.selectedElement) {
            this.retrievingFiles = true
            await this.retrieveSelectedElementFilesbyID({ elementType: this.selectedElement?.ElementType, elementID: this.selectedElement.id })
            this.retrievingFiles = false
        }
    }

    @Watch('selectedElementFiles')
    async onSelectedElementFilesChanged(newVal: Array<ScotFile>) {
        if (this.selectedElement) {
            this.selectedElement.file_count = newVal.length
        }
    }
}

</script>