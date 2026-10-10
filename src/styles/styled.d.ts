import "styled-components";

// 테마 값에 타입이 잡히도록 styled-components의 DefaultTheme을 확장한다.
// 실제 값은 theme.ts에 있다.
declare module "styled-components" {
  export interface DefaultTheme {
    // 모든 페이지가 함께 쓰는 글꼴 (index.html의 link로 불러온 Pretendard)
    font: {
      family: string;
    };
    // 라인형 타이틀 바 (/title). 치수는 뷰포트 높이(vh) 기준이다.
    title: {
      // 아이콘, 라벨, 사운드 웨이브, 별
      accent: string;
      // 가로선은 왼쪽(lineStart)에서 별 쪽(lineEnd)으로 갈수록 밝아진다.
      lineStart: string;
      lineEnd: string;
      text: string;
      labelWeight: number;
      weight: number;
      // 별과 가로선 끝의 보라빛 글로우 색과 번짐 크기 (세기 조절)
      glow: string;
      glowBlur: string;
      // 밝은 화면 위 가독성용 어두운 그림자
      shadow: string;
      // ?bg=1일 때 요소 뒤에 깔리는 어두운 배경
      backdrop: string;
    };
    // 세트리스트 패널 (/setlist) 전용 값. 별과 가로선은 title의 색을 함께 쓴다.
    setlist: {
      // 어두운 남색 반투명 배경판
      panel: string;
      // 배경판 모서리 둥글기 (vw)
      radius: string;
      // SETLIST 라벨과 번호의 연한 라벤더
      label: string;
      number: string;
      text: string;
      weight: number;
      // 곡 줄 사이 구분선
      divider: string;
      // 타이틀 바에 떠 있는 곡: 띠 색, 한 단계 밝은 번호·제목 색
      highlight: string;
      highlightNumber: string;
      highlightText: string;
      line: string;
    };
    // OBS 독 (/control)
    control: {
      background: string;
      surface: string;
      border: string;
      text: string;
      muted: string;
      accent: string;
      edit: string;
      danger: string;
      noticeBackground: string;
      noticeText: string;
    };
    // 설치 안내 페이지 (/)
    home: {
      background: string;
      surface: string;
      border: string;
      text: string;
      muted: string;
      accent: string;
      onAccent: string;
    };
  }
}
