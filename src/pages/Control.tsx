import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  type SubmitEvent,
} from "react";
import {
  addSong,
  clearSetlist,
  findSongIndex,
  formatSetlist,
  getSetlist,
  isSameSong,
  moveSong,
  removeSong,
  renameSong,
  useSetlist,
  type Song,
} from "../store/setlistStore";
import {
  changeSetlistScale,
  resetSetlistScale,
  SCALE_DEFAULT,
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
  useSetlistScale,
} from "../store/setlistScaleStore";
import { getTitle, setTitle, useTitle } from "../store/titleStore";
import {
  Actions,
  ConfirmText,
  Count,
  DragHandle,
  EditError,
  EditForm,
  EditInput,
  Empty,
  FontSizeLabel,
  FontSizeRow,
  FontSizeValue,
  HideButton,
  IconButton,
  Label,
  Manager,
  ManagerHeader,
  ManagerTitle,
  ManualCopy,
  ManualCopyText,
  Notice,
  Page,
  Row,
  SmallButton,
  SongItem,
  SongList,
  SongNumber,
  SongTitle,
  Status,
  StatusLabel,
  StatusValue,
  TitleForm,
  TitleInput,
} from "./Control.styles";
import { Pencil, X } from "lucide-react";
import PalettePicker from "../palette/PalettePicker";

type SongEditorProps = {
  song: Song;
  // 저장하지 못했으면 안내 문구를 돌려준다. 그때는 수정 상태를 유지한다.
  onSave: (value: string) => string | null;
  onCancel: () => void;
};

// 곡 제목을 그 자리에서 고치는 입력창. Enter는 폼 제출로 처리해 한글 조합이 끝난 값을 쓴다.
const SongEditor = ({ song, onSave, onCancel }: SongEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(onSave(inputRef.current?.value ?? ""));
  };

  return (
    <EditForm onSubmit={handleSubmit}>
      <EditInput
        ref={inputRef}
        $invalid={error !== null}
        data-testid="song-edit-input"
        type="text"
        defaultValue={song.title}
        aria-label={`${song.title} 제목 수정`}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={error !== null}
        onChange={() => setError(null)}
        onKeyDown={(event) => {
          // 조합 중 Esc는 IME가 조합을 취소하는 데 쓰므로 건드리지 않는다.
          if (event.key === "Escape" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            onCancel();
          }
        }}
        // 입력창 밖을 클릭하면 취소
        onBlur={onCancel}
      />
      {error && (
        <EditError role="alert" data-testid="song-edit-error">
          {error}
        </EditError>
      )}
    </EditForm>
  );
};

// 세트리스트 곡 줄의 글자 크기. 슬라이더 대신 버튼으로 10%씩 바꾼다(좁은 독에서 정확히 맞추기 쉽게).
const FontSizeControl = () => {
  const scale = useSetlistScale();

  return (
    <FontSizeRow
      role="group"
      aria-labelledby="setlist-font-size-label"
      data-testid="font-size"
    >
      <FontSizeLabel id="setlist-font-size-label">글자 크기</FontSizeLabel>
      <SmallButton
        type="button"
        onClick={() => changeSetlistScale(-SCALE_STEP)}
        disabled={scale <= SCALE_MIN}
        aria-label="글자 작게"
        data-testid="font-size-down"
      >
        −
      </SmallButton>
      <FontSizeValue aria-live="polite" data-testid="font-size-value">
        {scale}%
      </FontSizeValue>
      <SmallButton
        type="button"
        onClick={() => changeSetlistScale(SCALE_STEP)}
        disabled={scale >= SCALE_MAX}
        aria-label="글자 크게"
        data-testid="font-size-up"
      >
        +
      </SmallButton>
      <SmallButton
        type="button"
        onClick={resetSetlistScale}
        disabled={scale === SCALE_DEFAULT}
        data-testid="font-size-reset"
      >
        기본값
      </SmallButton>
    </FontSizeRow>
  );
};

// 끌어서 순서 바꾸기 ---------------------------------------------------------

// 끌고 있는 동안의 상태. 화면에 그릴 때 쓴다.
type DragState = {
  id: string;
  // 끌기 시작한 자리와 지금 놓으면 들어갈 자리 (0부터)
  from: number;
  to: number;
  // 끌고 있는 줄이 원래 자리에서 움직인 거리(px)
  offset: number;
  // 끌고 있는 줄의 높이. 사이에 낀 줄들이 이만큼 비켜난다.
  height: number;
};

// 끌기 시작할 때 재 두는 값. 끄는 동안에는 바뀌지 않는다.
type DragStart = {
  pointerId: number;
  startY: number;
  startScroll: number;
  // 마지막으로 본 포인터의 세로 위치 (자동 스크롤용)
  pointerY: number;
  // 각 줄의 위치와 높이. 제목이 길면 줄바꿈되어 높이가 서로 다를 수 있다.
  tops: number[];
  heights: number[];
};

// 목록 위아래 끝에서 이 거리 안으로 끌고 가면 목록이 자동으로 스크롤된다.
const AUTO_SCROLL_EDGE = 28;
const AUTO_SCROLL_MAX = 12;

// 손잡이를 잡고 끌어서 곡 순서를 바꾼다. 브라우저 기본 드래그 대신 포인터 이벤트를 써서
// OBS 독 안에서도 똑같이 동작한다. 놓는 순간에만 저장소가 바뀌므로 방송 화면은 그때 한 번 움직인다.
function useSongDrag(
  listRef: RefObject<HTMLOListElement | null>,
  songs: readonly Song[],
) {
  const [drag, setDrag] = useState<DragState | null>(null);
  // 이벤트 핸들러에서 최신 상태를 바로 읽기 위한 사본
  const dragRef = useRef<DragState | null>(null);
  const startRef = useRef<DragStart | null>(null);

  const apply = (next: DragState | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  // 포인터 위치와 스크롤 위치로 끌고 있는 줄의 이동 거리와 놓일 자리를 다시 계산한다.
  const update = () => {
    const start = startRef.current;
    const current = dragRef.current;
    const list = listRef.current;
    if (!start || !current || !list) return;
    const { tops, heights } = start;
    const { from } = current;
    const last = tops.length - 1;
    // 목록 밖으로는 못 나가게 막는다.
    const min = tops[0] - tops[from];
    const max = tops[last] + heights[last] - (tops[from] + heights[from]);
    const moved =
      start.pointerY - start.startY + (list.scrollTop - start.startScroll);
    const offset = Math.max(min, Math.min(max, moved));
    // 끌고 있는 줄의 위쪽 끝(올릴 때)이나 아래쪽 끝(내릴 때)이 다른 줄의 가운데를 넘어가면
    // 그 줄과 자리를 바꾼다. 줄 높이가 서로 달라도 맨 위와 맨 아래까지 옮길 수 있다.
    const top = tops[from] + offset;
    const bottom = top + heights[from];
    let to = from;
    for (let i = 0; i < tops.length; i++) {
      const middle = tops[i] + heights[i] / 2;
      if (i < from && top < middle) to--;
      if (i > from && bottom > middle) to++;
    }
    if (current.offset !== offset || current.to !== to)
      apply({ ...current, offset, to });
  };

  // 끌기를 끝낸다. commit이면 놓은 자리로 옮기고, 아니면 원래 자리로 되돌린다.
  const finish = (commit: boolean) => {
    const current = dragRef.current;
    if (!startRef.current || !current) return;
    startRef.current = null;
    apply(null);
    if (commit && current.to !== current.from) moveSong(current.id, current.to);
  };

  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    // 끄는 동안 목록 끝 근처에 있으면 계속 스크롤한다.
    let frame = requestAnimationFrame(function tick() {
      const start = startRef.current;
      const list = listRef.current;
      if (start && list) {
        const rect = list.getBoundingClientRect();
        const above = rect.top + AUTO_SCROLL_EDGE - start.pointerY;
        const below = start.pointerY - (rect.bottom - AUTO_SCROLL_EDGE);
        const speed = above > 0 ? -above / 3 : below > 0 ? below / 3 : 0;
        if (speed !== 0) {
          const before = list.scrollTop;
          list.scrollTop += Math.max(
            -AUTO_SCROLL_MAX,
            Math.min(AUTO_SCROLL_MAX, speed),
          );
          if (list.scrollTop !== before) update();
        }
      }
      frame = requestAnimationFrame(tick);
    });
    // Esc를 누르면 원래 자리로 되돌린다.
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") finish(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
    // update·finish는 ref와 setState만 쓰므로 다시 등록할 필요가 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  // 손잡이에 붙이는 이벤트
  const handleProps = (song: Song, index: number) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      const list = listRef.current;
      if (event.button !== 0 || !list || startRef.current) return;
      // 글자가 선택되거나 포커스가 옮겨가지 않게 한다.
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const items = Array.from(list.children) as HTMLElement[];
      startRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startScroll: list.scrollTop,
        pointerY: event.clientY,
        tops: items.map((item) => item.offsetTop),
        heights: items.map((item) => item.offsetHeight),
      };
      apply({
        id: song.id,
        from: index,
        to: index,
        offset: 0,
        height: items[index].offsetHeight,
      });
    },
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
      const start = startRef.current;
      if (!start || start.pointerId !== event.pointerId) return;
      start.pointerY = event.clientY;
      update();
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      if (startRef.current?.pointerId === event.pointerId) finish(true);
    },
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => {
      if (startRef.current?.pointerId === event.pointerId) finish(false);
    },
    // 마우스 없이도 옮길 수 있게: 손잡이에 포커스를 두고 위·아래 화살표
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      moveSong(song.id, index + (event.key === "ArrowUp" ? -1 : 1));
    },
  });

  // 끄는 동안 각 줄이 세로로 얼마나 움직여 있어야 하는지(px)
  const shiftFor = (index: number): number => {
    if (!drag) return 0;
    if (index === drag.from) return drag.offset;
    if (index < drag.from && index >= drag.to) return drag.height;
    if (index > drag.from && index <= drag.to) return -drag.height;
    return 0;
  };

  // 끄는 중에 목록이 바뀌면(곡 추가·삭제) 재 둔 위치가 틀어지므로 끌기를 취소한다.
  // 직접 놓아서 순서가 바뀐 경우에는 이미 끌기가 끝난 뒤라 아무 일도 하지 않는다.
  useEffect(() => {
    if (!startRef.current) return;
    startRef.current = null;
    apply(null);
    // apply는 ref와 setState만 쓰므로 다시 등록할 필요가 없다.
  }, [songs]);

  return { drag, handleProps, shiftFor };
}

type SetlistManagerProps = {
  // 곡 수정과 함께 타이틀 바 제목이 바뀌었을 때 알린다.
  onTitleRenamed: (previous: string, next: string) => void;
  // 목록에서 곡을 눌러 타이틀 바 제목이 바뀌었을 때 알린다.
  onSongSelected: (title: string) => void;
};

const SetlistManager = ({
  onTitleRenamed,
  onSongSelected,
}: SetlistManagerProps) => {
  const songs = useSetlist();
  // 지금 타이틀 바에 떠 있는 제목. 목록에서 같은 곡을 표시하는 데 쓴다.
  const title = useTitle();
  const listRef = useRef<HTMLOListElement>(null);
  const manualRef = useRef<HTMLTextAreaElement>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  // 클립보드 API가 실패했을 때 직접 복사할 수 있게 보여주는 텍스트
  const [manualCopyText, setManualCopyText] = useState<string | null>(null);
  // 수정 중인 곡 (한 번에 한 곡만)
  const [editingId, setEditingId] = useState<string | null>(null);
  const { drag, handleProps, shiftFor } = useSongDrag(listRef, songs);

  // 목록이 맨 아래(최신 곡)를 보고 있는지. 독 크기가 바뀌어도 그 상태를 유지한다.
  const stickToBottomRef = useRef(true);
  const handleListScroll = () => {
    const list = listRef.current;
    if (list)
      stickToBottomRef.current =
        list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
  };

  // 새 곡이 쌓이면 목록 맨 아래(최신 곡)가 보이게 한다.
  const count = songs.length;
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
    stickToBottomRef.current = true;
    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current) list.scrollTop = list.scrollHeight;
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  useEffect(() => {
    manualRef.current?.focus();
    manualRef.current?.select();
  }, [manualCopyText]);

  const handleCopy = async () => {
    const text = formatSetlist(songs);
    try {
      await navigator.clipboard.writeText(text);
      setManualCopyText(null);
      setCopyState("copied");
    } catch {
      setManualCopyText(text);
    }
  };

  const handleSave = (song: Song, value: string): string | null => {
    const next = value.trim();
    // 수정 전 제목이 지금 타이틀 바에 떠 있으면 타이틀 바 제목도 같이 고친다.
    const titleBefore = getTitle();
    const onTitleBar =
      titleBefore !== "" && isSameSong(titleBefore, song.title);
    const result = renameSong(song.id, next);
    // 다른 곡과 같은 제목이면 저장하지 않고 수정 상태를 유지한다.
    if (result === "duplicate") {
      const others = songs.filter((other) => other.id !== song.id);
      const duplicate = others[findSongIndex(others, next)];
      return `이미 있는 곡이에요 (${songs.indexOf(duplicate) + 1}번)`;
    }
    // 빈 값·변경 없음은 저장하지 않고 취소로 처리한다. 곡을 지우는 건 삭제 버튼으로만 한다.
    setEditingId(null);
    if (result === "renamed" && onTitleBar) {
      setTitle(next);
      onTitleRenamed(titleBefore, next);
    }
    return null;
  };

  // 곡을 누르면 그 곡이 지금 부르는 곡이 된다: 타이틀 바에 뜨고 방송 화면의 세트리스트에서 강조된다.
  // 이미 지금 부르는 곡을 다시 누르면 선택을 취소한다. "숨기기" 버튼과 같은 동작이라 입력창은 건드리지 않는다.
  const handleSelect = (song: Song) => {
    if (isSameSong(getTitle(), song.title)) {
      setTitle("");
      return;
    }
    setTitle(song.title);
    onSongSelected(song.title);
  };

  const handleClear = () => {
    clearSetlist();
    setConfirmingClear(false);
    setManualCopyText(null);
  };

  return (
    <Manager aria-label="세트리스트">
      <ManagerHeader>
        <ManagerTitle>
          세트리스트 <Count>{count}곡</Count>
        </ManagerTitle>
        {confirmingClear ? (
          <Actions
            role="group"
            aria-label="초기화 확인"
            data-testid="setlist-actions"
          >
            <ConfirmText>정말 지울까요?</ConfirmText>
            <SmallButton type="button" $danger onClick={handleClear}>
              예
            </SmallButton>
            <SmallButton
              type="button"
              onClick={() => setConfirmingClear(false)}
            >
              취소
            </SmallButton>
          </Actions>
        ) : (
          <Actions data-testid="setlist-actions">
            <SmallButton
              type="button"
              onClick={handleCopy}
              disabled={count === 0}
            >
              {copyState === "copied" ? "복사됨!" : "복사"}
            </SmallButton>
            <SmallButton
              type="button"
              onClick={() => setConfirmingClear(true)}
              disabled={count === 0}
            >
              초기화
            </SmallButton>
          </Actions>
        )}
      </ManagerHeader>

      <FontSizeControl />

      {manualCopyText !== null && (
        <ManualCopy data-testid="manual-copy">
          <p>
            자동 복사가 안 돼서 아래에 띄웠어요. 선택된 글자를 직접 복사해
            주세요.
          </p>
          <ManualCopyText
            ref={manualRef}
            data-testid="manual-copy-text"
            value={manualCopyText}
            readOnly
            rows={Math.min(6, manualCopyText.split("\n").length)}
            onFocus={(event) => event.currentTarget.select()}
          />
          <SmallButton type="button" onClick={() => setManualCopyText(null)}>
            닫기
          </SmallButton>
        </ManualCopy>
      )}

      {count === 0 ? (
        <Empty data-testid="setlist-empty">
          아직 부른 곡이 없어요. 제목을 적고 Enter를 누르면 여기에 쌓여요.
        </Empty>
      ) : (
        <SongList
          ref={listRef}
          $sorting={drag !== null}
          onScroll={handleListScroll}
          data-testid="manager-list"
        >
          {songs.map((song, index) => (
            <SongItem
              key={song.id}
              $sorting={drag !== null}
              $dragging={drag?.id === song.id}
              style={
                { "--drag-shift": `${shiftFor(index)}px` } as CSSProperties
              }
              data-testid="manager-item"
              data-dragging={drag?.id === song.id || undefined}
            >
              <DragHandle
                type="button"
                {...handleProps(song, index)}
                // 제목을 고치는 동안에는 순서를 바꾸지 않는다. 곡이 하나면 옮길 곳이 없다.
                disabled={editingId !== null || count < 2}
                aria-label={`${song.title} 순서 바꾸기`}
                title="끌어서 순서 바꾸기"
                data-testid="song-drag"
              >
                ⠿
              </DragHandle>
              <SongNumber data-testid="manager-number">{index + 1}.</SongNumber>
              {editingId === song.id ? (
                <SongEditor
                  song={song}
                  onSave={(value) => handleSave(song, value)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <SongTitle
                    type="button"
                    $current={title !== "" && isSameSong(song.title, title)}
                    onClick={() => handleSelect(song)}
                    aria-pressed={title !== "" && isSameSong(song.title, title)}
                    title={
                      title !== "" && isSameSong(song.title, title)
                        ? "다시 눌러서 선택 취소"
                        : "눌러서 지금 부르는 곡으로"
                    }
                    data-testid="song-select"
                  >
                    {song.title}
                  </SongTitle>
                  <IconButton
                    type="button"
                    data-testid="song-edit"
                    onClick={() => setEditingId(song.id)}
                    aria-label={`${song.title} 수정`}
                    title="수정"
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                  </IconButton>
                  <IconButton
                    type="button"
                    $remove
                    data-testid="song-remove"
                    onClick={() => removeSong(song.id)}
                    aria-label={`${song.title} 삭제`}
                    title="삭제"
                  >
                    <X size={16} strokeWidth={1.8} />
                  </IconButton>
                </>
              )}
            </SongItem>
          ))}
        </SongList>
      )}
    </Manager>
  );
};

// 이미 있는 곡을 제출했을 때 독에 잠깐 보여주는 안내 시간
const NOTICE_MS = 3000;

const Control = () => {
  const title = useTitle();
  const inputRef = useRef<HTMLInputElement>(null);
  // id는 같은 안내가 다시 떠도 표시 시간을 새로 세기 위한 값
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const selectInput = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  // Enter 처리는 폼 제출 이벤트로만 한다. 값은 제출 시점의 입력창에서 직접 읽어
  // 한글 조합이 끝난 최종 값을 쓴다.
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = inputRef.current?.value.trim() ?? "";
    setTitle(next);
    // 빈 값(숨기기와 같은 동작)은 세트리스트에 넣지 않는다.
    // 이미 있는 곡이면 타이틀 바만 바뀌고 세트리스트는 그대로다.
    if (addSong(next) === "duplicate") {
      const number = findSongIndex(getSetlist(), next) + 1;
      setNotice({
        id: Date.now(),
        text: `이미 세트리스트에 있는 곡이에요 (${number}번)`,
      });
    } else {
      setNotice(null);
    }
    selectInput();
  };

  const handleHide = () => {
    setTitle("");
    selectInput();
  };

  // 곡 수정으로 타이틀 바 제목이 바뀌었으면, 입력창에 남은 수정 전 제목도 바꿔 둔다.
  // 그대로 두면 다음 Enter에서 오타가 다시 타이틀 바에 올라간다.
  const handleTitleRenamed = (previous: string, next: string) => {
    const input = inputRef.current;
    if (input && isSameSong(input.value, previous)) input.value = next;
  };

  // 목록에서 곡을 눌렀으면 입력창도 그 제목으로 맞춘다.
  // 그대로 두면 다음 Enter에서 입력창에 남아 있던 이전 제목이 다시 타이틀 바에 올라간다.
  const handleSongSelected = (next: string) => {
    if (inputRef.current) inputRef.current.value = next;
    setNotice(null);
  };

  return (
    <Page>
      <TitleForm onSubmit={handleSubmit}>
        <Label htmlFor="control-title">노래 제목</Label>
        <Row>
          <TitleInput
            ref={inputRef}
            id="control-title"
            type="text"
            defaultValue={title}
            placeholder="제목을 적고 Enter"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
          />
          <HideButton
            type="button"
            onClick={handleHide}
            data-testid="hide-button"
          >
            숨기기
          </HideButton>
        </Row>
      </TitleForm>
      <Status data-testid="status">
        <StatusLabel>지금 표시 중</StatusLabel>
        <StatusValue $empty={!title} data-testid="status-value">
          {title || "표시 안 함"}
        </StatusValue>
      </Status>
      {notice && (
        <Notice key={notice.id} role="status" data-testid="notice">
          {notice.text}
        </Notice>
      )}
      <SetlistManager
        onTitleRenamed={handleTitleRenamed}
        onSongSelected={handleSongSelected}
      />
      <PalettePicker />
    </Page>
  );
};

export default Control;
