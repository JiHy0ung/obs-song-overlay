import { createSyncedStore } from "./syncedStore";

export const SETLIST_STORAGE_KEY = "song-overlay:setlist";
export const SETLIST_CHANNEL_NAME = "song-overlay:setlist";

export type Song = {
  id: string;
  title: string;
  // 추가된 시각 (Date.now())
  addedAt: number;
};

const EMPTY: Song[] = [];

function isSong(value: unknown): value is Song {
  if (typeof value !== "object" || value === null) return false;
  const song = value as Record<string, unknown>;
  return (
    typeof song.id === "string" &&
    typeof song.title === "string" &&
    typeof song.addedAt === "number"
  );
}

// 배열이 아니면 빈 배열, 형식이 맞지 않는 항목은 버린다.
function parseSetlist(value: unknown): Song[] {
  if (!Array.isArray(value)) return EMPTY;
  return value.filter(isSong);
}

const store = createSyncedStore<Song[]>({
  storageKey: SETLIST_STORAGE_KEY,
  channelName: SETLIST_CHANNEL_NAME,
  fallback: EMPTY,
  parse: parseSetlist,
});

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const getSetlist = store.get;
export const useSetlist = store.useValue;

// 같은 곡인지 비교할 때 쓰는 형태: 앞뒤 공백 제거, 연속 공백은 하나로, 영문 대소문자 무시.
// 저장되는 제목은 바꾸지 않고 비교할 때만 쓴다.
function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

// 곡 추가·곡 수정·강조에서 같은 곡인지 판단하는 유일한 기준
export function isSameSong(a: string, b: string): boolean {
  return normalizeTitle(a) === normalizeTitle(b);
}

// 세트리스트에서 같은 곡의 위치. 없으면 -1.
export function findSongIndex(songs: readonly Song[], title: string): number {
  return songs.findIndex((song) => isSameSong(song.title, title));
}

export type AddSongResult = "added" | "duplicate" | "empty";

// 세트리스트 어디에든 같은 곡이 있으면 추가하지 않는다. 순서도 바꾸지 않는다.
export function addSong(title: string): AddSongResult {
  if (title.trim() === "") return "empty";
  const songs = store.get();
  if (findSongIndex(songs, title) !== -1) return "duplicate";
  store.set([...songs, { id: createId(), title, addedAt: Date.now() }]);
  return "added";
}

export type RenameSongResult =
  | "renamed"
  | "unchanged"
  | "duplicate"
  | "empty"
  | "missing";

// 제목만 바꾸고 id·순번·추가된 시각은 그대로 둔다.
// 다른 곡과 같은 제목이면 바꾸지 않는다. 자기 자신과 같은 곡(대소문자·공백만 수정)은 허용한다.
export function renameSong(id: string, title: string): RenameSongResult {
  const next = title.trim();
  if (next === "") return "empty";
  const songs = store.get();
  const target = songs.find((song) => song.id === id);
  if (!target) return "missing";
  if (target.title === next) return "unchanged";
  if (songs.some((song) => song.id !== id && isSameSong(song.title, next)))
    return "duplicate";
  store.set(
    songs.map((song) => (song.id === id ? { ...song, title: next } : song)),
  );
  return "renamed";
}

export function removeSong(id: string) {
  const songs = store.get();
  const next = songs.filter((song) => song.id !== id);
  if (next.length !== songs.length) store.set(next);
}

// 곡을 다른 자리로 옮긴다. toIndex는 옮긴 뒤의 위치(0부터)다.
// 순서만 바뀌고 id·제목·추가된 시각은 그대로다.
export function moveSong(id: string, toIndex: number) {
  const songs = store.get();
  const from = songs.findIndex((song) => song.id === id);
  if (from === -1) return;
  const to = Math.max(0, Math.min(songs.length - 1, toIndex));
  if (to === from) return;
  const next = [...songs];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  store.set(next);
}

export function clearSetlist() {
  if (store.get().length > 0) store.set(EMPTY);
}

export function formatSetlist(songs: readonly Song[]): string {
  return songs.map((song, index) => `${index + 1}. ${song.title}`).join("\n");
}
