# VoteTracker

직원 동의 현황을 분석하고 시각화하는 대시보드 애플리케이션입니다.

## 🚀 주요 기능

- **Excel 파일 업로드**: 직원 데이터가 포함된 Excel 파일을 업로드하여 분석
- **실시간 분석**: 다양한 기준으로 직원 동의 현황 분석
- **대시보드 시각화**: KPI 카드, 차트, 상세 결과를 한눈에 확인
- **미실시자 현황**: 별도 카테고리로 미실시자 현황 분석
- **비동의자 목록**: 비동의한 직원들의 상세 목록 제공

## 📊 분석 카테고리

- **전체기준**: 전체 직원 대상 분석
- **구분별**: 직원 구분별 분석
- **대조직별**: 대조직별 분석
- **Grade별**: 직급별 분석
- **Grade년차별**: 직급 및 근속년수별 분석
- **입사구분별**: 입사 유형별 분석
- **직책별**: 직책별 분석
- **나이대별**: 연령대별 분석
- **근속년수별**: 근속년수별 분석
- **성별별**: 성별 분석
- **미실시자 현황**: 미실시자 전용 분석

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS, ShadCN UI
- **Charts**: Recharts
- **File Processing**: SheetJS (xlsx)
- **Development**: ESLint, PostCSS

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # 루트 레이아웃
│   ├── page.tsx        # 메인 페이지
│   └── globals.css     # 전역 스타일
├── components/         # React 컴포넌트
│   ├── ui/            # 기본 UI 컴포넌트
│   ├── FileUpload.tsx # 파일 업로드 컴포넌트
│   ├── KPICards.tsx   # KPI 카드 컴포넌트
│   ├── ResultChart.tsx # 결과 차트 컴포넌트
│   └── ...
└── lib/               # 유틸리티 함수
    ├── types.ts       # TypeScript 타입 정의
    ├── analysis-utils.ts # 분석 로직
    └── excel-parser.ts # Excel 파싱 로직
```

## 📊 데이터 형식

Excel 파일은 다음 컬럼을 포함해야 합니다:

- `사번`: 직원 사번
- `성명`: 직원 이름
- `구분`: 직원 구분
- `대조직`: 소속 대조직
- `조직`: 소속 조직
- `Grade`: 직급
- `직책`: 직책
- `성별`: 성별
- `나이`: 나이
- `실시여부`: 실시 여부 (Y/N)
- `동의여부`: 동의 여부 (Y/N)

## 🎯 분석 기준

- **미실시**: `실시여부` = 'N'
- **동의**: `동의여부` = 'Y'
- **비동의**: `실시여부` = 'Y' AND `동의여부` = 'N'

## 📈 대시보드 기능

- **KPI 카드**: 전체 동의율, 진행인원 중 동의율
- **분석 차트**: 선택한 카테고리별 막대 차트
- **상세 결과**: 각 분석 결과의 상세 통계
- **비동의자 목록**: 페이지네이션된 비동의자 목록

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
