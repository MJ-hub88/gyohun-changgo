# 🍊 만들기 기록 — 교훈창고

> 이 앱을 어떤 과정으로 만들었는지 남기는 기록입니다.
> 나중에 복기하거나, 다른 사람에게 사례로 보여줄 때 씁니다.

## 한눈에 보기
- 무엇을: 사업 평가에서 얻은 작동/비작동 요인과 교훈을 분야별·사업요소별로 분류해 축적하고, 필요할 때 찾아보는 평가 지식 관리 시스템
- 누구를 위해: 같은 팀 동료들 (평가 업무를 함께 하는 팀원)
- 핵심 흐름: 교훈을 태그 붙여 입력 → 필터·검색으로 찾기 → 새 사업에 참고
- 스택: Next.js · Tailwind · shadcn/ui · Supabase · Vercel
- 시작: 2026-06-20   · 라이브: 배포 전

---

## 기록

### 2026-06-20 기획
- **정한 것**: 화면 4개(대시보드·교훈 목록·입력·상세)로 구성. 로그인 없이 누구나 접근 가능.
  LLM API 불필요. 데이터는 lessons 테이블 하나로 — 사업명·연도·분야·사업요소·작동/비작동
  구분·교훈내용·근거/맥락을 저장한다. 분류 기준은 '분야'(교육·보건·IT 등 사업이 속한 영역)와
  '사업요소'(기획·예산·집행·홍보·성과관리 등 추진 단계/기능) 두 축.

- **왜**: 지금은 엑셀로 정리하고 있는데, 엑셀은 데이터가 쌓일수록 분야별·요소별로 교차 필터링해
  찾아보기가 어렵다. 평가 보고서를 '요약'하는 게 아니라, 보고서에서 뽑아낸 **작동/비작동 요인과
  교훈**이라는 알갱이를 체계적으로 축적하는 게 목적이다. 새 사업을 기획할 때 "이 분야의 예산
  집행에서 과거에 뭐가 작동했지?"를 바로 찾을 수 있어야 한다. 같은 팀 동료가 첫 사용자 —
  팀원들이 각자 평가하면서 발견한 교훈을 한 곳에 모아 공유하는 게 핵심 가치다.

- **고민하다 버린 선택지**:
  - 교훈 간 연결/관계 맵핑 기능 — 교훈끼리 "이것과 관련 있음"으로 연결하면 좋겠지만,
    MVP에선 태그 기반 필터링만으로도 충분히 찾을 수 있다. 복잡도를 줄이기 위해 다음으로 미룸.
  - AI 기반 유사 교훈 추천 — LLM으로 "이 교훈과 비슷한 과거 교훈"을 추천하면 좋겠지만,
    API 키 발급·비용·서버 라우트 등 입문자에게 부담이 크다. 핵심 가치(축적·검색)는 LLM 없이도
    되므로 제외.
  - 엑셀 내보내기 — 있으면 좋지만 MVP 핵심이 아님. 다음에.
  - 로그인/권한 관리 — 팀 내부 도구라 지금은 없어도 됨. 나중에 입력 이력 추적이 필요해지면 추가.

- **막힌 점 / 바꾼 점**: 처음에 화면을 3개(목록·입력·상세)로 잡았는데, 사용자가 대시보드를
  추가 요청했다. 분야별·사업요소별 통계를 한눈에 보는 게 축적의 성과를 체감하게 해주므로
  타당한 추가. 화면이 4개로 늘었지만 한 세션에 충분히 만들 수 있는 범위다.

### 2026-06-20 연결
- **한 것**: Node.js 포터블 설치 → GitHub CLI(winget) + Vercel CLI(npm) + Supabase CLI(Scoop) 설치
  → create-next-app으로 Next.js 스캐폴드 → shadcn/ui 초기화 + 컴포넌트 추가 → Noto Sans KR 폰트
  → 디자인 토큰(강조색 #2563EB) 적용 → GitHub 레포 생성(MJ-hub88/gyohun-changgo) → Vercel 프로젝트
  연결 → Supabase Vercel Marketplace로 프로비저닝 → `.env.local` 자동 생성.

- **왜 이 순서**: Node.js가 없으면 npm도 못 쓰므로 맨 먼저 설치. MSI 설치가 관리자 권한 문제로
  실패해서 포터블(zip) 버전으로 우회. Supabase는 Vercel Marketplace를 통해 프로비저닝하면 계정·
  프로젝트·환경변수가 자동으로 연결되므로 가장 편했다.

- **어떻게**: Node.js는 nodejs.org에서 zip을 받아 `%LOCALAPPDATA%\nodejs`에 풀고 User PATH에
  추가. GitHub CLI는 `winget install GitHub.cli`, Supabase CLI는 `scoop install supabase`.
  Vercel-GitHub 연결 시 Login Connection이 없어서 Vercel Authentication 페이지에서 GitHub
  Connect를 클릭해 OAuth 인증 완료. Supabase는 `vercel integration add supabase`로 한 번에
  프로비저닝 — 약관 동의만 브라우저에서 처리.

- **막힌 점 / 바꾼 점**: ① Node.js MSI 설치가 관리자 권한 없이 실패 → 포터블 zip으로 우회.
  ② `vercel git connect`가 "Login Connection required" 오류 → Vercel Authentication 페이지에서
  GitHub Connect 클릭 필요했는데, 팝업이 차단됨 → `vercel.com/new/import` URL로 직접 접근해
  GitHub 연결 성공. ③ Supabase CLI `supabase login`이 대화형 입력을 기다려 멈춤 → Vercel
  Marketplace 방식으로 우회해 CLI 로그인 없이 진행. ④ PDF 보고서 텍스트 추출 시도 — pdfjs-dist,
  unpdf 등 여러 라이브러리를 시도했지만 한컴(HWP) 변환 PDF의 CID 폰트 인코딩 때문에 한글 추출 불가.

- **배운 것**: Windows에서 관리자 권한 없이 Node.js를 쓰려면 포터블 zip이 안전. Vercel-GitHub
  연결은 OAuth Login Connection이 먼저 돼 있어야 CLI에서 `git connect`가 동작한다. 한국 정부문서
  PDF(HWP 변환)는 CID 폰트 인코딩 때문에 어떤 JS 라이브러리로도 한글 텍스트 추출이 안 된다.
