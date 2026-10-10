import { createGlobalStyle } from "styled-components";

// 전역 리셋. 브라우저 소스(/title, /setlist)가 방송 화면 위에 투명하게 겹치도록 전역 배경은 두지 않는다.
// 각 페이지의 배경색은 그 페이지의 최상위 요소에 준다.
// 웹폰트(@font-face)는 다시 주입될 때 깜빡이지 않도록 여기 넣지 않고 index.html의 link로 불러온다.
const GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    margin: 0;
    padding: 0;
    background: transparent;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export default GlobalStyle;
