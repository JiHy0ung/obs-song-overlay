import styled, { css, keyframes } from "styled-components";

// 모든 치수는 뷰포트(=브라우저 소스) 너비 기준 vw 단위다. 기준 소스 크기 480×940.
// 색상·폰트는 theme.ts의 setlist(곡 줄)와 title(별·가로선)에서, 배경 색과 배경의 별은 이 파일 위쪽 상수에서 바꾼다.
// 여기 적힌 색은 "기본값"이다. 독에서 색을 고르면 PaletteProvider가 계산한 색으로 덮어쓴다:
// theme의 색은 통째로 바뀌고, 이 파일의 상수는 var(--sl-…, 기본값) 자리에 CSS 변수로 들어온다.
const PADDING_TOP = "5.5vw";
const PADDING_X = "6.5vw";
const PADDING_BOTTOM = "5.5vw";

// 머리글: 음표, 그 옆 SETLIST 라벨, 오른쪽 끝의 곡 수, 아래 가로선. 글자 크기 배율의 영향을 받지 않는다.
const NOTE_HEIGHT = "5.6vw";
const LABEL_SIZE = "3.2vw";
const LINE_HEIGHT = "0.35vw";

// 곡 줄: 배율 100%일 때의 값. 실제 크기는 --setlist-scale(1 = 100%)을 곱해 정한다.
const ROW_FONT = "4vw";
const ROW_PADDING_Y = "1.25vw";
// 곡 줄의 좌우 안쪽 여백. 별의 빛이 목록 가장자리에서 잘리지 않도록 목록을 이만큼 바깥으로 넓힌다.
const ROW_INSET = "2.4vw";
const scaled = (value: string) => `calc(${value} * var(--setlist-scale, 1))`;

// 곡 제목 둘레에 깔리는 어두운 그림자. 배경이 옅어도 글자가 읽히게 한다.
const ROW_SHADOW_DEFAULT = "0 0 0.4em rgba(10, 8, 30, 0.8)";
const ROW_SHADOW = `var(--sl-shadow, ${ROW_SHADOW_DEFAULT})`;
// 지금 부르는 곡에 켜지는 별의 색
const STAR_COLOR = "#f8f7ff";

// 별자리: 왼쪽 세로선 위에 곡마다 점을 찍고, 지금 부르는 곡은 점 대신 별이 된다.
// 세로선이 머리글 음표의 한가운데 아래로 지나가도록, 이 값들은 글자 크기 배율과 무관하게 고정한다.
const MARK_COLUMN = "5vw";
const MARK_GAP = "3vw";
const DOT_SIZE = "1.46vw";
const STAR_SIZE = "5vw";
const RAIL_WIDTH = "0.3vw";
// 지금 부르는 곡의 글자가 다른 곡보다 커지는 비율
const CURRENT_FONT_RATIO = 1.07;

// 목록이 패널보다 길 때, 가려진 곡이 있는 쪽 가장자리가 투명해지는 길이
const FADE = "14vw";

// 배경: 가장자리가 들쭉날쭉하게 흩어지는 보랏빛 안개.
// 색은 왼쪽 위 → 가운데 → 오른쪽 아래 순서다.
const HAZE_TOP = "rgb(74, 52, 190)";
const HAZE_MIDDLE = "rgb(30, 22, 92)";
const HAZE_BOTTOM = "rgb(92, 50, 160)";
// 안개 전체의 진하기 (0 = 투명, 1 = 불투명)
const HAZE_OPACITY = 0.65;
// 안개는 두 겹이다. 짙은 안쪽(core) 위에, 더 넓고 옅게 퍼지는 바깥쪽(mist)을 겹쳐서 가장자리가 층지게 한다.
// inset: 소스 가장자리에서 안개 가장자리까지의 평균 거리(vw). 클수록 안개가 작아진다.
// swell: 가장자리가 들쭉날쭉한 정도. 0이면 반듯한 사각형, 클수록 불규칙해진다.
// blur: 가장자리가 흐려지는 정도(vw).
const HAZE_CORE = { inset: 6.4, swell: 1.7, blur: 2.4, opacity: 1 };
const HAZE_MIST = { inset: 4.4, swell: 2.1, blur: 4.2, opacity: 0.55 };
// 소스 가장자리에서 안개가 칼로 자른 듯 끊기지 않도록, 맨 바깥 이만큼은 서서히 투명해진다.
const HAZE_SOURCE_FADE = "2.4vw";

// 가장자리의 물결: [한 구간에 몇 번 굽이치는지, 굽이의 크기(vw), 시작 위치(0~1)]. 여러 물결을 더해 불규칙한 선을 만든다.
type Wave = [cycles: number, size: number, start: number];
type Side = "left" | "right" | "top" | "bottom";
const HAZE_WAVES: Record<"core" | "mist", Record<Side, Wave[]>> = {
  core: {
    left: [
      [1, 1.9, 0.13],
      [2, 1.3, 0.71],
      [3, 0.9, 0.38],
      [5, 0.5, 0.9],
    ],
    right: [
      [1, 1.7, 0.55],
      [2, 1.4, 0.2],
      [4, 0.8, 0.67],
      [5, 0.5, 0.05],
    ],
    top: [
      [1, 1.2, 0.3],
      [2, 1.0, 0.85],
      [3, 0.7, 0.5],
    ],
    bottom: [
      [1, 1.3, 0.75],
      [2, 0.9, 0.1],
      [3, 0.7, 0.62],
    ],
  },
  mist: {
    left: [
      [1, 1.6, 0.62],
      [2, 1.5, 0.08],
      [3, 1.0, 0.8],
      [4, 0.6, 0.33],
    ],
    right: [
      [1, 1.8, 0.02],
      [2, 1.2, 0.47],
      [3, 1.0, 0.15],
      [5, 0.6, 0.6],
    ],
    top: [
      [1, 1.0, 0.9],
      [2, 1.1, 0.4],
      [4, 0.6, 0.1],
    ],
    bottom: [
      [1, 1.1, 0.2],
      [2, 1.0, 0.66],
      [4, 0.6, 0.45],
    ],
  },
};
// 왼쪽·오른쪽 가장자리 무늬가 세로로 되풀이되는 길이(vw)
const HAZE_TILE = 96;
// 위·아래 가장자리 그림의 길이(vw). 패널이 이보다 길어질 일은 없다 (소스 비율 1:4까지).
const HAZE_TALL = 400;
// 안개 가장자리가 소스 가장자리에 이보다 가까이 가지 않게 한다(vw).
const HAZE_MIN_INSET = 0.6;
// 네 모서리가 깎이는 정도(vw). 0이면 각진 모서리.
const HAZE_CORNER = 6;
// 안개 속의 짙고 옅은 얼룩. HAZE_THIN은 가장 옅은 곳의 진하기(1이면 얼룩 없이 고르게 짙다).
const HAZE_THIN = 0.62;
// 짙은 덩어리들: 세로로 되풀이되는 한 묶음(100 × HAZE_PATCH_TILE vw) 안에서의 가운데(x, y), 가로·세로 반지름, 기울기(도)
const HAZE_PATCH_TILE = 130;
const HAZE_PATCHES = [
  { x: 34, y: 14, rx: 46, ry: 17, tilt: -8 },
  { x: 72, y: 44, rx: 40, ry: 15, tilt: 10 },
  { x: 26, y: 70, rx: 38, ry: 18, tilt: 6 },
  { x: 66, y: 100, rx: 48, ry: 16, tilt: -12 },
  { x: 20, y: 122, rx: 36, ry: 13, tilt: 4 },
];

// 한쪽 가장자리가 들쭉날쭉한 판을 마스크 그림(SVG)으로 만든다. 네 쪽을 겹쳐(교집합) 안개 모양을 만든다.
const hazeEdge = (side: Side, waves: Wave[], inset: number, swell: number) => {
  const vertical = side === "left" || side === "right";
  const length = vertical ? HAZE_TILE : 100;
  const height = vertical ? HAZE_TILE : HAZE_TALL;
  const points: string[] = [];
  for (let i = 0; i <= length; i += 1) {
    const ripple = waves.reduce(
      (sum, [cycles, size, start]) =>
        sum + size * Math.sin(2 * Math.PI * ((cycles * i) / length + start)),
      0,
    );
    // 위·아래 가장자리는 양 끝(모서리)에서 안쪽으로 더 파고들어, 모서리가 각지지 않고 둥글게 흩어진다.
    const corner = vertical
      ? 0
      : HAZE_CORNER * (Math.exp(-i / 7) + Math.exp(-(length - i) / 7));
    const depth = Math.max(HAZE_MIN_INSET, inset + ripple * swell + corner);
    const round = (value: number) => Math.round(value * 100) / 100;
    if (side === "left") points.push(`${round(depth)} ${i}`);
    if (side === "right") points.push(`${round(100 - depth)} ${i}`);
    if (side === "top") points.push(`${i} ${round(depth)}`);
    if (side === "bottom") points.push(`${i} ${round(height - depth)}`);
  }
  // 물결 선에서 반대쪽 끝까지를 채운다.
  const close = {
    left: `100 ${height} 100 0`,
    right: `0 ${height} 0 0`,
    top: `100 ${height} 0 ${height}`,
    bottom: `100 0 0 0`,
  }[side];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${height}" preserveAspectRatio="none"><polygon points="${points.join(" ")} ${close}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

// 안개 속 얼룩을 마스크 그림으로 만든다. 바탕은 HAZE_THIN만큼만 보이고, 덩어리가 있는 곳은 짙어진다.
const hazePatches = () => {
  const blobs = HAZE_PATCHES.flatMap(({ x, y, rx, ry, tilt }) =>
    // 묶음의 위아래 경계에 걸친 덩어리가 끊기지 않도록 위아래로 한 번씩 더 그린다.
    [-HAZE_PATCH_TILE, 0, HAZE_PATCH_TILE].map(
      (shift) =>
        `<ellipse cx="${x}" cy="${y + shift}" rx="${rx}" ry="${ry}" transform="rotate(${tilt} ${x} ${y + shift})" fill="url(#g)"/>`,
    ),
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${HAZE_PATCH_TILE}" preserveAspectRatio="none"><defs><radialGradient id="g"><stop offset="0" stop-opacity="1"/><stop offset="0.45" stop-opacity="0.75"/><stop offset="1" stop-opacity="0"/></radialGradient></defs><rect width="100" height="${HAZE_PATCH_TILE}" opacity="${HAZE_THIN}"/>${blobs}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

const hazeMask = (
  layer: "core" | "mist",
  inset: number,
  swell: number,
  patchy: boolean,
) => {
  const waves = HAZE_WAVES[layer];
  const edges = (["left", "right", "top", "bottom"] as const).map((side) =>
    hazeEdge(side, waves[side], inset, swell),
  );
  const images = (patchy ? [hazePatches(), ...edges] : edges).join(", ");
  const edgeSizes = `100% ${HAZE_TILE}vw, 100% ${HAZE_TILE}vw, 100% ${HAZE_TALL}vw, 100% ${HAZE_TALL}vw`;
  const sizes = patchy ? `100% ${HAZE_PATCH_TILE}vw, ${edgeSizes}` : edgeSizes;
  const first = patchy ? "top, " : "";
  const firstRepeat = patchy ? "repeat-y, " : "";
  return css`
    -webkit-mask-image: ${images};
    -webkit-mask-size: ${sizes};
    -webkit-mask-position: ${first}top, top, top, bottom;
    -webkit-mask-repeat: ${firstRepeat}repeat-y, repeat-y, no-repeat, no-repeat;
    -webkit-mask-composite: source-in;
    mask-image: ${images};
    mask-size: ${sizes};
    mask-position: ${first}top, top, top, bottom;
    mask-repeat: ${firstRepeat}repeat-y, repeat-y, no-repeat, no-repeat;
    mask-composite: intersect;
  `;
};

// 배경에 흩뿌린 작은 별. 패널 오른쪽에 세로로 되풀이되는 한 묶음(SKY_WIDTH × SKY_HEIGHT) 안에서의
// 자리(x, y)와 크기(size)를 적는다. 숫자의 단위는 모두 vw다. cross는 네 갈래 별, 없으면 둥근 점.
// 두 묶음(SKY_A, SKY_B)이 서로 다른 박자로 깜빡인다.
type SkyStar = { x: number; y: number; size: number; cross?: boolean };
const SKY_WIDTH = 40;
const SKY_HEIGHT = 56;
const SKY_A: SkyStar[] = [
  { x: 30, y: 5, size: 0.7 },
  { x: 12, y: 11, size: 0.4 },
  { x: 36, y: 21, size: 0.5 },
  { x: 33, y: 38, size: 0.7 },
  { x: 8, y: 45, size: 0.4 },
  { x: 26, y: 51, size: 0.5 },
  { x: 24, y: 16, size: 2.2, cross: true },
  { x: 13, y: 34, size: 1.6, cross: true },
];
const SKY_B: SkyStar[] = [
  { x: 5, y: 4, size: 0.35 },
  { x: 18, y: 24, size: 0.35 },
  { x: 37, y: 30, size: 0.4 },
  { x: 3, y: 27, size: 0.35 },
  { x: 16, y: 52, size: 0.4 },
  { x: 38, y: 48, size: 0.35 },
  { x: 34, y: 10, size: 1.5, cross: true },
  { x: 22, y: 43, size: 1.8, cross: true },
];
const SKY_COLOR = "#f8f7ff";
const SKY_STAR_PATH =
  "M12 0C12.8 7.4 16.6 11.2 24 12 16.6 12.8 12.8 16.6 12 24 11.2 16.6 7.4 12.8 0 12 7.4 11.2 11.2 7.4 12 0Z";

// 별 한 묶음을 마스크 그림(SVG)으로 만든다. 색은 Sky에서 칠한다.
const skyImage = (stars: SkyStar[]) => {
  const shapes = stars
    .map(({ x, y, size, cross }) =>
      cross
        ? `<path transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})" d="${SKY_STAR_PATH}"/>`
        : `<circle cx="${x}" cy="${y}" r="${size / 2}"/>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SKY_WIDTH} ${SKY_HEIGHT}">${shapes}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export const ENTER_MS = 300;
// 삭제·초기화된 항목이 사라지는 시간
export const LEAVE_MS = 250;
// 다른 항목이 추가·삭제되어 자리를 옮길 때 미끄러지는 시간
export const MOVE_MS = 300;
export const MOVE_EASING = "cubic-bezier(0.2, 0.8, 0.2, 1)";
// 패널이 처음 나타날 때 머리글 가로선이 그려지는 시간
const LINE_DRAW_MS = 600;
// 강조 띠가 옮겨갈 때 나타나고 사라지는 시간
const HIGHLIGHT_MS = 300;

const panelEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(2vw);
  }
`;

const panelLeave = keyframes`
  to {
    opacity: 0;
  }
`;

const drawLine = keyframes`
  from {
    transform: scaleX(0);
  }
`;

// 줄 전체는 투명도만 바꾼다. 줄을 옆으로 밀면 세로선이 함께 어긋나 보인다.
const itemEnter = keyframes`
  from {
    opacity: 0;
  }
`;

const itemLeave = keyframes`
  to {
    opacity: 0;
  }
`;

// 새 곡의 제목은 왼쪽에서 살짝 밀려 들어온다.
const titleEnter = keyframes`
  from {
    transform: translateX(-3vw);
  }
`;

// 새 곡의 점은 작은 점에서 커지며 켜진다.
const markEnter = keyframes`
  from {
    transform: scale(0);
  }
`;

// 강조되는 순간: 작은 별이 큰 별 자리에서 제자리(--x, --y)로 튀어나왔다가 사라진다.
const sparkleBurst = keyframes`
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0) rotate(-90deg);
  }
  35% {
    opacity: 1;
  }
  70% {
    opacity: 1;
    transform: translate(var(--x), var(--y)) scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(var(--x), var(--y)) scale(0.2) rotate(45deg);
  }
`;

// 강조된 동안: 작은 별이 제자리에서 가끔 한 번씩 깜빡인다.
const sparkleBlink = keyframes`
  0%,
  72%,
  100% {
    opacity: 0;
    transform: translate(var(--x), var(--y)) scale(0.2);
  }
  86% {
    opacity: 0.95;
    transform: translate(var(--x), var(--y)) scale(1);
  }
`;

// 강조되는 순간: 제목 뒤로 빛이 한 번 번졌다가 가라앉는다.
// 움직이는 동안에는 여기 적힌 값이 글자 그림자를 통째로 대신하므로, 어두운 그림자(ROW_SHADOW)도
// 단계마다 함께 적어야 한다. 빼면 빛이 가라앉을 때까지 어두운 그림자가 사라졌다가 뒤늦게 나타난다.
const titleGlow = keyframes`
  0% {
    text-shadow:
      ${ROW_SHADOW},
      0 0 0 transparent,
      0 0 0 transparent;
  }
  30% {
    text-shadow:
      ${ROW_SHADOW},
      0 0 2.4vw var(--glow),
      0 0 0.8vw var(--glow);
  }
  100% {
    text-shadow:
      ${ROW_SHADOW},
      0 0 0 transparent,
      0 0 0 transparent;
  }
`;

// 배경의 작은 별이 천천히 밝아졌다 어두워진다.
const skyTwinkle = keyframes`
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

// 타이틀 바의 별과 같은 반짝임
const twinkle = keyframes`
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.84);
  }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: ${({ theme }) => theme.font.family};
`;

// 소스 위쪽 끝에서 시작해 곡이 늘수록 아래로 길어지고, 뷰포트 높이에서 멈춘다.
// 배경(Haze)과 작은 별(Sky)은 글자 아래에 따로 깔린다.
export const Panel = styled.div<{ $leaving: boolean }>`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  padding: ${PADDING_TOP} ${PADDING_X} ${PADDING_BOTTOM};
  color: ${({ theme }) => theme.setlist.text};
  animation: ${({ $leaving }) =>
    $leaving
      ? css`
          ${panelLeave} ${LEAVE_MS}ms ease-in forwards
        `
      : css`
          ${panelEnter} ${ENTER_MS}ms ${MOVE_EASING} both
        `};
`;

// 안개. 겹(i)마다 흐림은 겉에, 들쭉날쭉한 모양(마스크)은 속(::before)에 둬서 모양째로 흐려지게 한다.
const hazeFade = `linear-gradient(to right, transparent, #000 ${HAZE_SOURCE_FADE}, #000 calc(100% - ${HAZE_SOURCE_FADE}), transparent), linear-gradient(to bottom, transparent, #000 ${HAZE_SOURCE_FADE}, #000 calc(100% - ${HAZE_SOURCE_FADE}), transparent)`;

export const Haze = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: var(--sl-haze-opacity, ${HAZE_OPACITY});
  pointer-events: none;
  -webkit-mask-image: ${hazeFade};
  -webkit-mask-composite: source-in;
  mask-image: ${hazeFade};
  mask-composite: intersect;

  i {
    position: absolute;
    inset: 0;
  }

  i::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      var(--sl-haze-top, ${HAZE_TOP}),
      var(--sl-haze-middle, ${HAZE_MIDDLE}) 55%,
      var(--sl-haze-bottom, ${HAZE_BOTTOM})
    );
  }

  /* 바깥쪽: 넓고 옅게 */
  i:first-child {
    opacity: ${HAZE_MIST.opacity};
    filter: blur(${HAZE_MIST.blur}vw);
  }

  i:first-child::before {
    ${hazeMask("mist", HAZE_MIST.inset, HAZE_MIST.swell, false)}
  }

  /* 안쪽: 짙게 */
  i:last-child {
    opacity: ${HAZE_CORE.opacity};
    filter: blur(${HAZE_CORE.blur}vw);
  }

  i:last-child::before {
    ${hazeMask("core", HAZE_CORE.inset, HAZE_CORE.swell, true)}
  }
`;

// 배경의 작은 별들. 안개 위, 글자 아래에 놓인다. 패널 오른쪽에 세로로 되풀이되고 위아래 끝에서 흐려진다.
export const Sky = styled.div`
  position: absolute;
  top: ${HAZE_CORE.inset}vw;
  right: 6vw;
  bottom: ${HAZE_CORE.inset}vw;
  z-index: -1;
  width: ${SKY_WIDTH}vw;
  pointer-events: none;
  filter: drop-shadow(0 0 0.8vw ${({ theme }) => theme.title.glow});
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent,
    #000 5vw,
    #000 calc(100% - 5vw),
    transparent
  );
  mask-image: linear-gradient(
    to bottom,
    transparent,
    #000 5vw,
    #000 calc(100% - 5vw),
    transparent
  );

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--sl-sky, ${SKY_COLOR});
    -webkit-mask-repeat: repeat-y;
    -webkit-mask-size: ${SKY_WIDTH}vw ${SKY_HEIGHT}vw;
    mask-repeat: repeat-y;
    mask-size: ${SKY_WIDTH}vw ${SKY_HEIGHT}vw;
  }

  &::before {
    -webkit-mask-image: ${skyImage(SKY_A)};
    mask-image: ${skyImage(SKY_A)};
    animation: ${skyTwinkle} 5.2s ease-in-out infinite;
  }

  &::after {
    -webkit-mask-image: ${skyImage(SKY_B)};
    mask-image: ${skyImage(SKY_B)};
    animation: ${skyTwinkle} 6.8s ease-in-out -2.4s infinite;
  }
`;

export const Header = styled.div`
  position: relative;
  flex: none;
`;

// 음표와 SETLIST 라벨이 나란히 놓이는 줄.
// 음표는 세로선과 같은 칸의 한가운데에, 라벨은 곡 제목과 같은 선에서 시작한다.
export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${MARK_GAP};
`;

// 음표. 세로선이 지나가는 칸(MARK_COLUMN)의 가운데에 놓인다.
export const HeaderNote = styled.svg`
  flex: none;
  display: block;
  box-sizing: content-box;
  width: calc(${NOTE_HEIGHT} * 0.625);
  height: ${NOTE_HEIGHT};
  padding: 0 calc((${MARK_COLUMN} - ${NOTE_HEIGHT} * 0.625) / 2);
  overflow: visible;
  color: ${({ theme }) => theme.title.lineEnd};
  transform: rotateZ(7deg);
  filter: drop-shadow(0 0 1.6vw ${({ theme }) => theme.title.glow})
    drop-shadow(0 0 0.4vw ${({ theme }) => theme.title.glow});
`;

export const HeaderLabel = styled.div`
  color: ${({ theme }) => theme.setlist.label};
  font-size: ${LABEL_SIZE};
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.2em;
  text-shadow: ${ROW_SHADOW};
`;

// 머리글 오른쪽 끝의 곡 수
export const HeaderCount = styled.div`
  margin-left: auto;
  color: ${({ theme }) => theme.setlist.label};
  font-size: ${LABEL_SIZE};
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  white-space: nowrap;
  text-shadow: ${ROW_SHADOW};
`;

// 패널 너비를 가로지르는 선. 양 끝이 흐려진다.
export const HeaderLine = styled.div`
  height: ${LINE_HEIGHT};
  margin-top: 3.2vw;
  background: linear-gradient(
    to right,
    transparent,
    ${({ theme }) => theme.setlist.line} 25%,
    ${({ theme }) => theme.setlist.line} 75%,
    transparent
  );
  filter: drop-shadow(0 0 0.5vw var(--sl-line-glow, transparent));
  transform-origin: center;
  animation: ${drawLine} ${LINE_DRAW_MS}ms ${MOVE_EASING} 120ms both;
`;

// 목록이 패널보다 길면 코드로 위치를 옮겨서(스크롤) 지금 부르는 곡을 보여준다. 스크롤바는 없다.
// 가려진 곡이 있는 쪽 가장자리는 서서히 투명해진다.
// position: relative는 항목의 offsetTop 기준점(FLIP 전환·위치 계산)이 된다.
const fadeMask = (top: boolean, bottom: boolean) =>
  `linear-gradient(to bottom, ${top ? "transparent" : "#000"}, #000 ${FADE}, #000 calc(100% - ${FADE}), ${bottom ? "transparent" : "#000"})`;

export const List = styled.div<{ $fadeTop: boolean; $fadeBottom: boolean }>`
  position: relative;
  flex: 0 1 auto;
  min-height: 0;
  margin: 1.4vw -${ROW_INSET} 0;
  overflow: hidden;

  ${({ $fadeTop, $fadeBottom }) =>
    ($fadeTop || $fadeBottom) &&
    css`
      -webkit-mask-image: ${fadeMask($fadeTop, $fadeBottom)};
      mask-image: ${fadeMask($fadeTop, $fadeBottom)};
    `}
`;

export const Items = styled.ol`
  flex: none;
  margin: 0;
  padding: 0;
  list-style: none;
`;

// 세로선 위의 표시가 놓이는 칸. 점과 별을 같은 자리에 겹쳐 두고 번갈아 보여준다.
export const Mark = styled.span`
  position: relative;
  z-index: 1;
  flex: none;
  display: grid;
  place-items: center;
  /* 높이를 0으로 두고 가운데로 넘치게 해서, 큰 별이 줄 높이를 늘리지 않게 한다. */
  align-content: center;
  width: ${MARK_COLUMN};
  height: 0;
  animation: ${markEnter} ${ENTER_MS}ms ${MOVE_EASING} both;
`;

export const Dot = styled.i`
  grid-area: 1 / 1;
  width: ${DOT_SIZE};
  height: ${DOT_SIZE};
  border-radius: 50%;
  background:
    linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    var(--sl-dot, ${({ theme }) => theme.setlist.line});
  box-shadow: 0 0 1.2vw ${({ theme }) => theme.title.glow};

  transition:
    opacity ${HIGHLIGHT_MS}ms ease,
    transform ${HIGHLIGHT_MS}ms ease;
`;

// 겉(나타남·사라짐)과 속(반짝임)을 나눠 두 움직임이 서로 덮어쓰지 않게 한다.
export const StarSlot = styled.span`
  grid-area: 1 / 1;
  width: ${STAR_SIZE};
  height: ${STAR_SIZE};
  opacity: 0;
  transform: scale(0.3) rotate(-45deg);
  transition:
    opacity ${HIGHLIGHT_MS}ms ease,
    transform ${HIGHLIGHT_MS}ms ${MOVE_EASING};
`;

export const Star = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  color: var(--sl-star, ${STAR_COLOR});
  filter: drop-shadow(0 0 1.2vw ${({ theme }) => theme.title.glow})
    drop-shadow(0 0 0.4vw ${({ theme }) => theme.title.glow});
`;

// 작은 별 하나하나의 자리(큰 별 가운데 기준), 크기, 깜빡임이 시작되는 시점.
// 오른쪽은 제목이 시작되는 곳이라 너무 멀리 보내지 않는다.
const SPARKLES = [
  { x: "3.4vw", y: "-2.7vw", size: "2.2vw", delay: 1.1 },
  { x: "-3vw", y: "-2vw", size: "1.6vw", delay: 2.6 },
  { x: "3.1vw", y: "2.5vw", size: "1.5vw", delay: 3.7 },
  { x: "-2.6vw", y: "2.7vw", size: "2vw", delay: 1.9 },
];
export const SPARKLE_COUNT = SPARKLES.length;
const SPARKLE_BURST_MS = 800;
const SPARKLE_BLINK_S = 4.2;

const sparklePositions = SPARKLES.map(
  (sparkle, i) => css`
    &:nth-of-type(${i + 1}) {
      --x: ${sparkle.x};
      --y: ${sparkle.y};
      --blink-delay: ${sparkle.delay}s;
      width: ${sparkle.size};
      height: ${sparkle.size};
    }
  `,
);

// 평소에는 보이지 않고, 지금 부르는 곡이 되면 Item 쪽에서 움직임을 붙인다.
export const Sparkle = styled.svg`
  grid-area: 1 / 1;
  overflow: visible;
  color: ${({ theme }) => theme.title.lineEnd};
  filter: drop-shadow(0 0 0.6vw ${({ theme }) => theme.title.glow});
  opacity: 0;
  pointer-events: none;
  ${sparklePositions}
`;

export const SongTitle = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  letter-spacing: -0.005em;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color ${HIGHLIGHT_MS}ms ease;
  animation: ${titleEnter} ${ENTER_MS}ms ${MOVE_EASING} both;
`;

export const Item = styled.li<{ $leaving: boolean; $current: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${MARK_GAP};
  padding: ${scaled(ROW_PADDING_Y)} ${ROW_INSET};
  font-size: ${scaled(ROW_FONT)};
  font-weight: ${({ theme }) => theme.setlist.weight};
  line-height: 1.4;
  text-shadow: ${ROW_SHADOW};
  transition: font-size ${HIGHLIGHT_MS}ms ${MOVE_EASING};
  animation: ${({ $leaving }) =>
    $leaving
      ? css`
          ${itemLeave} ${LEAVE_MS}ms ease-in forwards
        `
      : css`
          ${itemEnter} ${ENTER_MS}ms ${MOVE_EASING} both
        `};

  /* 세로선. 줄마다 한 토막씩 그려서 이어 붙인다. 첫 곡은 점에서 시작하고 마지막 곡은 점에서 끝난다. */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(${ROW_INSET} + (${MARK_COLUMN} - ${RAIL_WIDTH}) / 2);
    width: ${RAIL_WIDTH};
    background: ${({ theme }) => theme.setlist.line};
    opacity: 0.5;
    box-shadow: 0 0 0.6vw var(--sl-line-glow, transparent);
  }

  &:first-child::before {
    top: 50%;
  }

  &:last-child::before {
    bottom: 50%;
  }

  /* 지금 부르는 곡: 점이 별로 바뀌고, 글자가 조금 커지고 밝아진다. */
  ${({ $current, theme }) =>
    $current &&
    css`
      font-size: ${scaled(`calc(${ROW_FONT} * ${CURRENT_FONT_RATIO})`)};
      font-weight: 500;

      ${Dot} {
        opacity: 0;
        transform: scale(0);
      }

      ${StarSlot} {
        opacity: 1;
        transform: none;
      }

      ${Star} {
        animation: ${twinkle} 2.6s ease-in-out infinite;
      }

      /* 강조되는 순간 한 번 튀어나오고, 그 뒤로는 저마다 다른 때에 가끔 깜빡인다. */
      ${Sparkle} {
        animation:
          ${sparkleBurst} ${SPARKLE_BURST_MS}ms ${MOVE_EASING} both,
          ${sparkleBlink} ${SPARKLE_BLINK_S}s ease-in-out var(--blink-delay)
            infinite;
      }

      ${SongTitle} {
        --glow: ${theme.title.glow};
        color: ${theme.setlist.highlightText};
        animation:
          ${titleEnter} ${ENTER_MS}ms ${MOVE_EASING} both,
          ${titleGlow} 1200ms ease-out;
      }
    `}
`;

// 바닥글: 패널 맨 아래의 날짜. 양옆에 가운데로 갈수록 진해지는 가는 선을 둔다.
// 곡이 패널 높이를 넘어도 줄어들지 않고 맨 아래에 그대로 있다. 글자 크기 배율의 영향을 받지 않는다.
const FOOTER_FONT = "2.8vw";

export const Footer = styled.div`
  flex: none;
  display: flex;
  align-items: center;
  gap: 2.4vw;
  margin-top: 2.6vw;
`;

export const FooterLine = styled.span<{ $reverse?: boolean }>`
  flex: 1 1 0;
  height: 0.25vw;
  background: linear-gradient(
    to ${({ $reverse }) => ($reverse ? "left" : "right")},
    transparent,
    ${({ theme }) => theme.setlist.line}
  );
  filter: drop-shadow(0 0 0.5vw var(--sl-line-glow, transparent));
  opacity: 1;
`;

export const FooterDate = styled.span`
  flex: none;
  color: ${({ theme }) => theme.setlist.number};
  font-size: ${FOOTER_FONT};
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  text-shadow: ${ROW_SHADOW};
`;
