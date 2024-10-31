<template>
    <span class="mb-n1">
        <v-btn small icon v-if="expand === false" color="green" class="spanChild" @click="onEntityClassAdd">
            <v-icon dense>
                mdi-plus
            </v-icon>
        </v-btn>
        <v-combobox v-show="expand"
                    class="spanChild mb-n4"
                    v-model="select"
                    :items="autoCompleteEntityClasses"
                    :filter="filter"
                    label="Entity Class"
                    :menu-props="{closeOnContentClick:true}"
                    :search-input.sync="searchInput"
                    auto-select-first
                    multiple
                    outlined
                    dense>

            <template v-slot:selection="data">
                <v-chip small
                        :key="data.item.name"
                        :disabled="data.disabled"
                        @click="data.select">

                    <v-icon v-if="data.item.icon" left>
                        {{data.item.icon}}
                    </v-icon>
                    <span v-if="data.item.display_name">
                        {{ data.item.display_name }}
                    </span>
                    <span v-else>
                        {{ data.item }}
                    </span>
                </v-chip>
            </template>

            <template v-slot:item="{parent, item, on, attrs}">
                <v-list-item @click.stop="itemClicked(parent, item, on, attrs)" :input-value="select.includes(item)" color="primary">
                    <v-icon class="pr-2">
                        {{item.icon}}
                    </v-icon>
                    {{item.display_name}}
                </v-list-item>
            </template>

        </v-combobox>
        <v-btn color="green" v-if="expand === true && submitting == false" class="spanChild" :icon=true @click="onEntityClassSubmit">
            <v-icon>
                mdi-check
            </v-icon>
        </v-btn>
        <v-progress-circular v-if="expand === true && submitting == true" indeterminate class="spanChild">
        </v-progress-circular>
    </span>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class';
    import { IRElement, IRElementType } from '@/store/modules/IRElements/types'
    import { User } from '@/store/modules/user/types';
    const namespace: string = 'IRElements';
    @Component({
        components: {
        },
    })

    export default class EntityClassComboBox extends Vue {
        @Getter('currentUser', { 'namespace': 'user' }) currentUser: User;
        @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
        @Getter('elementType', { namespace }) elementType: IRElementType | null;
        @Getter('autoCompleteEntityClasses', { namespace }) autoCompleteEntityClasses: Array<any> | undefined;
        @Action('submitEntityClasses', { namespace }) submitEntityClasses: CallableFunction
        @Action('retrieveAllEntityClasses', { namespace }) retrieveAllEntityClasses: CallableFunction
        @Prop(Number) readonly entityId: number
        @Prop({ default: null }) readonly callback: CallableFunction | null

        expand: boolean = false
        submitIconName: string = "mdi-check"
        submitting: boolean = false
        searchInput: string = ""

        selectArray(): Array<any> {
            return Array.from(this.select)
        }

        async onEntityClassAdd() {
            this.expand = !this.expand
            if (this.autoCompleteEntityClasses == undefined || this.autoCompleteEntityClasses.length == 0) {
                this.retrieveAllEntityClasses()
            }
        }

        select: Array<any> = []
        itemClicked(parent: any, item: any, on: any, attrs: any) {
            if (this.select.indexOf(item) == -1) {
                this.select.push(item)
                this.searchInput = ""
            }
        }

        async onEntityClassSubmit() {
            if (this.selectedElement) {
                this.submitting = true
                let newEntityClasses = []
                for (const item of this.select) {
                    if (item.name) {
                        newEntityClasses.push(item.name)
                    }
                    else {
                        newEntityClasses.push(item)
                    }
                }
                await this.submitEntityClasses({ newEntityClasses: newEntityClasses, targetEntityId: this.entityId })
                this.submitting = false
                this.select = []
                this.expand = false
                if (this.callback) {
                    this.callback()
                }
            }
        }

        filter(item: any, queryText: any) {
            if (item.header) {
                return false
            }
            const hasValue = (val: any) => val != null ? val : ''
            const query = hasValue(queryText)
            return item.display_name.toString()
                .toLowerCase()
                .indexOf(query.toString().toLowerCase()) > -1
        }
    }
</script>
<style>

.spanChild {
  display: inline-block;
  
}

</style>