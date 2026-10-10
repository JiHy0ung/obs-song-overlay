import { createSyncedStore } from "./syncedStore";

export const PALETTE_STORAGE_KEY = "song-overlay:palette";
export const PALETTE_CHANNEL_NAME = "song-overlay:palette";

// 초기값. 빈 문자열은 "색을 고르지 않음"이고, 이때는 theme.ts와 각 스타일 파일에 적어 둔 기본 색(밤 안개)을 그대로 쓴다.
// 처음 쓰는 사람, 저장된 값이 깨진 경우, "기본값" 버튼을 누른 경우 모두 이 값이 된다.
export const PALETTE_DEFAULT = "";

const HEX = /^#[0-9a-f]{6}$/i;

const store = createSyncedStore<string>({
  storageKey: PALETTE_STORAGE_KEY,
  channelName: PALETTE_CHANNEL_NAME,
  fallback: PALETTE_DEFAULT,
  parse: (value) =>
    typeof value === "string" && HEX.test(value)
      ? value.toLowerCase()
      : PALETTE_DEFAULT,
});

// 고른 메인 색(#rrggbb). 고르지 않았으면 PALETTE_DEFAULT("").
export const usePaletteColor = store.useValue;

export const setPaletteColor = (color: string) =>
  store.set(HEX.test(color) ? color.toLowerCase() : PALETTE_DEFAULT);

export const resetPaletteColor = () => store.set(PALETTE_DEFAULT);
