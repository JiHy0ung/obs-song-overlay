import type { DefaultTheme } from "styled-components";

// 색상·폰트·둥글기 등 디자인 값은 모두 여기 한 파일에서 바꾼다.
// 타이틀 바와 세트리스트는 font와 title의 색(별·가로선)을 함께 써서 한 세트처럼 보인다.
export const theme: DefaultTheme = {
  font: {
    family:
      '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif',
  },
  title: {
    accent: "#d6cfff",
    lineStart: "rgba(206, 196, 255, 0.4)",
    lineEnd: "rgba(236, 231, 255, 0.95)",
    text: "#f8f6ff",
    labelWeight: 500,
    weight: 500,
    glow: "rgba(164, 128, 255, 0.95)",
    glowBlur: "2.6vh",
    shadow: "rgba(8, 6, 22, 0.78)",
    backdrop: "rgba(49, 30, 95, 0.69)",
  },
  setlist: {
    panel: "rgba(65, 40, 128, 0.69)",
    radius: "2.6vw",
    label: "#d8d1fe",
    number: "rgba(207, 198, 255, 1)",
    text: "#f3f1ff",
    weight: 400,
    divider: "rgba(214, 207, 255, 0.09)",
    highlight: "rgba(190, 176, 255, 0.14)",
    highlightNumber: "#e6e0ff",
    highlightText: "#ffffff",
    line: "rgba(206, 196, 255, 0.8)",
  },
  control: {
    background: "#1e1f24",
    surface: "#2a2c33",
    border: "#3c3f48",
    text: "#f1f2f5",
    muted: "#9a9eab",
    accent: "#c58aff",
    edit: "#7ab2ff",
    danger: "#ff7a7a",
    noticeBackground: "rgba(255, 196, 92, 0.14)",
    noticeText: "#ffd38a",
  },
  home: {
    background: "#f6f7f9",
    surface: "#ffffff",
    border: "#dfe2e8",
    text: "#1c1e23",
    muted: "#5e6472",
    accent: "#7a3fe0",
    onAccent: "#ffffff",
  },
};
