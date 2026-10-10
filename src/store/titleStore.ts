import { createSyncedStore } from "./syncedStore";

export const TITLE_STORAGE_KEY = "song-overlay:title";
export const TITLE_CHANNEL_NAME = "song-overlay:title";

// 값은 JSON 문자열로 저장한다. 손상되었거나 문자열이 아니면 빈 문자열로 본다.
const store = createSyncedStore<string>({
  storageKey: TITLE_STORAGE_KEY,
  channelName: TITLE_CHANNEL_NAME,
  fallback: "",
  parse: (value) => (typeof value === "string" ? value : ""),
});

export const getTitle = store.get;
export const setTitle = store.set;
export const useTitle = store.useValue;
