// Employee 인터페이스 - Excel 파일의 직원 데이터 구조 (19개 열)
export interface Employee {
    no: number;               // 1. No.
    employeeId: string;       // 2. 사번(*)
    category: string;         // 3. 구분
    majorOrg: string;         // 4. 대조직
    organization: string;     // 5. 조직
    name: string;             // 6. 성명
    grade: string;            // 7. Grade
    gradeYear: number;        // 8. Grade년차
    position: string;         // 9. 직책
    yearsOfService: number;   // 10. 근속년수
    hiringType: string;       // 11. 입사구분
    gender: string;           // 12. 성별
    age: number;              // 13. 나이
    isImplemented: string;    // 14. 실시여부
    implementationDate: string; // 15. 실시일
    agreementStatus: string;  // 16. 동의여부
    confirmationStatus: string; // 17. 확인여부
    confirmationDate: string; // 18. 확인일자
    agreementType: string;    // 19. 동의/비동의
}

// Excel 파싱 오류 클래스
export class ExcelParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExcelParseError';
    }
}

// 분석 카테고리 타입
export type AnalysisCategory =
    | '전체기준'
    | '구분별'
    | '대조직별'
    | 'Grade별'
    | 'Grade년차별'
    | '입사구분별'
    | '직책별'
    | '나이대별'
    | '근속년수별'
    | '성별별'
    | '미실시자현황';

// 분석 결과 인터페이스
export interface AnalysisResult {
    name: string;              // 그룹명 (예: "본점", "SA", "남성", "20-24세")
    agreed: number;            // 동의자 수
    disagreed: number;         // 비동의자 수
    notImplemented: number;    // 미실시자 수
    total: number;             // 총 인원
    agreementRate: number;     // 동의율 (소수점 1자리)
}

// 차트 데이터 인터페이스
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
    }[];
}

// KPI 데이터 인터페이스
export interface KPIData {
    totalAgreementRate: number;    // 전체 동의율
    progressAgreementRate: number; // 진행인원 중 동의율
    totalEmployees: number;        // 전체 직원 수
    agreedEmployees: number;       // 동의한 직원 수
    progressEmployees: number;     // 진행인원 수
}

// 파일 업로드 상태
export interface FileUploadState {
    file: File | null;
    isUploading: boolean;
    error: string | null;
    employees: Employee[];
    kpiData: KPIData | null;
    selectedCategory: AnalysisCategory | null;
    analysisResults: AnalysisResult[];
}
