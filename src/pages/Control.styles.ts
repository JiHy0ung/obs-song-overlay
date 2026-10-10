import styled, { css, keyframes } from "styled-components";

// OBS 독은 폭이 좁다(약 250~400px). 색상은 theme.control에서 바꾼다.

const noticeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
`;

// 배경색은 전역이 아니라 이 페이지의 최상위 요소에 준다.
// 독 높이에 맞춰 세트리스트 목록만 스크롤되도록 세로로 배치한다.
export const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 240px;
  padding: 12px;
  background: ${({ theme }) => theme.control.background};
  color: ${({ theme }) => theme.control.text};
  font-family: ${({ theme }) => theme.font.family};
  font-size: 14px;
`;

export const TitleForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 12px;
  color: ${({ theme }) => theme.control.muted};
`;

export const Row = styled.div`
  display: flex;
  gap: 6px;
  min-width: 0;
`;

export const TitleInput = styled.input`
  flex: 1 1 auto;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.control.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.control.surface};
  color: ${({ theme }) => theme.control.text};
  font: inherit;
  font-size: 15px;

  &::placeholder {
    color: ${({ theme }) => theme.control.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.control.accent};
  }
`;

const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.control.accent};
    outline-offset: 1px;
  }
`;

export const HideButton = styled.button`
  flex: 0 0 auto;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.control.border};
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.control.text};
  font: inherit;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.control.surface};
  }

  ${focusRing}
`;

export const Status = styled.p`
  display: flex;
  gap: 6px;
  min-width: 0;
  margin: 8px 0 0;
  font-size: 12px;
`;

export const StatusLabel = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.control.muted};
`;

export const StatusValue = styled.span<{ $empty: boolean }>`
  min-width: 0;
  overflow-wrap: anywhere;
  ${({ $empty, theme }) =>
    $empty &&
    css`
      color: ${theme.control.muted};
    `}
`;

export const Notice = styled.p`
  margin: 6px 0 0;
  padding: 5px 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.control.noticeBackground};
  color: ${({ theme }) => theme.control.noticeText};
  font-size: 12px;
  animation: ${noticeIn} 200ms ease-out;
`;

/* 세트리스트 관리 */

export const Manager = styled.section`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.control.border};
`;

export const ManagerHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 8px;
`;

export const ManagerTitle = styled.h2`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
`;

export const Count = styled.span`
  margin-left: 2px;
  font-weight: 400;
  color: ${({ theme }) => theme.control.muted};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

export const ConfirmText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.control.danger};
`;

export const SmallButton = styled.button<{ $danger?: boolean }>`
  padding: 4px 10px;
  border: 1px solid ${({ theme }) => theme.control.border};
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.control.text};
  font: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.control.surface};
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  ${focusRing}

  ${({ $danger, theme }) =>
    $danger &&
    css`
      border-color: ${theme.control.danger};
      color: ${theme.control.danger};
    `}
`;

// 글자 크기: − 100% + 기본값
export const FontSizeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
`;

export const FontSizeLabel = styled.span`
  margin-right: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.control.muted};
`;

// 값이 바뀌어도 버튼이 흔들리지 않도록 폭을 고정한다.
export const FontSizeValue = styled.span`
  min-width: 3.4em;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: center;
`;

export const ManualCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.control.muted};

  p {
    margin: 0;
  }
`;

export const ManualCopyText = styled.textarea`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid ${({ theme }) => theme.control.accent};
  border-radius: 6px;
  background: ${({ theme }) => theme.control.surface};
  color: ${({ theme }) => theme.control.text};
  font: inherit;
  font-size: 12px;
  resize: vertical;
`;

export const Empty = styled.p`
  margin: 10px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.control.muted};
`;

// 끄는 동안에는 글자가 선택되지 않게 한다.
export const SongList = styled.ol<{ $sorting: boolean }>`
  flex: 1 1 auto;
  min-height: 60px;
  margin: 10px 0 0;
  padding: 0 6px 0 0; /* 오른쪽: 스크롤바와 삭제 버튼 사이 간격 */
  overflow-y: auto;
  list-style: none;

  /* 얇고 둥근 스크롤바. 트랙은 투명하고 막대만 보인다. */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    margin: 4px 0;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.control.border};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.control.muted};
  }

  ${({ $sorting }) =>
    $sorting &&
    css`
      user-select: none;
      cursor: grabbing;
    `}
`;

// 끄는 동안 각 줄의 이동 거리는 자주 바뀌는 값이라 style의 CSS 변수(--drag-shift)로 받는다.
// $sorting: 누군가 끌고 있는 중 (비켜나는 줄이 부드럽게 움직인다)
// $dragging: 이 줄이 끌려가는 중 (포인터를 그대로 따라가고 다른 줄 위에 뜬다)
export const SongItem = styled.li<{ $sorting: boolean; $dragging: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 2px;
  border-bottom: 1px solid ${({ theme }) => theme.control.surface};
  font-size: 13px;
  transform: translateY(var(--drag-shift, 0px));

  ${({ $sorting, $dragging }) =>
    $sorting &&
    !$dragging &&
    css`
      transition: transform 150ms ease;
    `}

  ${({ $dragging, theme }) =>
    $dragging &&
    css`
      z-index: 1;
      border-radius: 6px;
      border-bottom-color: transparent;
      background: ${theme.control.surface};
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
    `}
`;

// 줄 왼쪽의 손잡이. 이걸 잡고 끌어서 순서를 바꾼다.
export const DragHandle = styled.button`
  flex: 0 0 auto;
  align-self: center;
  width: 18px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => theme.control.muted};
  font: inherit;
  font-size: 13px;
  line-height: 1;
  cursor: grab;
  /* 터치로 끌 때 화면이 대신 스크롤되지 않게 한다. */
  touch-action: none;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.control.surface};
    color: ${({ theme }) => theme.control.text};
  }

  &:active:not(:disabled) {
    cursor: grabbing;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.control.accent};
  }
`;

export const SongNumber = styled.span`
  flex: 0 0 auto;
  min-width: 1.25rem;
  color: ${({ theme }) => theme.control.muted};
  font-variant-numeric: tabular-nums;
  text-align: right;
  line-height: 1;
`;

// 곡 제목. 누르면 그 곡이 지금 부르는 곡이 된다. 글자처럼 보이는 버튼이다.
// $current: 지금 타이틀 바에 떠 있는 곡
export const SongTitle = styled.button<{ $current: boolean }>`
  flex: 1 1 auto;
  min-width: 0;
  margin: -2px -4px;
  padding: 4px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  overflow-wrap: anywhere;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.control.surface};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.control.accent};
  }

  ${({ $current, theme }) =>
    $current &&
    css`
      color: ${theme.control.accent};
      font-weight: 600;

      &::before {
        /* ✦ 와 띄어쓰기. 파일 인코딩에 상관없이 보이도록 코드로 적는다. */
        content: "\\2726\\a0";
      }
    `}
`;

export const EditForm = styled.form`
  flex: 1 1 auto;
  min-width: 0;
  margin: -3px 0;
`;

export const EditInput = styled.input<{ $invalid: boolean }>`
  width: 100%;
  padding: 3px 6px;
  border: 1px solid
    ${({ $invalid, theme }) =>
      $invalid ? theme.control.danger : theme.control.accent};
  border-radius: 4px;
  background: ${({ theme }) => theme.control.surface};
  color: ${({ theme }) => theme.control.text};
  font: inherit;

  &:focus {
    outline: none;
  }
`;

export const EditError = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.control.danger};
  font-size: 12px;
`;

export const IconButton = styled.button<{ $remove?: boolean }>`
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  align-items: center;
  align-self: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => theme.control.muted};
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;

  &:hover {
    background: ${({ theme }) => theme.control.surface};
    color: ${({ $remove, theme }) =>
      $remove ? theme.control.danger : theme.control.edit};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.control.accent};
  }
`;
