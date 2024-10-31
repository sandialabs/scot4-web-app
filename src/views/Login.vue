<template>
    <v-app>
    <v-main>
        <v-container 
            id="login-container"
            class="d-flex flex-row justify-center align-center"
        >
            <v-card
                id="login-card"
                ref="LoginCard"
                class="d-flex flex-row justify-center align-center"
                flat
                dark
            >
                <v-img
                    id="logo-img"
                    src="@/assets/scot-logo.png"
                    height="473px"
                    width="473px"
                />
                <v-form @submit.prevent>
                    <v-progress-circular v-if="loginInProgress"> </v-progress-circular>
                    <v-text-field
                        ref="UsernameInput"
                        v-model="username"
                        id="userNameForm"
                        prepend-icon=mdi-chevron-right
                        name="Username" 
                        label="Username"
                    />
                    <v-text-field 
                        ref="PasswordInput"
                        v-model="password"
                        prepend-icon="mdi-chevron-right" 
                        name="Password" 
                        id="passwordForm"
                        label="Password" 
                        type="password"
                    />
                    
                    <v-card-actions>
                        <v-btn 
                            id="loginButton"
                            primary 
                            large
                            block
                            type="submit"
                            @click="clickLoginLocal"
                        >
                            Login
                        </v-btn>
                    </v-card-actions>
                   <v-card-actions>
                        <v-btn 
                            primary 
                            large
                            id="ssoButton"
                            block
                            @click="clickLoginAzureAD"
                        >
                            SSO
                        </v-btn>
                    </v-card-actions>
                
                </v-form>
            </v-card>
        </v-container>
    </v-main>
    </v-app>
</template>


<script lang="ts">
    import Vue from 'vue';
    import {Action, Getter } from 'vuex-class';
    import Component from 'vue-class-component';
    const namespace: string = 'user';
    import { default_title } from '@/constants';

    @Component
    export default class Login extends Vue {
        @Action('loginLocalUser', { namespace }) loginLocalUser: any;
        @Action('startAzureAD', { namespace }) startAzureAD: any;
        @Action('completeAzureAD', { namespace }) completeAzureAD: any;
        @Getter('isLoggedIn', { namespace }) isLoggedIn: boolean;
        @Getter('loginInProgress', { namespace }) loginInProgress: boolean;
        username: string = ""
        password: string = ""

        async clickLoginLocal(): Promise<any>{
            await this.loginLocalUser({username: this.username, password: this.password});
            if (this.isLoggedIn) {
                const redirectUrl = await Vue.prototype.$storage.getItem('loginRedirect')
                if (redirectUrl) {
                    this.$router.push(redirectUrl)
                    Vue.prototype.$storage.removeItem('loginRedirect')
                }
                else {
                    this.$router.push('/')
                }
            }
        }
        async clickLoginAzureAD(): Promise<any>{
            const url = await this.startAzureAD()
            if (url) {
                window.location.href = url
            }
        }

        mounted() {
            document.title = default_title
        }
    }
</script>
