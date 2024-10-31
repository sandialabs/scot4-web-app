<template>
    <v-dialog v-model="dialogOpen" max-width="500px">
        <v-card v-if="target != null && target != undefined">
            <v-card-title>Permissions for {{ targetElementType }} {{ target.id }}</v-card-title>
            <v-card-text>
                <v-autocomplete chips multiple deletable-chips small-chips
                                :items="roles" item-text="name"
                                :loading="loading"
                                return-object
                                label="Read"
                                v-model="currentPermissions['read']"
                                hint="Users with at least one of these roles will be able to view the object and its sub-objects (like entries). Sub-objects may have more restrictive permissions."
                                :persistent-hint="showHelp">
                </v-autocomplete>
                <v-autocomplete chips multiple deletable-chips small-chips
                                :items="roles" item-text="name"
                                :loading="loading"
                                return-object
                                label="Modify"
                                v-model="currentPermissions['modify']"
                                hint="Users with at least one of these roles will be able to modify this object's metadata, as well as create new sub-objects (like entries) in it"
                                :persistent-hint="showHelp">
                </v-autocomplete>
                <v-autocomplete chips multiple deletable-chips small-chips
                                :items="roles" item-text="name"
                                :loading="loading"
                                return-object
                                label="Delete"
                                v-model="currentPermissions['delete']"
                                hint="Users with at least one of these roles will be able to delete this object"
                                :persistent-hint="showHelp">
                </v-autocomplete>
                <v-checkbox v-if="entries.length > 0"
                            label="Propagate to Entries"
                            v-model="propagateEntriesCheckbox"
                            hint="Check to copy these permission changes to this object's entries, this will overwrite any individual permissions on the entries. This is likely necessary if you are making access more permissive."
                            :persistent-hint="showHelp"></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="submit" color="green" :loading="submitLoading">Save Changes</v-btn>
                <v-btn @click="cancel">Cancel</v-btn>
                <v-spacer></v-spacer>
                <v-btn x-small @click="showHelp = true" v-if="!showHelp">Show Help</v-btn>
                <v-btn x-small @click="showHelp = false" v-if="showHelp">Hide Help</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
    import { Getter, Action } from 'vuex-class'
    import { IRElement, PermissionEnum, Entry, IRElementType, NewEntry } from '../../store/modules/IRElements/types'
    import { Role } from '../../store/modules/user/types'

    const namespace = "IRElements"

    @Component({
        components: {
        },
    })
    export default class PermissionsPicker extends Vue {
        @Prop() target: IRElement | null
        @Prop({ default: () => [] }) entries: Array<Entry>
        @Prop({ default: false }) value: boolean

        @Getter('selectedElement', { namespace }) selectedElement: IRElement
        @Getter('roles', { namespace: 'admin' }) roles: Array<Role>
        @Action('retrieveElementPermissions', { namespace }) retrieveElementPermissions: CallableFunction
        @Action('setElementPermissions', { namespace }) setElementPermissions: CallableFunction
        @Action('retrieveRoles', { namespace: 'admin' }) retrieveRoles: CallableFunction

        loading: boolean = false
        dialogOpen: boolean = false
        showHelp: boolean = false
        submitLoading: boolean = false
        propagateEntriesCheckbox: boolean = false
        targetElementType: IRElementType | null = null
        currentPermissions: { [key in PermissionEnum]?: Array<Role> } = {}

        async created() {
            if (this.target && 'entry_class' in this.target) { // Target is an entry
                this.targetElementType = IRElementType.Entry
            }
            else if (this.target?.ElementType) {
                this.targetElementType = this.target.ElementType
            }
            this.loading = true
            this.dialogOpen = this.value
            if (!this.roles || this.roles.length == 0) {
                await this.retrieveRoles()
            }
        }

        async submit() {
            if (this.target != null) {
                this.submitLoading = true
                const suceeded = await this.setElementPermissions({
                    elementID: this.target.id,
                    elementType: this.targetElementType,
                    permissions: this.currentPermissions
                })
                // Propagate to all entries (including child entries) if the checkbox was checked
                if (suceeded && this.propagateEntriesCheckbox) {
                    // Set to keep track of which entries we've already updated (in case of loop/duplicates)
                    const entryIdsUpdated: Set<number> = new Set<number>()
                    const processEntries = async (entry: Entry | NewEntry) => {
                        if (entry.id == undefined || entryIdsUpdated.has(entry.id)) {
                            return
                        }
                        entryIdsUpdated.add(entry.id)
                        if (entry.childEntries && entry.childEntries.length > 0) {
                            await Promise.all(entry.childEntries.map(processEntries))
                        }
                        return this.setElementPermissions({
                            elementID: entry.id,
                            elementType: IRElementType.Entry,
                            permissions: this.currentPermissions
                        })
                    }
                    // Wait until all top-level entries + their children are done processing
                    await Promise.all(this.entries.map(processEntries))
                }
                this.submitLoading = false
                if (suceeded) {
                    this.dialogOpen = false
                }
            }
        }

        async cancel() {
            this.dialogOpen = false
        }

        @Watch('value')
        async onValueChange(newVal: boolean) {
            this.dialogOpen = newVal
        }

        @Watch('dialogOpen')
        async onDialogChange(newVal: boolean) {
            this.$emit('input', newVal)
            if (newVal) {
                await this.getElementPermissions()
                this.propagateEntriesCheckbox = false
            }
        }

        async getElementPermissions() {
            if (this.target != null) {
                this.loading = true
                if ('entry_class' in this.target) { // Target is an entry
                    this.targetElementType = IRElementType.Entry
                }
                else if (this.target?.ElementType) {
                    this.targetElementType = this.target.ElementType
                }
                if (this.targetElementType != IRElementType.Entity) {
                    this.currentPermissions = await this.retrieveElementPermissions({
                        elementID: this.target.id,
                        elementType: this.targetElementType
                    })
                }
                this.loading = false
            }
        }
    }
</script>