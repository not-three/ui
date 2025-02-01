export class DownloadDb {
  static reset() {
    indexedDB.deleteDatabase('download')
  }

  static async open() {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      this.reset()
      const req = indexedDB.open('download', 1)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
      req.onupgradeneeded = () => {
        const db = req.result
        db.createObjectStore('chunks', { keyPath: 'index' })
      }
    })
    return new DownloadDb(db)
  }

  constructor(private readonly db: IDBDatabase) {}

  write(index: number, data: ArrayBuffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction('chunks', 'readwrite')
      tx.onerror = () => reject(tx.error)
      tx.oncomplete = () => resolve()
      tx.objectStore('chunks').put({ index, data: new Blob([data]) })
    })
  }

  getFullBlob(): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const tx = this.db.transaction('chunks', 'readonly')
      const chunks: Blob[] = []
      tx.onerror = () => reject(tx.error)
      tx.oncomplete = () => resolve(new Blob(chunks))
      tx.objectStore('chunks').openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          chunks.push(cursor.value.data)
          cursor.continue()
        }
      }
    })
  }
}
