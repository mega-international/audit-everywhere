// import { openDB, deleteDB, wrap, unwrap } from 'idb';
import { openDB } from 'idb/with-async-ittr.js';

export async function createDB(name, version, callback) {
  const dbPromise = await openDB(name, version, {
    upgrade(dbPromise) {
      callback(dbPromise);
    },
  });
  return dbPromise;
}
