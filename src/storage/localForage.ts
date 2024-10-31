import localforage from 'localforage'

export default () => ({

  async getItem(key:any, callback:any) {
    return localforage.getItem(key, callback)
  },

  async setItem (key:any, value:any, callback:any) {
    return localforage.setItem(key, value, callback)
  },
  async storageConfig(options:any ){
    return localforage.config(options)
  },

  async removeItem(key:any, callback:any){
    return localforage.removeItem(key, callback)
  },
  async clearStorage(){
    return localforage.clear()
  }
});