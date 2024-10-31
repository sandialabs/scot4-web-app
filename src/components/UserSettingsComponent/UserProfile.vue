<template>
    <v-card>
        <v-card-title>Profile Information</v-card-title>
        <v-card-text>
            <v-form v-model="formValid">
                <v-row>
                    <v-col>
                        <v-text-field :value="currentUser.id"
                                      readonly
                                      label="ID"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="currentUser.username"
                                      readonly
                                      label="Username"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="fullname"
                                      label="Full Name"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="email"
                                      label="Email"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="password"
                                      type="password"
                                      label="New Password"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="confirmPassword"
                                      :rules="[passwordsMustMatch]"
                                      type="password"
                                      label="Confirm Password"></v-text-field>
                    </v-col>
                </v-row>
                <span class="subheading">Roles</span>
                <v-chip-group column>
                    <v-chip v-for="role in currentUser.roles" :key="role.id">
                        {{ role.name }}
                    </v-chip>
                </v-chip-group>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="saveProfile" :active="formValid" :loading="saveLoading" color="green">
                Save Changes
                <template v-slot:loader v-if="loadingComplete">
                    <span class="custom-loader">
                        <v-icon>mdi-check</v-icon>
                    </span>
                </template>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class'
    import { User } from '../../store/modules/user/types'

    const namespace: string = "user"

    @Component({
    })
    export default class UserProfile extends Vue {
        @Getter('currentUser', { namespace }) currentUser: User
        @Action('updateUserMe', { namespace }) updateUserMe: CallableFunction

        formValid: boolean = true
        saveLoading: boolean = false
        loadingComplete: boolean = false
        fullname: string = ""
        password: string = ""
        email: string = ""
        confirmPassword: string = ""

        mounted() {
            this.fullname = this.currentUser.fullname
            this.email = this.currentUser.email
        }

        passwordsMustMatch() {
            if (this.password != this.confirmPassword) {
                return 'Passwords must match'
            }
            return true
        }

        async saveProfile() {
            if (this.formValid) {
                this.saveLoading = true
                const updateData = {
                    'fullname': this.fullname,
                    'email': this.email,
                    'password': this.password || null
                }
                const succeeded = await this.updateUserMe({ data: updateData })
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
        }
    }
</script>