<template>
    <v-sheet>
        <v-simple-table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Storage Provider Name</th>
                    <th>Storage Provider Type</th>
                    <th>Active</th>
                    <th>Edit/Delete</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="storageProvider in storageProviders" :key="storageProvider.id">
                    <td>{{ storageProvider.id }}</td>
                    <td>{{ storageProvider.config['provider_name'] }}</td>
                    <td>{{ storageProvider.provider }}</td>
                          <v-switch :loading="activeSwitchesLoading[storageProvider.id]"
                              :input-value="storageProvider.enabled"
                              @click.native.prevent.stop.capture="activeSwitchChange(storageProvider.id, storageProvider.enabled)">
                    </v-switch>
                    <td style="min-width: 110px">
                    <v-btn icon @click.stop="openStorageProviderEdit(storageProvider)"><v-icon>mdi-pencil</v-icon></v-btn>
                    <v-btn icon @click.stop="openStorageProviderDeleteDialog(storageProvider)">
                        <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                    </td>
                </tr>
            </tbody>
        </v-simple-table>
    </v-sheet>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class';
    import { User, StorageProvider } from '@/store/modules/admin/types'

    const namespace: string = 'admin'
    @Component({
        components: {
        },
    })

    export default class StorageProviderTable extends Vue {
        @Action('retrieveStorageProviderHelp', { namespace }) retrieveStorageProviderHelp: CallableFunction
        @Action('retrieveStorageProviders', { namespace }) retrieveStorageProviders: CallableFunction
        @Getter('storageProviders', { namespace }) storageProviders: Array<StorageProvider>
        @Action('openStorageProviderEdit', { namespace }) openStorageProviderEdit: CallableFunction
        @Action('updateStorageProvider', { namespace }) updateStorageProvider: CallableFunction

        @Action('openStorageProviderDeleteDialog', { namespace }) openStorageProviderDeleteDialog: CallableFunction
        async mounted() {
            await this.retrieveStorageProviders()
            await this.retrieveStorageProviderHelp()
        }

        activeSwitchesLoading: Array<boolean> = []

        async activeSwitchChange(storageProviderID: number, oldValue: boolean) {
            const updateData = { enabled: !oldValue }
            this.$set(this.activeSwitchesLoading, storageProviderID, true)
            await this.updateStorageProvider({ "id": storageProviderID, "data": updateData })
            this.$set(this.activeSwitchesLoading, storageProviderID, false)
        }
    }
</script>
