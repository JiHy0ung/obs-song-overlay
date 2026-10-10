import { useSyncExternalStore } from "react";

type Listener = () => void;

type SyncedStoreOptions<T> = {
  storageKey: string;
  channelName: string;
  // 저장된 값이 없거나 손상됐을 때 쓰는 값
  fallback: T;
  // JSON.parse 결과를 검사해 T로 바꾼다. 형식이 맞지 않으면 fallback을 반환한다.
  parse: (value: unknown) => T;
};

export type SyncedStore<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: Listener) => () => void;
  useValue: () => T;
};

/**
 * localStorage에 원본을 두고, 다른 페이지에는 BroadcastChannel 신호와 storage 이벤트로
 * "바뀌었다"는 사실만 알리는 저장소. 받은 쪽은 localStorage를 다시 읽는다.
 *
 * 스냅샷(get)은 모듈에 보관한 값의 참조를 그대로 반환하고, 저장된 원문이 실제로 바뀐 경우에만
 * 새 값으로 교체한다. useSyncExternalStore가 무한 렌더링에 빠지지 않게 하기 위함이다.
 */
export function createSyncedStore<T>({
  storageKey,
  channelName,
  fallback,
  parse,
}: SyncedStoreOptions<T>): SyncedStore<T> {
  const listeners = new Set<Listener>();

  function readRaw(): string | null {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function decode(raw: string | null): T {
    if (raw === null) return fallback;
    try {
      return parse(JSON.parse(raw));
    } catch {
      return fallback;
    }
  }

  function writeRaw(raw: string) {
    try {
      window.localStorage.setItem(storageKey, raw);
    } catch {
      // 저장 불가(사생활 보호 모드, 용량 초과 등) — 현재 페이지에서는 계속 동작한다.
    }
  }

  function createChannel(): BroadcastChannel | null {
    if (typeof BroadcastChannel === "undefined") return null;
    try {
      return new BroadcastChannel(channelName);
    } catch {
      return null;
    }
  }

  let currentRaw = readRaw();
  let current = decode(currentRaw);
  const channel = createChannel();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  // 다른 페이지에서 바뀌었다는 신호를 받으면 원본(localStorage)을 다시 읽는다.
  function reload() {
    const raw = readRaw();
    if (raw === currentRaw) return;
    currentRaw = raw;
    current = decode(raw);
    notify();
  }

  channel?.addEventListener("message", reload);

  window.addEventListener("storage", (event) => {
    // key가 null이면 localStorage.clear()
    if (event.key === storageKey || event.key === null) reload();
  });

  function get() {
    return current;
  }

  function set(next: T) {
    const raw = JSON.stringify(next);
    if (Object.is(next, current) || raw === currentRaw) return;
    currentRaw = raw;
    current = next;
    writeRaw(raw);
    try {
      channel?.postMessage("changed");
    } catch {
      // 채널이 닫혔어도 storage 이벤트로 전달된다.
    }
    // BroadcastChannel은 보낸 페이지 자신에게 전달되지 않으므로 직접 호출한다.
    notify();
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function useValue() {
    return useSyncExternalStore(subscribe, get);
  }

  return { get, set, subscribe, useValue };
}
