# 🚀 PitchReport - AI 영업 코칭 플랫폼

PitchReport는 사용자의 상담 및 영업 대화를 AI가 정밀 분석하여, 계약 성사율을 높이기 위한 인사이트와 피드백을 제공하는 Next.js 기반 웹 서비스입니다.

## 🛠 주요 기술 스택
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend/Database**: Supabase
- **AI**: OpenAI SDK
- **State Management**: Zustand
- **Visualization**: Recharts
- **Icons**: Lucide React

---

## 📂 파일 구조 및 주요 기능

### `src/app` (페이지 및 API)
- **`page.tsx`**: 서비스 랜딩 페이지. 주요 기능 소개 및 서비스 진입점.
- **`layout.tsx`**: 전체 앱의 글로벌 레이아웃 (폰트, 스타일, SEO 설정).
- **`/login`**: 사용자 인증 및 로그인 페이지.
- **`/onboarding`**: 서비스 초기 가입 후 사용자 설정 및 가이드 프로세스.
- **`/dashboard`**: 사용자 대시보드. 대화 분석 요약 및 지표 시각화.
- **`/upload`**: 새로운 대화 녹음 파일 또는 텍스트 데이터 업로드 페이지.
- **`/sessions`**: 과거 대화 분석 세션 목록 및 상세 조회.
- **`/report`**: 특정 세션에 대한 AI 심층 분석 리포트 페이지.
- **`/settings`**: 개인정보, 선호도, 알림 등 사용자 환경 설정.
- **`/customers`**: 관리 대상 고객 정보 및 이력 관리.
- **`/api`**: 백엔드 로직 처리를 위한 서버리스 API 경로.

### `src/lib` (유틸리티 및 라이브러리)
- **`supabase.ts`**: Supabase 클라이언트 초기화 및 DB 연동 설정.
- **`/ai`**: OpenAI 연동 로직 및 프롬프트 관리.

### `src/components` & `src/hooks`
- **`components/`**: 공통 UI 컴포넌트 (버튼, 입력창, 카드 등) 및 재사용 가능한 로직 컴포넌트.
- **`hooks/`**: 상태 관리 및 데이터 페칭을 위한 커스텀 React Hooks.

---

## 🏃 실행 방법

### 1. 의존성 설치
프로젝트 루트 디렉토리에서 아래 명령어를 실행하여 필요한 패키지를 설치합니다.
```bash
npm install
```

### 2. 환경 변수 설정
루트 디렉토리에 `.env.local` 파일을 생성하고 필요한 API Key들을 입력합니다.
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```
이후 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 확인합니다.

### 4. 프로덕션 빌드 및 실행
```bash
npm run build
npm run start
```

---

## 📝 디자인 및 스타일
- **Aesthetics**: Glassmorphism, Premium Gradients, Modern Typography (Inter/Outfit) 적용.
- **Global Styles**: `src/app/globals.css`에서 디자인 시스템 토큰 및 애니메이션 관리.
