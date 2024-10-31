<template>
    <v-simple-table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Provider Name</th>
                <th>Active</th>
                <th>Edit/Delete</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="auth in authMethods" 
                    :key="auth.id" 
                    :class="selectedAuthMethod && selectedAuthMethod.id == auth.id ? 'blue lighten-4' : 'transparent'">
                <td>{{ auth.id }}</td>
                <td>{{ auth.auth }}</td>
                <td>{{ auth.auth_properties.provider_name || '' }}</td>
                <td>
                    <v-switch :loading="activeSwitchesLoading[auth.id]"
                              :input-value="auth.auth_active"
                              @click.native.prevent.stop.capture="activeSwitchChange(auth.id, auth.auth_active)">
                    </v-switch>
                </td>
                <td>
                    <v-btn icon @click.stop="openAuthMethodEdit(auth)"><v-icon>mdi-pencil</v-icon></v-btn>
                    <v-btn icon @click.stop="openAuthMethodDeleteDialog(auth)">
                        <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                </td>
            </tr>
        </tbody>
    </v-simple-table>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class';
    import { AuthMethod } from '@/store/modules/admin/types'

    const namespace: string = 'admin'
    @Component({
      components: {
        },
    })

    export default class AuthMethodsTable extends Vue{
        @Getter('authMethods', { namespace }) authMethods: Array<AuthMethod>
        @Getter('selectedAuthMethod', { namespace }) selectedAuthMethod: AuthMethod
        @Action('retrieveAuthMethods', { namespace }) retrieveAuthMethods: CallableFunction
        @Action('retrieveAuthHelp', { namespace }) retrieveAuthHelp: CallableFunction
        @Action('updateAuthMethod', { namespace }) updateAuthMethod: CallableFunction
        @Action('openAuthMethodEdit', { namespace }) openAuthMethodEdit: CallableFunction
        @Action('openAuthMethodDeleteDialog', { namespace }) openAuthMethodDeleteDialog: CallableFunction

        mounted() {
            this.retrieveAuthMethods()
            this.retrieveAuthHelp()
        }

        activeSwitchesLoading: Array<boolean> = []

        async activeSwitchChange(authMethodID: number, oldValue: boolean) {
            const updateData = { auth_active: !oldValue }
            this.$set(this.activeSwitchesLoading, authMethodID, true)
            await this.updateAuthMethod({ "id": authMethodID, "data": updateData })
            this.$set(this.activeSwitchesLoading, authMethodID, false)
        }
    }
</script>
