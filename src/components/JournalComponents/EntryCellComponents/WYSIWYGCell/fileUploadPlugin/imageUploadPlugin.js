import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

export default class ScotUploadAdapter extends Plugin {
    static get requires() {
        return [FileRepository]
    }

    static get pluginName() {
        return 'ScotUploadAdapter'
    }

    init() {
        const options = this.editor.config.get('scotUpload')
        this.editor.plugins.get(FileRepository).createUploadAdapter = loader => {
            return new Adapter(loader, options)
        }
    }
}

class Adapter {
    constructor(loader, options) {
        this.loader = loader
        this.options = options
    }

    upload() {
        return this.loader.file.then(file => new Promise((resolve, reject) => {
            this.abortController = new AbortController();
            const progressCallback = (evt) => {
                if (evt.lengthComputable) {
                    this.loader.uploadTotal = evt.total;
                    this.loader.uploaded = evt.loaded;
                }
            }
            try {
                this.options.uploadFunction(file, progressCallback, this.abortController).then(resp => {
                    const urls = { "default": process.env.VUE_APP_API_BASE + "/file/download/" + resp.data.id.toString() }
                    resolve({ urls, ...resp })
                })
            }
            catch (e) {
                reject("Failed to upload file: " + file.name + " Error: " + e)
            }
        }))
    }

    abort() {
        if (this.abortController) {
            this.abortController.abort()
        }
    }
}