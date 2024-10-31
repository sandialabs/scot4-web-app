import {AxiosStatic} from "axios"
import Vue from 'vue'

export default (axios: AxiosStatic) => ({
    async getStorageProviders(): Promise<any> {
        return axios({
            url: '/settings/storage_provider',
            method: 'GET',
            withCredentials: true
        })
    },
    async createStorageProvider(create_data: any): Promise<any> {
        return axios({
            url: '/settings/storage_provider',
            method: 'POST',
            withCredentials: true,
            data: create_data
        })
    },
    async updateStorageProvider(id: number, data: any): Promise<any> {
        return axios({
            url: '/settings/storage_provider/' + id,
            method: 'PUT',
            withCredentials: true,
            data: data
        })
    },
    async deleteStorageProvider(id: number): Promise<any> {
        return axios({
            url: '/settings/storage_provider/' + id,
            method: 'DELETE',
            withCredentials: true
        })
    },
    async getStorageProviderHelp(): Promise<any> {
        return axios({
            url: '/settings/storage_provider_help',
            method: 'GET',
            withCredentials: true
        })
    }
}
);
