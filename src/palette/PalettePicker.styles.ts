import styled, { css } from "styled-components";

const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.control.accent};
    outline-offset: 2px;
  }
`;

// 독 맨 아래에 놓이고, 세트리스트 목록이 길어져도 줄어들지 않는다.
export const Section = styled.section`
  flex: none;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.control.border};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const HeaderButtons = styled.div`
  display: flex;
  gap: 6px;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
`;

export const Current = styled.span`
  margin-left: 6px;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.control.muted};
`;

export const HeaderButton = styled.button`
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
`;

// 견본 6개씩 두 줄
export const Swatches = styled.div`
  display: grid;
  margin-top: 10px;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`;

// 견본의 색은 계산된 값이라 style로 받는다.
export const Swatch = styled.button<{ $selected: boolean }>`
  aspect-ratio: 1;
  min-width: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.control.border};
  border-radius: 8px;
  cursor: pointer;

  ${({ $selected, theme }) =>
    $selected &&
    css`
      border-color: ${theme.control.background};
      box-shadow: 0 0 0 2px ${theme.control.accent};
    `}

  ${focusRing}
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

export const RowLabel = styled.label`
  flex: none;
  font-size: 12px;
  color: ${({ theme }) => theme.control.muted};
`;

// 색상 슬라이더. 막대에 무지개를 칠해 어느 자리가 어떤 색인지 보이게 한다.
export const HueSlider = styled.input`
  flex: 1 1 auto;
  min-width: 0;
  height: 14px;
  margin: 0;
  border-radius: 7px;
  background: linear-gradient(
    to right,
    hsl(0, 80%, 55%),
    hsl(60, 80%, 55%),
    hsl(120, 80%, 55%),
    hsl(180, 80%, 55%),
    hsl(240, 80%, 55%),
    hsl(300, 80%, 55%),
    hsl(360, 80%, 55%)
  );
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-radius: 50%;
    background: transparent;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6);
    -webkit-appearance: none;
  }

  ${focusRing}
`;

export const ToneButton = styled.button<{ $selected: boolean }>`
  flex: 1 1 0;
  min-width: 0;
  padding: 5px 6px;
  border: 1px solid ${({ theme }) => theme.control.border};
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.control.text};
  font: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.control.surface};
  }

  ${({ $selected, theme }) =>
    $selected &&
    css`
      border-color: ${theme.control.accent};
      color: ${theme.control.accent};
    `}

  ${focusRing}
`;
