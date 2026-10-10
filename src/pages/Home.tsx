import { useState } from "react";
import {
  Address as AddressBox,
  AddressLabel,
  AddressRow,
  AddressUrl,
  CopyButton,
  Inner,
  Lead,
  Page,
  Section,
  Steps,
  Usage,
} from "./Home.styles";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 클립보드 API를 쓸 수 없는 환경(OBS 내부 등)을 위한 대체 방법
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  }
}

type AddressProps = {
  label: string;
  url: string;
};

const Address = ({ label, url }: AddressProps) => {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const handleCopy = async () => {
    setState((await copyText(url)) ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 2000);
  };

  return (
    <AddressBox>
      <AddressLabel>{label}</AddressLabel>
      <AddressRow>
        <AddressUrl
          type="text"
          value={url}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
        <CopyButton type="button" onClick={handleCopy}>
          {state === "copied"
            ? "복사됨!"
            : state === "failed"
              ? "직접 복사해 주세요"
              : "복사"}
        </CopyButton>
      </AddressRow>
    </AddressBox>
  );
};

const Home = () => {
  const origin = window.location.origin;
  const titleUrl = `${origin}/title`;
  const controlUrl = `${origin}/control`;
  const setlistUrl = `${origin}/setlist`;

  return (
    <Page>
      <Inner>
        <h1>노래 제목 오버레이</h1>
        <Lead>
          방송 화면에 지금 부르는 노래 제목과 오늘 부른 노래 목록(세트리스트)을
          띄워 주는 도구예요.
          <br />
          OBS에 아래 주소들만 넣으면 바로 쓸 수 있어요.
        </Lead>

        <Section>
          <h2>내 주소</h2>
          <Address
            label="타이틀 바 주소 (지금 부르는 노래 제목)"
            url={titleUrl}
          />
          <Address
            label="세트리스트 주소 (오늘 부른 노래 목록)"
            url={setlistUrl}
          />
          <Address
            label="입력창 주소 (제목을 적고 목록을 관리하는 곳)"
            url={controlUrl}
          />
        </Section>

        <Section>
          <h2>OBS 설정하기</h2>
          <Steps>
            <li>
              <strong>타이틀 바 넣기</strong>
              <p>
                OBS의 <b>소스</b> 목록 아래 <b>+</b> 버튼을 누르고{" "}
                <b>브라우저</b>를 고르세요.
                <br />
                이름을 정한 뒤, <b>URL</b> 칸에 위의 <b>타이틀 바 주소</b>를
                붙여 넣고 <b>너비 900</b>, <b>높이 140</b>으로 적어 주세요.
              </p>
            </li>
            <li>
              <strong>세트리스트 넣기</strong>
              <p>
                타이틀 바와 같은 방법으로 <b>소스</b> 목록 아래 <b>+</b> →{" "}
                <b>브라우저</b>를 고르고,
                <br />
                <b>URL</b> 칸에 위의 <b>세트리스트 주소</b>를 붙여 넣은 뒤{" "}
                <b>너비 480</b>, <b>높이 940</b>으로 적어 주세요.
                <br />
                곡이 없을 때는 아무것도 보이지 않고, 첫 곡을 넣으면 나타나요.
              </p>
            </li>
            <li>
              <strong>입력창 넣기</strong>
              <p>
                OBS 위쪽 메뉴에서 <b>독</b> → <b>사용자 지정 브라우저 독</b>을
                누르세요.
                <br />
                이름은 편하게 정하고 (예: 노래 제목),
                <br />
                <b>URL</b> 칸에 위의 <b>입력창 주소</b>를 붙여 넣은 뒤 적용을
                누르세요. 입력창이 OBS 화면 한쪽에 붙어요.
              </p>
            </li>
            <li>
              <strong>꺼 두어야 할 옵션 두 개</strong>
              <p>
                방송 화면의 <b>타이틀 바</b>와 <b>세트리스트</b>를 하나씩 더블
                클릭해서 속성 창을 열고,
                <br />
                각각 아래 두 가지의 체크를 <b>해제</b>해 주세요.
                <br />
                그래야 장면을 바꿔도 제목과 목록이 사라지지 않아요.
              </p>
              <ul>
                <li>소스가 보이지 않는 경우 종료</li>
                <li>장면이 활성화되면 브라우저를 새로고침</li>
              </ul>
            </li>
          </Steps>
        </Section>

        <Section>
          <h2>노래 제목 띄우기</h2>
          <Usage>
            <li>
              입력창에 노래 제목을 적고 <b>Enter</b>를 누르면 방송 화면에 바로
              나타나요.
            </li>
            <li>
              Enter를 누른 뒤에는 글자가 전체 선택되어 있어서, 다음 곡 제목을
              바로 이어서 적으면 돼요.
            </li>
            <li>
              제목을 내리고 싶으면 <b>숨기기</b> 버튼을 누르세요. 입력창을
              비우고 Enter를 눌러도 사라져요.
            </li>
            <li>
              타이틀 바는 제목 길이에 맞춰 늘어나고 줄어들어요. 아주 긴 제목은
              타이틀 바 안에서 글자가 옆으로 흘러가요.
            </li>
          </Usage>
        </Section>

        <Section>
          <h2>세트리스트 관리하기</h2>
          <Usage>
            <li>
              제목을 적고 Enter를 누르면 <b>세트리스트에 자동으로 쌓여요</b>.
              따로 정리하지 않아도 돼요.
              <br />
              이미 목록에 있는 곡을 다시 적으면 타이틀 바만 바뀌고 목록에는 다시
              들어가지 않아요
              <br />
              (대소문자·띄어쓰기가 달라도 같은 곡으로 봐요).
            </li>
            <li>
              방송 화면의 세트리스트에서는 <b>지금 타이틀 바에 떠 있는 곡</b>이
              별과 함께 밝게 표시돼요.
              <br />
              곡이 많아져서 목록이 길어지면 그 곡이 보이도록 목록이 알아서
              움직여요.
            </li>
            <li>
              입력창 아래 목록에서 <b>곡 제목을 누르면</b> 그 곡이 타이틀 바에
              뜨고 세트리스트에서도 표시돼요.
              <br />
              앞에서 부른 곡을 다시 부를 때 제목을 새로 적지 않아도 돼요.
              <br />
              표시된 곡을 <b>한 번 더 누르면</b> 타이틀 바가 내려가요.
            </li>
            <li>
              곡 순서를 바꾸려면 곡 왼쪽의 <b>점 여섯 개(⠿)</b>를 잡고 위아래로
              끌어다 놓으세요.
              <br />
              방송 화면의 목록도 같이 바뀌어요.
            </li>
            <li>
              오타가 난 곡은 곡 옆의 <b>연필</b> 버튼을 눌러 고치고 Enter를
              누르세요(취소는 Esc).
              <br />
              지금 화면에 떠 있는 곡이면 타이틀 바 제목도 같이 고쳐져요.
              <br />
              잘못 들어간 곡은 <b>✕</b> 버튼으로 지우세요.
            </li>
            <li>
              새 방송을 시작할 때는 <b>초기화</b>를 누르세요.
              <br />한 번 더 물어보면 <b>예</b>를 누르면 목록이 비워져요.
              <br />
              세트리스트 아래에 보이는 날짜는 그날 첫 곡을 넣은 날로 정해져요.
            </li>
            <li>
              방송이 끝나면 <b>복사</b>를 눌러 목록을 가져가세요.
              <br />
              “1. 노래 제목” 모양으로 한 줄씩 복사돼서 게시판이나 메모에 바로
              붙여 넣을 수 있어요.
            </li>
          </Usage>
        </Section>

        <Section>
          <h2>글자 크기와 색 바꾸기</h2>
          <Usage>
            <li>
              방송 화면의 세트리스트 글자가 작거나 크면 입력창의{" "}
              <b>글자 크기</b>에서 <b>−</b>, <b>+</b>로 조절하세요.
              <br />
              누르는 즉시 바뀌고, <b>기본값</b>을 누르면 처음 크기로 돌아가요.
            </li>
            <li>
              색을 바꾸려면 입력창 맨 아래 <b>색</b> 옆의 <b>열기</b>를
              누르세요.
              <br />
              네모난 색 견본을 하나 누르면 타이틀 바와 세트리스트가 그 색으로
              함께 바뀌어요.
              <br />
              나머지 색은 고른 색에 맞춰 알아서 정해져요.
            </li>
            <li>
              견본에 없는 색은 <b>색상</b> 막대를 좌우로 움직여서 고르세요.
              <br />그 아래 <b>어두운 배경용 / 밝은 배경용</b>은 방송 배경에
              맞춰 고르면 돼요.
              <br />
              배경이 어두우면 짙은 안개가, 배경이 밝으면 옅고 밝은 안개가
              깔려요.
            </li>
            <li>
              색 영역의 <b>기본값</b>을 누르거나 맨 앞의 견본을 누르면 처음
              색(보랏빛 밤 안개)으로 돌아가요.
            </li>
            <li>
              글자 크기와 색은 한 번 정하면 계속 유지돼요.
              <br />
              세트리스트를 초기화해도 그대로예요.
            </li>
          </Usage>
        </Section>

        <Section>
          <h2>타이틀 바 위치와 배경 바꾸기</h2>
          <p>
            타이틀 바는 기본으로 오른쪽 끝에 붙어 있고, 제목이 길어지면 왼쪽으로
            늘어나요.
            <br />
            다르게 쓰고 싶다면 OBS의 브라우저 소스 주소 끝에 아래 글자를 붙여
            주세요.
          </p>
          <Usage>
            <li>
              가운데에 놓기: <code>{titleUrl}?align=center</code>
            </li>
            <li>
              왼쪽에 놓기: <code>{titleUrl}?align=left</code>
            </li>
            <li>
              글자 뒤에 깔리는 흐린 배경 빼기: <code>{titleUrl}?bg=0</code>
            </li>
            <li>
              두 가지를 같이 쓰려면 <code>&amp;</code>로 이어 주세요:{" "}
              <code>{titleUrl}?align=center&amp;bg=0</code>
            </li>
          </Usage>
        </Section>
      </Inner>
    </Page>
  );
};

export default Home;
