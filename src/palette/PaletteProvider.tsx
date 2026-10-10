import { useMemo, type CSSProperties, type ReactNode } from "react";
import { ThemeProvider, type DefaultTheme } from "styled-components";
import { usePaletteColor } from "../store/paletteStore";
import { derivePalette } from "./color";

// 독에서 고른 색을 오버레이에 입힌다. 오버레이 페이지(Title, Setlist)의 맨 바깥을 이 컴포넌트로 감싼다.
// - theme.title, theme.setlist의 색은 계산한 색으로 덮어쓴다.
// - 스타일 파일에 상수로 적힌 색은 CSS 변수로 넘긴다: 세트리스트(안개, 글자 그림자, 별, 점)는 --sl-…, 타이틀 바의 레코드판은 --tb-record-….
// 색을 고르지 않았으면(초기값) 아무것도 덮어쓰지 않아서 theme.ts와 상수에 적힌 기본 색이 그대로 나온다.
export const PaletteProvider = ({ children }: { children: ReactNode }) => {
  const color = usePaletteColor();
  const palette = useMemo(() => (color ? derivePalette(color) : null), [color]);

  const theme = useMemo(
    () =>
      (outer?: DefaultTheme): DefaultTheme => {
        const base = outer as DefaultTheme;
        if (!palette) return base;
        return {
          ...base,
          title: { ...base.title, ...palette.title },
          setlist: { ...base.setlist, ...palette.setlist },
        };
      },
    [palette],
  );

  const variables = useMemo(() => {
    if (!palette) return undefined;
    const values: Record<string, string | number> = {
      "--sl-haze-top": palette.haze.top,
      "--sl-haze-middle": palette.haze.middle,
      "--sl-haze-bottom": palette.haze.bottom,
      "--sl-shadow": palette.textShadow,
      "--sl-star": palette.star,
      "--sl-sky": palette.sky,
      "--sl-dot": palette.dot,
      "--sl-line-glow": palette.lineGlow,
      "--tb-record-top": palette.record.top,
      "--tb-record-middle": palette.record.middle,
      "--tb-record-bottom": palette.record.bottom,
      "--tb-record-body": palette.record.body,
      "--tb-record-groove": palette.record.groove,
      "--tb-record-hole": palette.record.hole,
    };
    if (palette.haze.opacity !== undefined) {
      values["--sl-haze-opacity"] = palette.haze.opacity;
    }
    return values as CSSProperties;
  }, [palette]);

  return (
    <ThemeProvider theme={theme}>
      {/* display: contents라서 화면 배치에는 끼어들지 않고 CSS 변수만 물려준다. */}
      <div style={{ display: "contents", ...variables }}>{children}</div>
    </ThemeProvider>
  );
};
