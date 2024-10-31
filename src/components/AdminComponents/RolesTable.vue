<template>
    <v-sheet>
        <v-simple-table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Edit/Delete</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="role in displayedRoles" :key="role.id">
                    <td>{{ role.id }}</td>
                    <td>{{ role.name }}</td>
                    <td>{{ role.description }}</td>
                    <td style="min-width: 110px">
                        <v-btn icon @click.stop="openRoleEditDialog(role)">
                            <v-icon>
                                mdi-pencil
                            </v-icon>
                        </v-btn>
                        <v-btn icon @click.stop="openRoleDeleteDialog(role)">
                            <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </tbody>
        </v-simple-table>
        <v-pagination v-model="pageNumber"
                      :length="Math.ceil(roles.length / rolesPerPage)"
                      @input="updateDisplayedRoles"></v-pagination>
    </v-sheet>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator'
    import { Action, Getter, } from 'vuex-class';
    import { Role } from '@/store/modules/admin/types'

    const namespace: string = 'admin'
    @Component({
        components: {
        },
    })

    export default class RolesTable extends Vue {
        @Getter('roles', { namespace }) roles: Array<Role>
        @Action('retrieveRoles', { namespace }) retrieveRoles: CallableFunction
        @Action('openRoleEditDialog', { namespace }) openRoleEditDialog: CallableFunction
        @Action('openRoleDeleteDialog', { namespace }) openRoleDeleteDialog: CallableFunction

        pageNumber: number = 1
        rolesPerPage: number = 25
        displayedRoles: Array<Role> = []

        mounted() {
            this.retrieveRoles().then(this.updateDisplayedRoles)
        }

        @Watch('roles')
        updateDisplayedRoles() {
            this.displayedRoles = this.roles.slice((this.pageNumber - 1) * this.rolesPerPage,
                this.pageNumber * this.rolesPerPage)
        }
    }
</script>