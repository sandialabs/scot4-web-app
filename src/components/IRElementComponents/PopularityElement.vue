<template>
    <div v-if="this.showPopularity">
        <div v-if="entry == undefined" class="d-flex flex-column mx-n2">
            <v-btn @click="upvote($event)" :loading="loading" title="Up Vote" x-small text>
                <v-icon small :color="upvote_color">mdi-arrow-up-bold</v-icon>
            </v-btn>
            <v-chip small :text-color="text_color" class="font-weight-bold align-self-center popularity-count" outlined label>{{ count }}</v-chip>
            <v-btn @click="downvote" :loading="loading" title="Down Vote" x-small text>
                <v-icon small :color="downvote_color">mdi-arrow-down-bold</v-icon>
            </v-btn>
        </div>
        <div v-else class="d-sm-inline-flex">
            <v-btn @click="upvote($event)" :loading="loading" title="Up Vote" x-small text>
                <v-icon :color="upvote_color" small>mdi-arrow-up-bold</v-icon>
            </v-btn>
            <v-chip :text-color="text_color" style="height: 100% !important" class="font-weight-bold px-1 align-self-center popularity-count" outlined label>{{ count }}</v-chip>
            <v-btn @click="downvote" :loading="loading" title="Down Vote" x-small text>
                <v-icon :color="downvote_color" small>mdi-arrow-down-bold</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { Action, Getter } from 'vuex-class'
    import { IRElement, IRElementType } from '../../store/modules/IRElements/types'

    const namespace = "IRElements"

    @Component({
        components: {},
    })

    export default class PopularityElement extends Vue {
        @Prop({ default: 0 }) count: number
        @Prop({ default: 0}) elementID: number
        @Prop({ default: undefined }) voted: string
        @Prop({ default: IRElementType.Entry}) elementType: IRElement
        @Prop({ default: undefined }) entry: any
        @Getter('showPopularity', { 'namespace': 'user' }) showPopularity: boolean
        @Getter('vuetifyQueueTableRows', { namespace }) vuetifyQueueTableRows: Array<any> | null;
        @Action('upvoteElement', { namespace }) upvoteElement: CallableFunction
        @Action('downvoteElement', { namespace }) downvoteElement: CallableFunction
        
        loading: boolean = false
        upvote_color: string = ""
        downvote_color: string = ""
        text_color: string = ""

        setColors() {
            this.loading = true
            if (this.voted) {
                if (this.voted == "upvote") {
                    this.upvote_color = "deep-orange"
                    this.downvote_color = ""
                }
                else if (this.voted == "downvote") {
                    this.upvote_color = ""
                    this.downvote_color = "blue"
                }
                else {
                    this.upvote_color = ""
                    this.downvote_color = ""
                }
            }
            else {
                this.upvote_color = ""
                this.downvote_color = ""
            }
            if (this.count > 0) {
                this.text_color = "deep-orange"
            }
            else if (this.count < 0) {
                this.text_color = "blue"
            }
            else {
                this.text_color = ""
            }
            this.loading = false
        }

        async created() {
            this.setColors()
        }

        async upvote(event: any) {
            event.stopPropagation()
            if (this.entry !== undefined) {
                await this.upvoteElement({
                    elementID: this.entry.entryId,
                    elementType: IRElementType.Entry,
                    treePath: this.entry.treePath,
                    linkedElementType: this.entry.linkedElementType,
                    linkedElementIndex: this.entry.linkedElementIndex
                })
            }
            else {
                await this.upvoteElement({
                    elementID: this.elementID,
                    elementType: this.elementType
                })
            }

            this.setColors()
        }

        async downvote(event: any) {
            event.stopPropagation()
            if (this.entry !== undefined) {
                await this.downvoteElement({
                    elementID: this.entry.entryId,
                    elementType: IRElementType.Entry,
                    treePath: this.entry.treePath,
                    linkedElementType: this.entry.linkedElementType,
                    linkedElementIndex: this.entry.linkedElementIndex
                })
            }
            else {
                await this.downvoteElement({
                    elementID: this.elementID,
                    elementType: this.elementType
                })
            }
            this.setColors()
        }
    }
</script>
<style>
    .popularity-count {
        height: 10px !important;
        border: none !important;
    }
</style>