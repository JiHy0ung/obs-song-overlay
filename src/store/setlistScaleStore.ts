import { createSyncedStore } from "./syncedStore";

// 세트리스트 곡 줄의 글자 크기 배율(%). 곡 목록과 별도의 키에 두어 "초기화"의 영향을 받지 않는다.
export const SETLIST_SCALE_STORAGE_KEY = "song-overlay:setlist-scale";
export const SETLIST_SCALE_CHANNEL_NAME = "song-overlay:setlist-scale";

export const SCALE_DEFAULT = 100;
export const SCALE_MIN = 70;
export const SCALE_MAX = 160;
export const SCALE_STEP = 5;

function isValidScale(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= SCALE_MIN &&
    value <= SCALE_MAX &&
    (value - SCALE_MIN) % SCALE_STEP === 0
  );
}

// 숫자가 아니거나, 범위를 벗어나거나, 10 단위가 아니면 기본값으로 본다.
const store = createSyncedStore<number>({
  storageKey: SETLIST_SCALE_STORAGE_KEY,
  channelName: SETLIST_SCALE_CHANNEL_NAME,
  fallback: SCALE_DEFAULT,
  parse: (value) => (isValidScale(value) ? value : SCALE_DEFAULT),
});

export const getSetlistScale = store.get;
export const useSetlistScale = store.useValue;

// 현재 배율에서 step만큼 바꾼다. 범위 밖으로는 나가지 않는다.
export function changeSetlistScale(step: number) {
  const next = Math.min(SCALE_MAX, Math.max(SCALE_MIN, store.get() + step));
  store.set(next);
}

export function resetSetlistScale() {
  store.set(SCALE_DEFAULT);
}
