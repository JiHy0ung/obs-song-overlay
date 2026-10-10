import { useState } from "react";
import {
  resetPaletteColor,
  setPaletteColor,
  usePaletteColor,
  PALETTE_DEFAULT,
} from "../store/paletteStore";
import {
  DEFAULT_HUE,
  DEFAULT_SWATCH,
  derivePalette,
  hexToHsl,
  mainColor,
  PRESETS,
  toneOf,
  type Tone,
} from "./color";
import {
  Current,
  Header,
  HeaderButton,
  HeaderButtons,
  HueSlider,
  Row,
  RowLabel,
  Section,
  Swatch,
  Swatches,
  Title,
  ToneButton,
} from "./PalettePicker.styles";

// 견본에 칠할 색: 실제로 깔리는 안개의 그라데이션
const swatchBackground = (color: string) => {
  const { haze } = derivePalette(color);
  return `linear-gradient(160deg, ${haze.top}, ${haze.middle} 55%, ${haze.bottom})`;
};

// 오버레이(타이틀 바·세트리스트)의 색을 고르는 영역.
// 브라우저의 색 선택 창은 OBS 독에서 뜨지 않을 수 있어서, 견본 버튼과 슬라이더만 쓴다.
// 자주 쓰는 기능이 아니라서 평소에는 접어 두고, "열기"를 누르면 펼쳐진다.
const PalettePicker = () => {
  const color = usePaletteColor();
  const [open, setOpen] = useState(false);
  const isDefault = color === PALETTE_DEFAULT;
  // 색을 고르지 않은 상태에서는 기본(밤 안개)의 색상과 어두운 쪽에서 시작한다.
  const hue = isDefault ? DEFAULT_HUE : Math.round(hexToHsl(color).h);
  const tone: Tone = isDefault ? "dark" : toneOf(color);
  const preset = PRESETS.find((item) => item.color === color);
  const currentName = isDefault ? "기본" : (preset?.name ?? "직접 고름");

  return (
    <Section aria-labelledby="palette-title" data-testid="palette">
      <Header>
        <Title id="palette-title">
          색<Current data-testid="palette-current">{currentName}</Current>
        </Title>
        <HeaderButtons>
          <HeaderButton
            type="button"
            onClick={resetPaletteColor}
            disabled={isDefault}
            data-testid="palette-reset"
          >
            기본값
          </HeaderButton>
          <HeaderButton
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="palette-body"
            data-testid="palette-toggle"
          >
            {open ? "접기" : "열기"}
          </HeaderButton>
        </HeaderButtons>
      </Header>
      {open && (
        <div id="palette-body">
          <Swatches>
            <Swatch
              type="button"
              $selected={isDefault}
              style={{ background: DEFAULT_SWATCH }}
              onClick={resetPaletteColor}
              aria-label="기본 (밤 안개)"
              aria-pressed={isDefault}
              title="기본 (밤 안개)"
              data-testid="palette-swatch"
            />
            {PRESETS.map((item) => (
              <Swatch
                key={item.color}
                type="button"
                $selected={item.color === color}
                style={{ background: swatchBackground(item.color) }}
                onClick={() => setPaletteColor(item.color)}
                aria-label={item.name}
                aria-pressed={item.color === color}
                title={item.name}
                data-testid="palette-swatch"
              />
            ))}
          </Swatches>
          <Row>
            <RowLabel htmlFor="palette-hue">색상</RowLabel>
            <HueSlider
              id="palette-hue"
              type="range"
              min={0}
              max={359}
              step={1}
              value={hue}
              onChange={(event) =>
                setPaletteColor(mainColor(Number(event.target.value), tone))
              }
              data-testid="palette-hue"
            />
          </Row>
          <Row role="group" aria-label="배경 밝기">
            <ToneButton
              type="button"
              $selected={tone === "dark"}
              aria-pressed={tone === "dark"}
              onClick={() => setPaletteColor(mainColor(hue, "dark"))}
              data-testid="palette-tone-dark"
            >
              어두운 배경용
            </ToneButton>
            <ToneButton
              type="button"
              $selected={tone === "light"}
              aria-pressed={tone === "light"}
              onClick={() => setPaletteColor(mainColor(hue, "light"))}
              data-testid="palette-tone-light"
            >
              밝은 배경용
            </ToneButton>
          </Row>
        </div>
      )}
    </Section>
  );
};

export default PalettePicker;
