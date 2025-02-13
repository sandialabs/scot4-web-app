import {AxiosStatic} from "axios"
import Vue from 'vue'
export default (axios: AxiosStatic) => ({
      async login(username: string, password: string): Promise<any> {
        const params = new URLSearchParams()
        params.append('username', username)
        params.append('password', password)
        return axios({ 
        url: '/login/access-token',
        method: 'POST',
        data: params,
        withCredentials: true,
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
        }
    })

    },
   
    async startAzureAD(): Promise<any> {
        return axios({
            url: '/login/oauth-url?auth_type=aad',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
    },

    async completeAzureAD(token: any): Promise<any> {
        return axios({
            url: '/login/aad-callback',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: token,
            withCredentials: true
        })
    },

    async getCurrentUser(): Promise<any> {
        return axios({
            url: '/users/whoami',
            method: 'GET',
            withCredentials: true
        })
    },
    logout() {
        return axios({
            url: '/logout',
            method: 'GET',
            withCredentials: true
        })
    },
    async getAuthMethods(): Promise<any> {
        return axios({
            url: '/settings/auth',
            method: 'GET',
            withCredentials: true
        })
    },
    async createAuthMethod(create_data: any): Promise<any> {
        return axios({
            url: '/settings/auth',
            method: 'POST',
            withCredentials: true,
            data: create_data
        })
    },
    async updateAuthMethod(id: number, data: any): Promise<any> {
        return axios({
            url: '/settings/auth/' + id,
            method: 'PUT',
            withCredentials: true,
            data: data
        })
    },
    async deleteAuthMethod(id: number): Promise<any> {
        return axios({
            url: '/settings/auth/' + id,
            method: 'DELETE',
            withCredentials: true
        })
    },
    async getAuthHelp(): Promise<any> {
        return axios({
            url: '/settings/auth/help',
            method: 'GET',
            withCredentials: true
        })
    },
    async resetPasswordAttempts(username: number): Promise<any> {
        return axios({
            url: '/users/' + username + '/reset-failed-attempts',
            method: 'POST',
            withCredentials: true
        })
    }
}
);
