import styled from "styled-components";

// 설치 안내 페이지. 색상은 theme.home에서 바꾼다.
// 배경색은 전역이 아니라 이 페이지의 최상위 요소에 준다.
export const Page = styled.div`
  min-height: 100vh;
  padding: 40px 16px 64px;
  background: ${({ theme }) => theme.home.background};
  color: ${({ theme }) => theme.home.text};
  font-family: ${({ theme }) => theme.font.family};
  font-size: 16px;
  line-height: 1.65;
  word-break: keep-all;

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    line-height: 1.3;
  }

  h2 {
    margin: 0 0 12px;
    font-size: 19px;
  }

  p {
    margin: 0 0 8px;
  }

  code {
    padding: 1px 6px;
    border-radius: 4px;
    background: ${({ theme }) => theme.home.background};
    font-size: 14px;
    overflow-wrap: anywhere;
  }
`;

export const Inner = styled.main`
  max-width: 680px;
  margin: 0 auto;
`;

export const Lead = styled.p`
  color: ${({ theme }) => theme.home.muted};
`;

export const Section = styled.section`
  margin-top: 24px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.home.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.home.surface};
`;

export const Address = styled.div`
  & + & {
    margin-top: 14px;
  }
`;

export const AddressLabel = styled.div`
  margin-bottom: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.home.muted};
`;

export const AddressRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const AddressUrl = styled.input`
  flex: 1 1 auto;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.home.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.home.background};
  color: ${({ theme }) => theme.home.text};
  font: inherit;
  font-size: 15px;
`;

export const CopyButton = styled.button`
  flex: 0 0 auto;
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  background: ${({ theme }) => theme.home.accent};
  color: ${({ theme }) => theme.home.onAccent};
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

export const Steps = styled.ol`
  margin: 0;
  padding-left: 22px;

  & > li + li {
    margin-top: 16px;
  }

  p {
    margin: 4px 0 0;
  }

  ul {
    margin: 6px 0 0;
    padding-left: 20px;
  }
`;

export const Usage = styled.ul`
  margin: 0;
  padding-left: 22px;

  li + li {
    margin-top: 6px;
  }
`;
