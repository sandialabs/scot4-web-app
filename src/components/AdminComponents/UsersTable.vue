<template>
    <v-sheet>
        <v-simple-table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Active</th>
                    <th>Edit/Delete</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in displayedUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.fullname }}</td>
                    <td><v-switch dense hide-details :loading="activeSwitchesLoading[user.id]" :input-value="user.is_active" @click.native.prevent.stop.capture="activeSwitchChange(user.id, user.is_active)"></v-switch></td>
                    <td style="min-width: 110px">
                        <v-btn icon @click.stop="openUserEditDialog(user)">
                            <v-icon>
                                mdi-pencil
                            </v-icon>
                        </v-btn>
                        <v-btn icon @click.stop="openUserDeleteDialog(user)">
                            <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </tbody>
        </v-simple-table>
        <v-pagination v-model="pageNumber"
                      :length="Math.ceil(users.length / usersPerPage)"
                      @input="updateDisplayedUsers"></v-pagination>
    </v-sheet>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class';
    import { User } from '@/store/modules/admin/types'

    const namespace: string = 'admin'
    @Component({
        components: {
        },
    })

    export default class UsersTable extends Vue {
        @Getter('users', { namespace }) users: Array<User>
        @Getter('currentError', { namespace }) currentError: Error
        @Action('retrieveUsers', { namespace }) retrieveUsers: CallableFunction
        @Action('updateUser', { namespace }) updateUser: CallableFunction
        @Action('openUserEditDialog', { namespace }) openUserEditDialog: CallableFunction
        @Action('openUserDeleteDialog', { namespace }) openUserDeleteDialog: CallableFunction

        mounted() {
            this.retrieveUsers().then(this.updateDisplayedUsers)
            for (const user of this.users) {
                this.activeSwitchesLoading[user.id] = false
            }
        }

        activeSwitchesLoading: Array<boolean> = []
        pageNumber: number = 1
        usersPerPage: number = 25
        displayedUsers: Array<User> = []

        async activeSwitchChange(userId: number, oldValue: boolean) {
            const userUpdate = { is_active: !oldValue }
            this.$set(this.activeSwitchesLoading, userId, true)
            await this.updateUser({ "id": userId, "data": userUpdate })
            this.$set(this.activeSwitchesLoading, userId, false)
        }

        @Watch('users')
        updateDisplayedUsers() {
            this.displayedUsers = this.users.slice((this.pageNumber - 1) * this.usersPerPage,
                this.pageNumber * this.usersPerPage)
        }
    }
</script>
