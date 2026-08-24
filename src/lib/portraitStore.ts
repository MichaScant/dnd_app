import { useEffect, useState } from "react";

// Character portraits live in IndexedDB (not localStorage) so they don't eat
// into the small localStorage budget the character data uses. Each record keeps
// the bounded original for re-cropping plus the cropped display image.

const DB_NAME = "grimoire-portraits";
const STORE = "portraits";
const VERSION = 1;

export interface PortraitRecord {
  source: string; // bounded original (data URL), used when re-cropping
  cropped: string; // cropped display image (data URL)
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return requestToPromise(run(db.transaction(STORE, mode).objectStore(STORE)));
}

export const loadPortrait = (id: string): Promise<PortraitRecord | undefined> =>
  withStore(
    "readonly",
    (s) => s.get(id) as IDBRequest<PortraitRecord | undefined>,
  );

// Simple pub/sub so every mounted portrait re-reads when its record changes.
const listeners = new Map<string, Set<() => void>>();
const subscribe = (id: string, cb: () => void): (() => void) => {
  let set = listeners.get(id);
  if (!set) listeners.set(id, (set = new Set()));
  set.add(cb);
  return () => {
    set!.delete(cb);
  };
};
const notify = (id: string) => listeners.get(id)?.forEach((cb) => cb());

export async function savePortrait(
  id: string,
  record: PortraitRecord,
): Promise<void> {
  await withStore("readwrite", (s) => s.put(record, id));
  notify(id);
}

export async function deletePortrait(id: string): Promise<void> {
  await withStore("readwrite", (s) => s.delete(id));
  notify(id);
}

/** Subscribe a component to a character's portrait record. */
export function usePortrait(id: string): PortraitRecord | undefined {
  const [record, setRecord] = useState<PortraitRecord | undefined>();
  useEffect(() => {
    let active = true;
    const load = () =>
      loadPortrait(id)
        .then((r) => {
          if (active) setRecord(r);
        })
        .catch(() => {});
    load();
    const unsub = subscribe(id, load);
    return () => {
      active = false;
      unsub();
    };
  }, [id]);
  return record;
}
