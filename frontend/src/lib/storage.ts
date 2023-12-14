import store from 'store2'

class StorageManager {
    get(key: string) {
        const res = store.get(key)
        return res
    }
    set(key: string, value: any) {
        store.set(key, value)
    }
    del(key: string) {
        store.remove(key)
    }
}

export default new StorageManager()
