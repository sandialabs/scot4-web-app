<template>
    <v-card :loading="loading">
        <v-list>
            <v-list-item-group>
                <v-list-item v-ripple="false" v-for="body, idx in sigBodies" :key=idx>
                    <v-list-item-content>
                        <v-textarea readonly auto-grow outlined @click.prevent.stop="" label="Signature Body" :value="body"></v-textarea>
                    </v-list-item-content>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';

@Component({
  components: {
    },
})

export default class SignatureBodyPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null

    sigSelected: IRElement | null = null
    sigBodies: Array<any> | null = null
    loading: boolean = false

    async mounted() {
        if (this.selectedElement?.ElementType == IRElementType.Signature) {
            this.sigSelected = this.selectedElement
            this.loadSignatureBodies()
        }
        else {
            this.sigSelected = null
        }
    }

    @Watch('selectedElement')
    async onSelectedElementChange(newval: IRElement, oldval: IRElement) {
        if (newval && newval != oldval) {
            this.sigSelected = newval
            await this.loadSignatureBodies()
        }
    }

    async loadSignatureBodies() {
        this.loading = true
        if (this.sigSelected && this.sigSelected.data.signature_body) {
            if (!Array.isArray(this.sigSelected.data.signature_body)) {
                this.sigBodies = [this.sigSelected.data.signature_body]
            }
            else {
                this.sigBodies = this.sigSelected.data.signature_body
            }
        }
        else {
            this.sigBodies = null
        }
        this.loading = false
    }
}
</script>