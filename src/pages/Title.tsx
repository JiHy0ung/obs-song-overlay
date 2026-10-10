import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useSearchParams } from "react-router";
import { useTitle } from "../store/titleStore";
import {
  Bar,
  Body,
  Copy,
  HIDE_MS,
  Icon,
  Label,
  Line,
  MainStar,
  Overlay,
  RecordDisc,
  Row,
  Rule,
  SmallStar,
  Spacer,
  Star,
  TEXT_OUT_MS,
  TitleSlot,
  TitleText,
  Track,
  WAVE_BAR_COUNT,
  Wave,
  WaveBar,
  type Align,
} from "./Title.styles";
import { PaletteProvider } from "../palette/PaletteProvider";

const ALIGNS: readonly Align[] = ["left", "center", "right"];
// 흐르는 텍스트에서 끝과 다음 반복 사이의 간격 (뷰포트 높이 %)
const MARQUEE_GAP_VH = 40;
// 흐르는 속도: 초당 뷰포트 높이의 몇 배만큼 이동하는지. 소스 크기와 무관하게 같은 느낌을 준다.
const MARQUEE_SPEED = 0.9;

function parseAlign(value: string | null): Align {
  return ALIGNS.find((align) => align === value) ?? "right";
}

// 레코드판 색. 독에서 색을 고르면 PaletteProvider가 --tb-record-… 변수로 덮어쓰고,
// 고르지 않았으면 여기 적힌 기본 색(var의 두 번째 값)이 그대로 나온다.
// 테두리·라벨 그라데이션(위 → 아래), 판 바탕, 홈 선, 가운데 구멍
const RECORD_TOP = "var(--tb-record-top, #ffffff)";
const RECORD_MID = "var(--tb-record-middle, #d9d2ff)";
const RECORD_BOTTOM = "var(--tb-record-bottom, #9a88ff)";
const RECORD_BASE = "rgba(30, 24, 70, 0.85)";
const RECORD_HOLE = "#1a1440";
const RECORD_GROOVE = "var(--tb-record-groove, #cfc8ff)";

// 색은 CSS 변수라서 속성(fill="…") 대신 style로 넣는다.
const RecordIcon = () => (
  <Icon viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient
        id="record-fill"
        gradientUnits="userSpaceOnUse"
        x1="8"
        y1="2"
        x2="16"
        y2="22"
      >
        <stop offset="0" style={{ stopColor: RECORD_TOP }} />
        <stop offset="0.5" style={{ stopColor: RECORD_MID }} />
        <stop offset="1" style={{ stopColor: RECORD_BOTTOM }} />
      </linearGradient>
    </defs>

    {/* 판과 테두리 (고정) */}
    <circle
      cx="12"
      cy="12"
      r="10.9"
      stroke="url(#record-fill)"
      strokeWidth="0.7"
      style={{ fill: RECORD_BASE }}
    />

    {/* 회전하는 부분: 홈, 빛 반사, 가운데 라벨 */}
    <RecordDisc>
      <circle
        cx="12"
        cy="12"
        r="8.6"
        fill="none"
        strokeOpacity="0.35"
        strokeWidth="0.35"
        style={{ stroke: RECORD_GROOVE }}
      />
      <circle
        cx="12"
        cy="12"
        r="6.6"
        fill="none"
        strokeOpacity="0.28"
        strokeWidth="0.35"
        style={{ stroke: RECORD_GROOVE }}
      />
      <path
        d="M12 1.5A10.5 10.5 0 0 1 19.4 4.6L12 12Z"
        fill="#fff"
        fillOpacity="0.14"
      />
      <path
        d="M12 22.5A10.5 10.5 0 0 1 4.6 19.4L12 12Z"
        fill="#fff"
        fillOpacity="0.14"
      />
      <circle cx="12" cy="12" r="4" fill="url(#record-fill)" />
    </RecordDisc>

    {/* 가운데 구멍 (고정) */}
    <circle cx="12" cy="12" r="0.9" style={{ fill: RECORD_HOLE }} />
  </Icon>
);

// 음표 그라데이션 색 (위 → 아래)과 후광 색
// const NOTE_TOP = "#ffffff";
// const NOTE_MID = "#d9d2ff";
// const NOTE_BOTTOM = "#9a88ff";
// const NOTE_HALO = "#8f78ff";

// const NoteIcon = () => (
//   <Icon viewBox="0 0 24 24" aria-hidden="true">
//     <defs>
//       <linearGradient
//         id="note-fill"
//         gradientUnits="userSpaceOnUse"
//         x1="11"
//         y1="2"
//         x2="15"
//         y2="21"
//       >
//         <stop offset="0" stopColor={NOTE_TOP} />
//         <stop offset="0.5" stopColor={NOTE_MID} />
//         <stop offset="1" stopColor={NOTE_BOTTOM} />
//       </linearGradient>
//       <radialGradient id="note-halo">
//         <stop offset="0" stopColor={NOTE_HALO} stopOpacity="0.5" />
//         <stop offset="0.6" stopColor={NOTE_HALO} stopOpacity="0.16" />
//         <stop offset="1" stopColor={NOTE_HALO} stopOpacity="0" />
//       </radialGradient>
//     </defs>

//     {/* 뒤쪽 후광 */}
//     <circle cx="12.5" cy="12" r="11.5" fill="url(#note-halo)" />

//     {/* 음표 */}
//     <g fill="url(#note-fill)">
//       <path d="M13.1 2.8H13.6C13.8 6.4 19.2 7.4 19.2 12C19.2 13.6 18.5 15 17.3 16.1C18.2 13.2 17.2 9.6 13.6 7H13.1Z" />
//       <rect x="12.6" y="2.4" width="1" height="15.8" rx="0.5" />
//       <ellipse
//         cx="10.8"
//         cy="18.6"
//         rx="3"
//         ry="2.1"
//         transform="rotate(-26 10.8 18.6)"
//       />
//     </g>
//   </Icon>
// );

// 네 갈래 별
const StarIcon = () => (
  <Star viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 0C12.8 7.4 16.6 11.2 24 12 16.6 12.8 12.8 16.6 12 24 11.2 16.6 7.4 12.8 0 12 7.4 11.2 11.2 7.4 12 0Z"
      fill="currentColor"
    />
  </Star>
);

type TitleBarProps = {
  // 지금 그려지는 제목
  text: string;
  // 다른 제목으로 바뀌는 중이라 현재 제목이 나가는 중인지
  textLeaving: boolean;
  // 제목이 지워져 바 전체가 사라지는 중인지
  hiding: boolean;
  backdrop: boolean;
};

const TitleBar = ({ text, textLeaving, hiding, backdrop }: TitleBarProps) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  // 제목 영역의 목표 너비 (vh). 이 값이 바뀌면 영역·가로선·별이 부드럽게 따라간다.
  const [titleWidthVh, setTitleWidthVh] = useState<number | null>(null);
  // 넘칠 때만 흐름 한 바퀴의 시간(초), 넘치지 않으면 null
  const [marqueeSeconds, setMarqueeSeconds] = useState<number | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const bar = barRef.current;
      const slot = slotRef.current;
      const spacer = spacerRef.current;
      const textEl = textRef.current;
      const container = bar?.parentElement;
      if (!bar || !slot || !spacer || !textEl || !container) return;

      const vh = window.innerHeight / 100;
      // 텍스트는 줄바꿈 없이 그려지므로 제목 영역이 좁아져도 자연 폭 그대로다.
      const textWidth = textEl.getBoundingClientRect().width;

      // 바의 최대 너비에서 제목 영역을 뺀 나머지(아이콘, 간격, 웨이브)를 빼면 제목이 쓸 수 있는 폭이다.
      // 너비 전환 중에도 고정 요소의 폭은 그대로라 같은 값이 나온다.
      const style = window.getComputedStyle(container);
      const maxBarWidth =
        container.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      // 빈 공간(Spacer)은 최소 너비만 남기고 줄어들 수 있으므로 그 초과분은 고정 폭에서 뺀다.
      const spacerSlack =
        spacer.getBoundingClientRect().width -
        parseFloat(window.getComputedStyle(spacer).minWidth);
      const fixedWidth =
        bar.getBoundingClientRect().width -
        slot.getBoundingClientRect().width -
        spacerSlack;
      const overflowing = textWidth - (maxBarWidth - fixedWidth) > 0.5;

      const nextWidth = Math.round((textWidth / vh) * 100) / 100;
      setTitleWidthVh((prev) => (prev === nextWidth ? prev : nextWidth));

      const nextSeconds = overflowing
        ? Math.round(
            ((textWidth + MARQUEE_GAP_VH * vh) / (MARQUEE_SPEED * 100 * vh)) *
              100,
          ) / 100
        : null;
      setMarqueeSeconds((prev) => (prev === nextSeconds ? prev : nextSeconds));
    };

    measure();

    window.addEventListener("resize", measure);
    const fonts = document.fonts;
    fonts?.addEventListener("loadingdone", measure);
    let active = true;
    fonts?.ready.then(() => {
      if (active) measure();
    });

    return () => {
      active = false;
      window.removeEventListener("resize", measure);
      fonts?.removeEventListener("loadingdone", measure);
    };
  }, [text]);

  const marquee = marqueeSeconds !== null;
  const slotStyle = (
    titleWidthVh === null ? {} : { "--title-w": `${titleWidthVh}vh` }
  ) as CSSProperties;
  const trackStyle = {
    "--marquee-gap": `${MARQUEE_GAP_VH}vh`,
    "--marquee-duration": `${marqueeSeconds ?? 0}s`,
  } as CSSProperties;

  return (
    <Bar
      ref={barRef}
      $hiding={hiding}
      $backdrop={backdrop}
      data-testid="title-bar"
      data-state={hiding ? "hiding" : "shown"}
    >
      <RecordIcon />
      <Body>
        <Label>NOW SINGING</Label>
        <Rule>
          <Line data-testid="title-line" />
          <MainStar $size="15vh" data-testid="title-star">
            <StarIcon />
          </MainStar>
        </Rule>
        <Row>
          <TitleSlot
            ref={slotRef}
            $marquee={marquee}
            style={slotStyle}
            data-testid="title-viewport"
            data-marquee={marquee || undefined}
          >
            <TitleText
              key={text}
              $leaving={textLeaving}
              data-testid="title-text"
            >
              <Track
                $marquee={marquee}
                style={trackStyle}
                data-testid="title-track"
              >
                <Copy $marquee={marquee} data-testid="title-copy">
                  <span ref={textRef}>{text}</span>
                </Copy>
                {marquee && (
                  <Copy $marquee aria-hidden="true">
                    {text}
                  </Copy>
                )}
              </Track>
            </TitleText>
          </TitleSlot>
          <Spacer ref={spacerRef} />
          <Wave data-testid="title-wave">
            {Array.from({ length: WAVE_BAR_COUNT }, (_, i) => (
              <WaveBar key={i} />
            ))}
          </Wave>
          <SmallStar $size="5vh" $top="-20vh" $right="13vh" $delay="-1.2s">
            <StarIcon />
          </SmallStar>
          <SmallStar $size="4vh" $top="58%" $right="-1vh" $delay="-2.3s">
            <StarIcon />
          </SmallStar>
        </Row>
      </Body>
    </Bar>
  );
};

const Title = () => {
  const title = useTitle();
  const [searchParams] = useSearchParams();
  const align = parseAlign(searchParams.get("align")) ?? "right";
  const backdrop = searchParams.get("bg") !== "0";
  // 바가 화면에 있는지. 제목이 지워지면 페이드아웃이 끝난 뒤 false가 된다.
  const [mounted, setMounted] = useState(title !== "");
  // 화면에 그려지는 제목. 다른 제목으로 바뀔 때는 이전 제목이 나간 뒤 교체한다.
  const [shown, setShown] = useState(title);
  if (!mounted && title !== "") {
    setMounted(true);
    setShown(title);
  }

  const hiding = mounted && title === "";
  const textLeaving = mounted && title !== "" && shown !== title;

  useEffect(() => {
    if (!hiding) return;
    const timer = window.setTimeout(() => setMounted(false), HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [hiding]);

  useEffect(() => {
    if (!textLeaving) return;
    const timer = window.setTimeout(() => setShown(title), TEXT_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [textLeaving, title]);

  if (!mounted) return null;

  return (
    <PaletteProvider>
      <Overlay $align={align}>
        <TitleBar
          text={shown}
          textLeaving={textLeaving}
          hiding={hiding}
          backdrop={backdrop}
        />
      </Overlay>
    </PaletteProvider>
  );
};

export default Title;
