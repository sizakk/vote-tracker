# 동의현황 확인

직원 동의 현황을 분석하고 시각화하는 웹 애플리케이션입니다.

## 주요 기능

### 📊 분석 카테고리
- **전체기준**: 전체 직원 동의 현황
- **구분별**: 직원 구분별 동의 현황
- **대조직별**: 대조직별 동의 현황
- **Grade별**: 직급별 동의 현황
- **Grade년차별**: 직급별 연차별 동의 현황
- **입사구분별**: 입사 구분별 동의 현황
- **직책별**: 직책별 동의 현황
- **나이대별**: 연령대별 동의 현황
- **근속년수별**: 근속 연수별 동의 현황
- **성별별**: 성별 동의 현황
- **미실시자현황**: 미실시자 현황

### 🔐 사용자 인증
- 사번 기반 로그인 시스템
- 관리자/일반 사용자 역할 구분
- 관리자만 파일 업로드 가능

### 📈 대시보드 기능
- 실시간 KPI 카드 (전체 동의율, 실시 동의율 등)
- 비동의자 목록 (페이지네이션 지원)
- 인터랙티브 차트 및 그래프
- 기준 시점별 데이터 분석

## 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS, ShadCN UI
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **File Processing**: SheetJS (xlsx)

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd vote-tracker
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
JWT_SECRET=your_jwt_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI API Key (AI 분석 기능용)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Supabase 설정
1. Supabase 프로젝트 생성
2. `supabase/schema.sql` 파일의 스키마를 실행
3. 환경 변수에 Supabase URL과 API 키 설정

### 5. 개발 서버 실행
```bash
npm run dev
```

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── login/             # 로그인 페이지
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # ShadCN UI 컴포넌트
│   ├── AnalysisButtons.tsx
│   ├── DisagreementList.tsx
│   ├── FileUpload.tsx
│   ├── KPICards.tsx
│   └── ResultChart.tsx
└── lib/                  # 유틸리티 및 설정
    ├── auth.ts           # NextAuth 설정
    ├── excel-parser.ts   # Excel 파일 파싱
    ├── supabase.ts       # Supabase 클라이언트
    ├── types.ts          # TypeScript 타입 정의
    └── utils.ts          # 유틸리티 함수
```

## 데이터 형식

### Excel 파일 요구사항
- **파일 형식**: .xlsx, .xls
- **필수 컬럼**:
  - `사번`: 직원 사번
  - `구분`: 직원 구분
  - `대조직`: 소속 대조직
  - `조직`: 소속 조직
  - `이름`: 직원 이름
  - `Grade`: 직급
  - `Grade년차`: 직급별 연차
  - `직책`: 직책
  - `근속년수`: 근속 연수
  - `입사구분`: 입사 구분
  - `성별`: 성별
  - `나이`: 나이
  - `실시여부`: 실시 여부 (Y/N)
  - `동의여부`: 동의 여부 (Y/N)

## 대시보드 기능

### 📊 KPI 카드
- **전체 동의율**: 전체 직원 중 동의한 비율
- **실시 동의율**: 실시 대상자 중 동의한 비율
- **총 직원 수**: 전체 직원 수
- **동의자 수**: 동의한 직원 수
- **실시 대상자 수**: 실시 대상 직원 수
- **실시 동의자 수**: 실시 대상자 중 동의한 직원 수

### 📋 비동의자 목록
- 실시되었지만 동의하지 않은 직원 목록
- 페이지네이션 지원 (기본 100명씩)
- 사번, 이름, 조직, 직급, 직책 정보 표시

### 📈 분석 차트
- 카테고리별 막대 차트
- 동의/비동의/미실시 비율 시각화
- 인터랙티브 툴팁 및 범례

### 🤖 AI 분석
- OpenAI GPT-4o-mini를 활용한 지능형 분석
- 카테고리별 맞춤 분석 프롬프트
- 분석 결과 캐싱으로 API 호출 최적화
- 실시간 분석 및 인사이트 제공

## 사용자 역할

### 👨‍💼 관리자
- 파일 업로드 및 데이터 관리
- 모든 분석 기능 사용
- 시스템 관리 권한

### 👤 일반 사용자
- 분석 결과 조회
- 차트 및 그래프 확인
- 비동의자 목록 조회

## 인증 시스템

### 로그인
- 사번 기반 인증
- NextAuth.js를 통한 세션 관리
- JWT 토큰 기반 보안

### 권한 관리
- Row Level Security (RLS) 적용
- 역할 기반 접근 제어
- API 엔드포인트 보호

## 파일 업로드

### 업로드 프로세스
1. 관리자가 Excel 파일 선택
2. 기준날짜 및 시간 선택
3. 자동 파일명 생성 (`yyyy-mm-dd-hhmm.xlsx`)
4. 데이터 파싱 및 유효성 검사
5. Supabase에 데이터 저장
6. 최신 파일 기준으로 분석 업데이트

### 데이터 처리
- Excel 파일 자동 파싱
- 데이터 유효성 검사
- 배치 단위 데이터 저장
- 실시간 분석 결과 업데이트

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 연락처

프로젝트 링크: [https://github.com/sizakk/vote-tracker](https://github.com/sizakk/vote-tracker)
