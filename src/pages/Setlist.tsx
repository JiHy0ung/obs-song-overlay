import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { PaletteProvider } from "../palette/PaletteProvider";
import { useSetlistScale } from "../store/setlistScaleStore";
import { isSameSong, useSetlist, type Song } from "../store/setlistStore";
import { useTitle } from "../store/titleStore";
import {
  Dot,
  Footer,
  FooterDate,
  FooterLine,
  Haze,
  Header,
  HeaderCount,
  HeaderLabel,
  HeaderLine,
  HeaderNote,
  HeaderRow,
  Item,
  Items,
  LEAVE_MS,
  List,
  Mark,
  MOVE_EASING,
  MOVE_MS,
  Overlay,
  Panel,
  Sky,
  SongTitle,
  Sparkle,
  SPARKLE_COUNT,
  Star,
  StarSlot,
} from "./Setlist.styles";

type Row = {
  song: Song;
  leaving: boolean;
};

// 화면에 그려진 행과 새 세트리스트를 합친다. 빠진 곡은 사라지는 효과가 끝날 때까지
// 원래 자리에 남겨 두고, 나머지는 새 순서대로 놓는다.
function mergeRows(prev: readonly Row[], songs: readonly Song[]): Row[] {
  const nextIds = new Set(songs.map((song) => song.id));
  const result: Row[] = [];
  let index = 0;
  const pushUntil = (id?: string) => {
    while (index < songs.length) {
      const song = songs[index++];
      result.push({ song, leaving: false });
      if (song.id === id) return;
    }
  };

  for (const row of prev) {
    if (nextIds.has(row.song.id)) {
      pushUntil(row.song.id);
    } else {
      result.push(row.leaving ? row : { ...row, leaving: true });
    }
  }
  pushUntil();
  return result;
}

// 패널 아래에 보여줄 날짜 (10월 10일). 방송 PC의 시간대를 따른다.
function formatDate(time: number): string {
  const date = new Date(time);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 머리글의 음표 (타이틀 바에서 쓰던 음표와 같은 모양)
const NoteIcon = () => (
  <HeaderNote
    viewBox="7.6 2.1 12 19.2"
    aria-hidden="true"
    data-testid="setlist-note"
  >
    <path
      d="M13.1 2.8H13.6C13.8 6.4 19.2 7.4 19.2 12C19.2 13.6 18.5 15 17.3 16.1C18.2 13.2 17.2 9.6 13.6 7H13.1Z"
      fill="currentColor"
    />
    <rect
      x="12.6"
      y="2.4"
      width="1"
      height="15.8"
      rx="0.5"
      fill="currentColor"
    />
    <ellipse
      cx="10.8"
      cy="18.6"
      rx="3"
      ry="2.1"
      transform="rotate(-26 10.8 18.6)"
      fill="currentColor"
    />
  </HeaderNote>
);

// 지금 부르는 곡에 켜지는 네 갈래 별 (타이틀 바의 별과 같은 모양)
const StarIcon = () => (
  <Star viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 0C12.8 7.4 16.6 11.2 24 12 16.6 12.8 12.8 16.6 12 24 11.2 16.6 7.4 12.8 0 12 7.4 11.2 11.2 7.4 12 0Z"
      fill="currentColor"
    />
  </Star>
);

// 강조되는 순간 별 주변으로 튀어나오는 작은 별들
const Sparkles = () => (
  <>
    {Array.from({ length: SPARKLE_COUNT }, (_, i) => (
      <Sparkle key={i} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 0C12.8 7.4 16.6 11.2 24 12 16.6 12.8 12.8 16.6 12 24 11.2 16.6 7.4 12.8 0 12 7.4 11.2 11.2 7.4 12 0Z"
          fill="currentColor"
        />
      </Sparkle>
    ))}
  </>
);

const Setlist = () => {
  const songs = useSetlist();
  const title = useTitle();
  const scale = useSetlistScale();
  const listRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLOListElement>(null);
  // 지난번 렌더링 때 각 항목의 위치 (FLIP 전환용)
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());
  const movesRef = useRef(new WeakMap<Element, Animation>());
  // 목록이 패널보다 길 때, 위아래에 가려진 곡이 있는지 (가장자리를 흐리게 하는 데 쓴다)
  const [fade, setFade] = useState({ top: false, bottom: false });

  const [prevSongs, setPrevSongs] = useState(songs);
  const [rows, setRows] = useState(() => mergeRows([], songs));
  if (songs !== prevSongs) {
    setPrevSongs(songs);
    setRows(mergeRows(rows, songs));
  }

  const hasLeaving = rows.some((row) => row.leaving);
  useEffect(() => {
    if (!hasLeaving) return;
    const timer = window.setTimeout(
      () => setRows((current) => current.filter((row) => !row.leaving)),
      LEAVE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [hasLeaving, rows]);

  // 항목 위치를 목록 칸 기준으로 기록한다. offsetLeft·offsetTop은 transform의 영향을 받지 않는다.
  const readPositions = () => {
    const positions = new Map<string, { x: number; y: number }>();
    itemsRef.current
      ?.querySelectorAll<HTMLElement>("[data-id]")
      .forEach((el) => {
        positions.set(el.dataset.id!, { x: el.offsetLeft, y: el.offsetTop });
      });
    return positions;
  };

  // 추가·삭제·순서 변경으로 자리가 바뀐 항목을 이전 위치에서 새 위치로 미끄러지게 한다.
  useLayoutEffect(() => {
    const previous = positionsRef.current;
    const next = readPositions();
    itemsRef.current
      ?.querySelectorAll<HTMLElement>("[data-id]")
      .forEach((el) => {
        const before = previous.get(el.dataset.id!);
        const after = next.get(el.dataset.id!);
        if (!before || !after) return;
        const dx = before.x - after.x;
        const dy = before.y - after.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        movesRef.current.get(el)?.cancel();
        const animation = el.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: "translate(0, 0)" },
          ],
          { duration: MOVE_MS, easing: MOVE_EASING },
        );
        movesRef.current.set(el, animation);
      });
    positionsRef.current = next;
  }, [rows]);

  const hasRows = rows.length > 0;

  // 위아래에 가려진 곡이 있는지 다시 잰다.
  const updateFade = () => {
    const list = listRef.current;
    if (!list) return;
    const max = list.scrollHeight - list.clientHeight;
    const top = list.scrollTop > 0.5;
    const bottom = list.scrollTop < max - 0.5;
    setFade((prev) =>
      prev.top === top && prev.bottom === bottom ? prev : { top, bottom },
    );
  };

  // 목록이 패널보다 길면 지금 부르는 곡이 가운데쯤 오도록 목록을 움직인다.
  // 앞쪽 곡을 고르면 위로 올라가고, 지금 부르는 곡이 없으면(타이틀 바 숨김) 최신 곡이 보이게 맨 아래로 간다.
  const scrollToCurrent = (smooth: boolean) => {
    const list = listRef.current;
    if (!list) return;
    const max = Math.max(0, list.scrollHeight - list.clientHeight);
    const current = list.querySelector<HTMLElement>("[aria-current]");
    const target = current
      ? current.offsetTop - (list.clientHeight - current.offsetHeight) / 2
      : max;
    list.scrollTo({
      top: Math.max(0, Math.min(max, target)),
      behavior: smooth ? "smooth" : "auto",
    });
    updateFade();
  };

  // 곡이 추가·삭제되거나 지금 부르는 곡이 바뀌면 그쪽으로 부드럽게 움직인다. 처음 한 번은 바로 맞춘다.
  const scrolledOnceRef = useRef(false);
  useEffect(() => {
    if (!hasRows) {
      scrolledOnceRef.current = false;
      return;
    }
    scrollToCurrent(scrolledOnceRef.current);
    scrolledOnceRef.current = true;
    // scrollToCurrent는 ref와 setState만 쓰므로 다시 등록할 필요가 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRows, rows, title]);

  // 글꼴 로드·글자 크기·소스 크기 변경으로 높이가 바뀌면 위치를 다시 맞추고, 바뀐 항목 위치도 다시 기록한다.
  useEffect(() => {
    const list = listRef.current;
    const items = itemsRef.current;
    if (!hasRows || !list || !items) return;
    const observer = new ResizeObserver(() => {
      scrollToCurrent(true);
      positionsRef.current = readPositions();
    });
    observer.observe(list);
    observer.observe(items);
    list.addEventListener("scroll", updateFade, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", updateFade);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRows]);

  if (!hasRows) return null;

  // 타이틀 바에 지금 떠 있는 곡을 목록 어디에 있든 강조한다. 숨김 상태(빈 제목)면 강조하지 않는다.
  const isCurrent = (song: Song) =>
    title !== "" && isSameSong(song.title, title);
  // 이 세트리스트를 시작한 날: 가장 먼저 추가된 곡의 날짜.
  // 방송이 자정을 넘겨도 바뀌지 않고, 초기화한 뒤 첫 곡을 넣으면 그날로 바뀐다.
  const startedAt = Math.min(...rows.map((row) => row.song.addedAt));
  // 곡 수. 초기화로 패널이 사라지는 동안에는 0곡으로 바뀌지 않게 직전 곡 수를 그대로 둔다.
  const count = songs.length || rows.length;
  // 곡 줄의 글자 크기 배율. 스타일에서 calc()로 곱한다.
  const panelStyle = { "--setlist-scale": scale / 100 } as CSSProperties;

  // PaletteProvider: 독에서 고른 색을 입힌다.
  return (
    <PaletteProvider>
      <Overlay>
        <Panel
          $leaving={songs.length === 0}
          style={panelStyle}
          data-testid="setlist-panel"
        >
          <Haze aria-hidden="true" data-testid="setlist-haze">
            <i />
            <i />
          </Haze>
          <Sky aria-hidden="true" data-testid="setlist-sky" />
          <Header data-testid="setlist-header">
            <HeaderRow>
              <NoteIcon />
              <HeaderLabel>SETLIST</HeaderLabel>
              <HeaderCount data-testid="setlist-count">{count}곡</HeaderCount>
            </HeaderRow>
            <HeaderLine data-testid="setlist-line" />
          </Header>
          <List
            ref={listRef}
            $fadeTop={fade.top}
            $fadeBottom={fade.bottom}
            data-testid="setlist-list"
            data-overflowing={fade.top || fade.bottom || undefined}
          >
            <Items ref={itemsRef} data-testid="setlist-items">
              {rows.map(({ song, leaving }) => {
                const current = !leaving && isCurrent(song);
                return (
                  <Item
                    key={song.id}
                    data-id={song.id}
                    data-testid="setlist-item"
                    data-state={leaving ? "leaving" : undefined}
                    $leaving={leaving}
                    $current={current}
                    aria-current={current || undefined}
                    aria-hidden={leaving || undefined}
                  >
                    <Mark aria-hidden="true" data-testid="setlist-mark">
                      <Dot />
                      <StarSlot>
                        <StarIcon />
                      </StarSlot>
                      <Sparkles />
                    </Mark>
                    <SongTitle data-testid="setlist-song">
                      {song.title}
                    </SongTitle>
                  </Item>
                );
              })}
            </Items>
          </List>
          <Footer data-testid="setlist-footer">
            <FooterLine />
            <FooterDate data-testid="setlist-date">
              {formatDate(startedAt)}
            </FooterDate>
            <FooterLine $reverse />
          </Footer>
        </Panel>
      </Overlay>
    </PaletteProvider>
  );
};

export default Setlist;
