// 메인 색 하나에서 오버레이에 쓰는 나머지 색을 계산한다.
// 어두운 색을 고르면 짙은 안개, 밝은 색을 고르면 옅고 밝은 안개가 된다. 글자는 어느 쪽이든 밝은 색이다.

export type Tone = "dark" | "light";

// h: 색상(0~360), s: 채도(0~1), l: 밝기(0~1)
type Hsl = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const hexToHsl = (hex: string): Hsl => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
};

const hslToRgb = ({ h, s, l }: Hsl): [number, number, number] => {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    hue < 60
      ? [c, x, 0]
      : hue < 120
        ? [x, c, 0]
        : hue < 180
          ? [0, c, x]
          : hue < 240
            ? [0, x, c]
            : hue < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [r + m, g + m, b + m];
};

export const hslToHex = (hsl: Hsl): string =>
  `#${hslToRgb(hsl)
    .map((value) =>
      Math.round(clamp(value, 0, 1) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

// CSS 색 문자열
const css = (h: number, s: number, l: number, alpha = 1) => {
  const [r, g, b] = hslToRgb({ h, s: clamp(s, 0, 1), l: clamp(l, 0, 1) }).map(
    (value) => Math.round(clamp(value, 0, 1) * 255),
  );
  return alpha === 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 눈에 보이는 밝기(0 = 검정, 1 = 흰색)
const luminance = (hsl: Hsl) => {
  const [r, g, b] = hslToRgb(hsl).map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// 밝은 안개 위에 올릴 색: 눈에 보이는 밝기가 limit 이하가 될 때까지 어둡게 한다.
// 노랑·연두처럼 원래 밝게 보이는 색상도 읽히게 하려는 것.
const darkEnough = (h: number, s: number, l: number, limit: number) => {
  let lightness = l;
  while (lightness > 0.05 && luminance({ h, s, l: lightness }) > limit) {
    lightness -= 0.02;
  }
  return lightness;
};

// 고른 색이 이 밝기보다 밝으면 "밝은 안개"로 계산한다.
const LIGHT_FROM = 0.6;
// 밝은 안개의 진하기 (0 = 투명, 1 = 불투명). 낮출수록 뒤 화면이 더 비친다.
const LIGHT_HAZE_OPACITY = 0.5;

export const toneOf = (hex: string): Tone =>
  hexToHsl(hex).l > LIGHT_FROM ? "light" : "dark";

// 색상 슬라이더로 고를 때 쓰는 메인 색
export const mainColor = (hue: number, tone: Tone): string =>
  hslToHex(
    tone === "dark" ? { h: hue, s: 0.6, l: 0.4 } : { h: hue, s: 0.9, l: 0.9 },
  );

export type Palette = {
  tone: Tone;
  // 세트리스트의 안개 (왼쪽 위 → 가운데 → 오른쪽 아래)
  haze: { top: string; middle: string; bottom: string; opacity?: number };
  // 세트리스트 글자 둘레의 그림자 (text-shadow 값)
  textShadow: string;
  // 세트리스트: 지금 부르는 곡의 별, 배경의 작은 별, 세로선 위의 점
  star: string;
  sky: string;
  dot: string;
  // 세트리스트의 선(세로선, 머리글·바닥글 가로선) 둘레에 두르는 빛. 필요 없으면 "transparent".
  lineGlow: string;
  // 타이틀 바의 레코드판: 테두리·라벨의 그라데이션(top → middle → bottom), 판, 홈, 가운데 구멍
  record: {
    top: string;
    middle: string;
    bottom: string;
    body: string;
    groove: string;
    hole: string;
  };
  // theme.title, theme.setlist에서 색만 덮어쓸 값
  title: {
    accent: string;
    glow: string;
    shadow: string;
    lineStart: string;
    lineEnd: string;
    text: string;
    backdrop: string;
  };
  setlist: {
    text: string;
    label: string;
    number: string;
    line: string;
    highlightText: string;
  };
};

export const derivePalette = (hex: string): Palette => {
  const { h, s, l } = hexToHsl(hex);
  // 회색에 가까운 색을 고르면 글자와 포인트에도 색이 거의 돌지 않게 한다 (0 = 무채색, 1 = 원래대로).
  const tint = Math.min(1, s / 0.3);

  if (l > LIGHT_FROM) {
    // 밝은 색: 옅고 밝은 안개를 깔고, 글자는 흰색 그대로 둔다.
    // 흰 글자가 밝은 화면에 묻히지 않도록, 같은 색상의 짙은 색을 글자·점·별 둘레에 빛처럼 두른다.
    const deep = (alpha: number) =>
      css(h, 0.6 * tint, darkEnough(h, 0.6 * tint, 0.36, 0.1), alpha);
    const pale = css(h, tint, 0.97);
    // 선은 흰색에 가깝게 두고, 밝은 화면에 묻히지 않도록 둘레에 짙은 빛(lineGlow)을 얇게 두른다.
    const line = css(h, tint, 0.97, 0.9);
    return {
      tone: "light",
      haze: {
        top: css(h, s * 0.9, 0.95),
        middle: css(h - 7, s, 0.86),
        bottom: css(h + 25, s, 0.9),
        opacity: LIGHT_HAZE_OPACITY,
      },
      textShadow: `0 0 0.14em ${deep(0.95)}, 0 0 0.4em ${deep(0.85)}, 0 0 0.9em ${deep(0.5)}`,
      star: "#ffffff",
      sky: "#ffffff",
      dot: "#ffffff",
      lineGlow: deep(0.7),
      record: {
        top: "#ffffff",
        middle: css(h, tint, 0.93),
        bottom: css(h, 0.9 * tint, 0.82),
        body: deep(0.72),
        groove: "#ffffff",
        hole: deep(1),
      },
      title: {
        accent: pale,
        glow: deep(0.85),
        shadow: deep(0.9),
        lineStart: line,
        lineEnd: "#ffffff",
        text: "#ffffff",
        backdrop: css(h, s, 0.9, 0.35),
      },
      setlist: {
        text: "#ffffff",
        label: pale,
        number: pale,
        line,
        highlightText: "#ffffff",
      },
    };
  }

  // 어두운 색: 고른 색으로 짙은 안개를 깔고, 글자와 포인트는 같은 색상의 아주 밝은 색으로.
  // 밝기는 0.3~0.48 사이로 맞춘다. 더 밝으면 흰 글자가 묻히고, 더 어두우면 색이 보이지 않는다.
  const base = clamp(l, 0.3, 0.48);
  const pale = css(h, 0.9 * tint, 0.88);
  return {
    tone: "dark",
    haze: {
      top: css(h, s, base),
      middle: css(h - 12, s * 0.9, base * 0.45),
      bottom: css(h + 22, s * 0.85, base * 0.85),
    },
    textShadow: `0 0 0.4em ${css(h, 0.5, 0.08, 0.8)}`,
    star: "#f8f7ff",
    sky: "#f8f7ff",
    dot: css(h, 0.9 * tint, 0.88, 0.7),
    lineGlow: "transparent",
    record: {
      top: "#ffffff",
      middle: css(h, 0.9 * tint, 0.9),
      bottom: css(h, 0.95 * tint, 0.76),
      body: css(h, 0.5 * tint, 0.19, 0.85),
      groove: pale,
      hole: css(h, 0.5 * tint, 0.16),
    },
    title: {
      accent: pale,
      glow: css(h, 0.95 * tint, 0.72, 0.9),
      shadow: css(h, 0.5, 0.07, 0.75),
      lineStart: css(h, 0.9 * tint, 0.88, 0.7),
      lineEnd: "#ffffff",
      text: "#ffffff",
      backdrop: css(h, 0.5, 0.08, 0.55),
    },
    setlist: {
      text: css(h, 0.6 * tint, 0.97),
      label: pale,
      number: css(h, 0.4 * tint, 0.76),
      line: css(h, 0.9 * tint, 0.88, 0.7),
      highlightText: "#ffffff",
    },
  };
};

// 독에 보여줄 추천 색. 윗줄은 어두운 배경용, 아랫줄은 밝은 배경용.
export const PRESETS: { name: string; color: string }[] = [
  { name: "남색", color: "#2b3f9e" },
  { name: "청록", color: "#0f6b6b" },
  { name: "숲", color: "#24663c" },
  { name: "와인", color: "#8a2046" },
  { name: "먹색", color: "#3d3d42" },
  { name: "라벤더", color: "#d9d0ff" },
  { name: "분홍", color: "#ffd6e4" },
  { name: "살구", color: "#ffe0cc" },
  { name: "민트", color: "#cdeee2" },
  { name: "하늘", color: "#cfe6ff" },
  { name: "흰색", color: "#f4f4f4" },
];

// 기본(밤 안개)의 색상. 색을 고르지 않은 상태에서 슬라이더가 시작하는 자리.
export const DEFAULT_HUE = 250;
// 기본(밤 안개) 견본에 칠할 색
export const DEFAULT_SWATCH =
  "linear-gradient(160deg, rgb(74, 52, 190), rgb(30, 22, 92) 55%, rgb(92, 50, 160))";
