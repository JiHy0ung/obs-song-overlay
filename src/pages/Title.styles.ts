import styled, { css, keyframes } from "styled-components";

// 모든 치수는 뷰포트(=브라우저 소스) 높이 기준 vh 단위다. 기준 소스 크기 900×140.
// 색상·폰트·글로우 세기는 theme.ts의 title에서 바꾼다.
const TITLE_SIZE = "26vh";
const LABEL_SIZE = "10vh";
const ICON_SIZE = "54vh";
const ICON_GAP = "13vh";
const LINE_HEIGHT = "1.2vh";
const MAIN_STAR_SIZE = "15vh";
// 가로선 끝 큰 별의 그림자(빛 번짐) 색
const MAIN_STAR_GLOW = "rgba(171, 135, 255, 0.9)";
const WAVE_HEIGHT = "18vh";
const WAVE_BAR_WIDTH = "1.9vh";
const WAVE_GAP = "2vh";

// 글로우·별·?bg=1 배경이 소스 가장자리에서 잘리지 않도록 두는 여백
export const EDGE_X = "18vh";
const EDGE_Y = "18vh";
// 흐를 때 제목 영역 양 끝이 투명해지는 길이
const FADE = "3vh";

// 처음 나타날 때: 선 그리기 → 별 켜짐 → 나머지 페이드인. 합쳐서 600ms.
const LINE_MS = 320;
const STAR_DELAY_MS = 240;
const STAR_MS = 220;
const CONTENT_DELAY_MS = 300;
const CONTENT_MS = 400;
// 사라질 때 전체가 함께 페이드아웃
export const HIDE_MS = 300;
// 제목만 바뀔 때: 이전 제목이 나가는 시간 → 새 제목이 들어오는 시간
export const TEXT_OUT_MS = 180;
const TEXT_IN_MS = 240;
// 제목 길이가 달라질 때 바(가로선·별)가 따라 늘고 줄어드는 시간
const RESIZE_MS = 360;
const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export type Align = "left" | "center" | "right";

const justify: Record<Align, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const drawLine = keyframes`
  from {
    transform: scaleX(0);
  }
`;

const starOn = keyframes`
  from {
    opacity: 0.5;
    transform: scale(0.2) rotate(-45deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
`;

const textIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(14%);
  }
`;

const textOut = keyframes`
  to {
    opacity: 0;
    transform: translateY(-14%);
  }
`;

const twinkle = keyframes`
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.82);
  }
`;

// 사운드 웨이브의 움직임 패턴 세 가지. 값은 막대 길이 비율(1 = 원래 길이).
const waveA = keyframes`
  0%, 100% { transform: scaleY(0.55); }
  12% { transform: scaleY(1); }
  27% { transform: scaleY(0.4); }
  41% { transform: scaleY(0.85); }
  58% { transform: scaleY(0.3); }
  74% { transform: scaleY(0.95); }
  88% { transform: scaleY(0.5); }
`;

const waveB = keyframes`
  0%, 100% { transform: scaleY(0.9); }
  15% { transform: scaleY(0.35); }
  30% { transform: scaleY(0.75); }
  46% { transform: scaleY(1); }
  61% { transform: scaleY(0.45); }
  79% { transform: scaleY(0.7); }
  92% { transform: scaleY(0.3); }
`;

const waveC = keyframes`
  0%, 100% { transform: scaleY(0.4); }
  18% { transform: scaleY(0.8); }
  33% { transform: scaleY(0.5); }
  49% { transform: scaleY(0.3); }
  64% { transform: scaleY(1); }
  81% { transform: scaleY(0.6); }
  93% { transform: scaleY(0.85); }
`;

const scroll = keyframes`
  to {
    transform: translateX(-50%);
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

// 레코드판이 한 바퀴 도는 시간(초). 작을수록 빨라진다.
const RECORD_SPIN_S = 6;

// 레코드판에서 회전하는 안쪽 부분
export const RecordDisc = styled.g`
  transform-origin: 12px 12px;
  animation: ${spin} ${RECORD_SPIN_S}s linear infinite;
`;

// 아이콘·라벨·제목·웨이브가 선과 별 다음에 함께 나타난다.
const contentEnter = css`
  animation: ${fadeIn} ${CONTENT_MS}ms ease-out ${CONTENT_DELAY_MS}ms both;
`;

export const Overlay = styled.div<{ $align: Align }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => justify[$align]};
  padding: ${EDGE_Y} ${EDGE_X};
  overflow: hidden;
  font-family: ${({ theme }) => theme.font.family};
`;

export const Bar = styled.div<{ $hiding: boolean; $backdrop: boolean }>`
  position: relative;
  display: inline-flex;
  margin-right: 20vh;
  align-items: center;
  max-width: 100%;
  opacity: ${({ $hiding }) => ($hiding ? 0 : 1)};
  transition: opacity ${HIDE_MS}ms ease-in;

  /* ?bg=1: 가장자리가 흐려지는 어두운 반투명 배경 (backdrop-filter 없이 자체 blur) */
  ${({ $backdrop, theme }) =>
    $backdrop &&
    css`
      &::before {
        content: "";
        position: absolute;
        inset: 2vh 50vh 7vh 50vh;
        z-index: -1;
        border-radius: 14vh;
        background: ${theme.title.backdrop};
        opacity: 0.5;
        filter: blur(13vh);
        animation: ${fadeIn} ${CONTENT_MS}ms ease-out both;
      }
    `}
`;

export const Icon = styled.svg`
  flex: none;
  width: ${ICON_SIZE};
  height: ${ICON_SIZE};
  margin-right: ${ICON_GAP};
  color: ${({ theme }) => theme.title.accent};
  filter: drop-shadow(0 0 0.5vh ${({ theme }) => theme.title.shadow})
    drop-shadow(0 0 1.6vh ${({ theme }) => theme.title.glow});
  ${contentEnter}
`;

export const Body = styled.div`
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
`;

export const Label = styled.div`
  color: ${({ theme }) => theme.title.lineEnd};
  font-size: ${LABEL_SIZE};
  font-weight: ${({ theme }) => theme.title.labelWeight};
  line-height: 1.2;
  letter-spacing: 0.2em;
  white-space: nowrap;
  text-shadow:
    0 0 1vh ${({ theme }) => theme.title.glow},
    0 0.3vh 1.4vh ${({ theme }) => theme.title.glow};
  ${contentEnter}
`;

// 라벨 왼쪽 끝에서 바 오른쪽 끝까지 이어지는 가로선. 끝에 큰 별이 붙는다.
export const Rule = styled.div`
  position: relative;
  height: ${LINE_HEIGHT};
  margin: 4.6vh 0 3.4vh;
`;

export const Line = styled.div`
  position: absolute;
  inset: 0;
  border-radius: ${LINE_HEIGHT};
  background: linear-gradient(
    to right,
    ${({ theme }) => theme.title.lineStart} 0%,
    ${({ theme }) => theme.title.lineEnd} 50%
  );
  box-shadow: 0 0 1vh ${({ theme }) => theme.title.glow};
  transform-origin: left center;
  animation: ${drawLine} ${LINE_MS}ms ${EASE_OUT} both;

  /* 선 끝(별 쪽)의 보라빛 글로우 */
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0;
    width: 30%;
    height: 400%;
    border-radius: 50%;
    background: radial-gradient(
      closest-side at 100% 50%,
      ${({ theme }) => theme.title.glow},
      transparent
    );
    opacity: 0.7;
    transform: translateY(-50%);
  }
`;

// 별의 등장(scale)과 반복 반짝임(twinkle)이 서로 덮어쓰지 않도록 겉(위치·등장)과 속(반짝임)을 나눈다.
const StarSlot = styled.span<{ $size: string }>`
  position: absolute;
  color: ${({ theme }) => theme.title.accent};
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  pointer-events: none;
`;

export const MainStar = styled(StarSlot)`
  color: ${({ theme }) => theme.title.lineEnd};
  top: 50%;
  right: 0;
  margin: calc(${MAIN_STAR_SIZE} / -2) calc(${MAIN_STAR_SIZE} / -2) 0 0;
  animation: ${starOn} ${STAR_MS}ms ${EASE_OUT} ${STAR_DELAY_MS}ms both;

  /* 넓게 번지는 빛은 Rule의 ::before가 선 뒤에서 맡는다. 여기는 별 윤곽에 붙은 얇은 빛만 둔다. */
  svg {
    filter: drop-shadow(0 0 1.5vh ${MAIN_STAR_GLOW})
      drop-shadow(0 0 6vh ${MAIN_STAR_GLOW})
      drop-shadow(0 0 6vh ${MAIN_STAR_GLOW});
  }
`;

// 사운드 웨이브 주변의 작은 장식 별. 위치는 Row 기준.
export const SmallStar = styled(StarSlot)<{
  $top: string;
  $right: string;
  $delay: string;
}>`
  top: ${({ $top }) => $top};
  right: ${({ $right }) => $right};
  animation: ${starOn} ${STAR_MS}ms ${EASE_OUT} ${CONTENT_DELAY_MS}ms both;

  svg {
    animation-delay: ${({ $delay }) => $delay};
    animation-duration: 3.4s;
  }
`;

export const Star = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  color: inherit;
  filter: drop-shadow(
      0 0 ${({ theme }) => theme.title.glowBlur}
        ${({ theme }) => theme.title.glow}
    )
    drop-shadow(0 0 0.6vh ${({ theme }) => theme.title.glow});
  animation: ${twinkle} 2.6s ease-in-out infinite;
`;

// 제목과 사운드 웨이브가 놓이는 줄. 별이 바깥으로 튀어나오는 만큼 오른쪽을 비운다.
export const Row = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  padding-right: 3vh;
`;

// 제목 영역. 너비(--title-w, 측정값)가 바뀌면 부드럽게 따라가고, 바 최대 너비를 넘으면 flex가 줄인다.
export const TitleSlot = styled.div<{ $marquee: boolean }>`
  flex: 0 1 auto;
  width: var(--title-w, auto);
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: width ${RESIZE_MS}ms ${EASE_OUT};
  ${contentEnter}

  ${({ $marquee }) =>
    $marquee &&
    css`
      -webkit-mask-image: linear-gradient(
        to right,
        transparent,
        #000 ${FADE},
        #000 calc(100% - ${FADE}),
        transparent
      );
      mask-image: linear-gradient(
        to right,
        transparent,
        #000 ${FADE},
        #000 calc(100% - ${FADE}),
        transparent
      );
    `}
`;

export const TitleText = styled.div<{ $leaving: boolean }>`
  color: ${({ theme }) => theme.title.text};
  font-size: ${TITLE_SIZE};
  font-weight: ${({ theme }) => theme.title.weight};
  line-height: 1.25;
  letter-spacing: -0.025em;
  text-shadow:
    0 0 0.5vh ${({ theme }) => theme.title.backdrop},
    0 0.3vh 1vh ${({ theme }) => theme.title.backdrop},
    0 0.6vh 3vh ${({ theme }) => theme.title.backdrop};
  animation: ${({ $leaving }) =>
    $leaving
      ? css`
          ${textOut} ${TEXT_OUT_MS}ms ease-in forwards
        `
      : css`
          ${textIn} ${TEXT_IN_MS}ms ${EASE_OUT} both
        `};
`;

// 흐르는 시간과 반복 간격은 측정값이므로 style의 CSS 변수(--marquee-duration, --marquee-gap)로 받는다.
export const Track = styled.div<{ $marquee: boolean }>`
  display: inline-flex;

  ${({ $marquee }) =>
    $marquee &&
    css`
      animation: ${scroll} var(--marquee-duration) linear infinite;
    `}
`;

export const Copy = styled.span<{ $marquee: boolean }>`
  ${({ $marquee }) =>
    $marquee &&
    css`
      padding-right: var(--marquee-gap);
    `}
`;

// 제목 영역이 최소 너비보다 짧을 때 남는 공간을 채워 웨이브를 오른쪽 끝에 붙인다.
export const Spacer = styled.div`
  flex: 1 1 0;
  min-width: 25vh;
`;

// 막대 높이 비율 (가운데가 길고 양옆이 짧은 대칭)
const WAVE_BARS = [0.34, 0.58, 0.82, 1, 0.82, 0.58, 0.34];
export const WAVE_BAR_COUNT = WAVE_BARS.length;
// 막대마다 패턴, 한 바퀴 시간(초), 시작 시점을 다르게 준다.
// 시간이 서로 달라서 전체 모양이 같은 순서로 되풀이되지 않는다.
const WAVE_MOTIONS = [
  { name: waveB, seconds: 1.7, delay: -0.2 },
  { name: waveA, seconds: 2.3, delay: -1.1 },
  { name: waveC, seconds: 1.9, delay: -0.6 },
  { name: waveA, seconds: 2.1, delay: 0 },
  { name: waveB, seconds: 1.5, delay: -0.9 },
  { name: waveC, seconds: 2.5, delay: -1.6 },
  { name: waveA, seconds: 1.8, delay: -0.4 },
];
// 사운드 웨이브 속도 배율. 클수록 느려진다 (1 = 기본, 2 = 절반 속도).
const WAVE_SLOW = 1.6;

const waveBarStyles = WAVE_BARS.map((scale, i) => {
  const motion = WAVE_MOTIONS[i % WAVE_MOTIONS.length];
  return css`
    &:nth-child(${i + 1}) {
      height: ${scale * 100}%;
      animation: ${motion.name} ${motion.seconds * WAVE_SLOW}s ease-in-out
        ${motion.delay * WAVE_SLOW}s infinite;
    }
  `;
});

export const Wave = styled.div`
  display: flex;
  flex: none;
  align-items: center;
  gap: ${WAVE_GAP};
  height: ${WAVE_HEIGHT};
  margin-right: 12vh;
  filter: drop-shadow(0 0 10vh ${({ theme }) => theme.title.shadow})
    drop-shadow(0 0 1.4vh ${({ theme }) => theme.title.glow});
  ${contentEnter}
`;

export const WaveBar = styled.span`
  width: ${WAVE_BAR_WIDTH};
  border-radius: 0;
  background: ${({ theme }) => theme.title.accent};
  ${waveBarStyles}
`;
