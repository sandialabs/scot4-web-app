<template>
    <v-card flat class="pb-7">
        <v-card-title v-if="selectedStorageProvider.id != -1" class="text-h4">Edit Storage Provider </v-card-title>
        <v-card-title v-else class="text-h4">Create Storage Provider</v-card-title>
        <v-card-text>
            <v-form v-model="formValid">
                <v-container>
                    <v-row>
                        <v-col v-if="selectedStorageProvider.id != -1">
                            <v-text-field :value="selectedStorageProvider.id"
                                          readonly
                                          label="ID"></v-text-field>
                        </v-col> 
                        <v-col>
                            <v-select v-model="selectedStorageProvider.provider"
                                      :items="storageTypes"
                                      :readonly="selectedStorageProvider.id != -1"
                                      label="Type"></v-select>
                        </v-col>
                    </v-row>
                    <span v-if="selectedStorageProvider.config">
                        <span v-for="property in Object.keys(selectedStorageProvider.config)"
                                        :key="property">
                                    <v-checkbox v-if="typeof selectedStorageProvider.config[property] === 'boolean'"
                                                v-model="selectedStorageProvider.config[property]"
                                                :label="storageProviderPrettyNames[selectedStorageProvider.provider][property] || property"
                                                :hint="storageProviderConfigHelp[selectedStorageProvider.provider][property]">
                                    </v-checkbox>
                                    <v-text-field v-else
                                                  v-model="selectedStorageProvider.config[property]"
                                                :label="storageProviderPrettyNames[selectedStorageProvider.provider][property] || property"
                                                :hint="storageProviderConfigHelp[selectedStorageProvider.provider][property]">
                                    </v-text-field>
                        </span>
                    </span>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn color="green" v-if="selectedStorageProvider.id != -1" @click="submitUpdate" :loading="saveLoading">
                Save Changes
                <template v-slot:loader v-if="loadingComplete">
                    <span class="custom-loader">
                        <v-icon>mdi-check</v-icon>
                    </span>
                </template>
            </v-btn>
            <v-btn v-else @click="submitCreate" :loading="saveLoading" color="green">Create</v-btn>
            <v-btn @click="cancel">Cancel</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter, } from 'vuex-class';
    import { StorageProvider, StorageProviderType } from '@/store/modules/admin/types';
    const namespace: string = 'admin'
    @Component({
      components: {
        },
    })

    export default class StorageProviderForm extends Vue{
    @Getter('storageProviderPrettyNames', { namespace }) storageProviderPrettyNames: any
    @Getter('storageProviderConfigHelp', { namespace }) storageProviderConfigHelp: any
    @Getter('selectedStorageProvider', { namespace }) selectedStorageProvider: StorageProvider
    @Getter('storageProviders', { namespace }) storageProviders: Array<StorageProvider>
    @Action('updateStorageProvider', { namespace }) updateStorageProvider: CallableFunction
    @Action('openStorageProviderEdit', { namespace }) openStorageProviderEdit: CallableFunction
    @Action('closeStorageProviderEdit', { namespace }) closeStorageProviderEdit: CallableFunction
    @Action('createStorageProvider', { namespace }) createStorageProvider: CallableFunction
    formValid: boolean = true
    saveLoading: boolean = false
    storageTypes: Array<string> = []
    loadingComplete: boolean = false
        mounted() {
            console.log(this.selectedStorageProvider)
            const keys = Object.keys(StorageProviderType)
            const values = Object.values(StorageProviderType)
            var storageTypes: Array<any> = []
            keys.forEach(function(key, index){
                const newObject = {
                    text: key,
                    value: values[index]
                }
                storageTypes.push(newObject)
            })
            this.storageTypes = storageTypes
        }

        async submitUpdate() {
            this.saveLoading = true
            const succeeded = await this.updateStorageProvider({ id: this.selectedStorageProvider.id, data: this.selectedStorageProvider })
            if (succeeded) {
                this.loadingComplete = true
                await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds
                this.saveLoading = false
                this.loadingComplete = false
            }
            else {
                this.saveLoading = false
            }
        }
        async submitCreate() {
            const createData = {
                provider: this.selectedStorageProvider.provider
            }
            this.saveLoading = true
            const succeeded = await this.createStorageProvider(createData)
            this.saveLoading = false
            if (succeeded) {
                this.openStorageProviderEdit(this.storageProviders[this.storageProviders.length-1])
            }
        }
        cancel() {
            this.closeStorageProviderEdit()
        }
    }
</script>