import { AxiosStatic } from "axios"
import { IRElementType } from "../store/modules/IRElements/types"

export default (axios: AxiosStatic) => ({
    async createFile(fileData: Blob, containingElementType?: IRElementType, containingElementId?: number, progressCallback?: any, abortController?: AbortController): Promise<any> {
        const formData = new FormData()
        formData.append("file", fileData)
        if (containingElementId && containingElementType) {
            return axios({
                url: '/file/',
                method: 'POST',
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'target_type': containingElementType.toLowerCase(),
                    'target_id': containingElementId.toString(),
                },
                data: formData,
                onUploadProgress: progressCallback,
                signal: abortController?.signal
            })
        }
        else {
            return axios({
                url: '/file/',
                method: 'POST',
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                data: formData,
                onUploadProgress: progressCallback,
                signal: abortController?.signal
            })
        }
    },
})

