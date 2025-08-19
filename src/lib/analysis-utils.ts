import { Employee, AnalysisCategory, AnalysisResult, ChartData } from './types';

/**
 * Grade년차 구간화 함수
 */
const getGradeYearGroup = (gradeYear: number) => {
    if (gradeYear <= 5) return "1-5년차";
    if (gradeYear <= 10) return "6-10년차";
    if (gradeYear <= 15) return "11-15년차";
    if (gradeYear <= 20) return "16-20년차";
    if (gradeYear <= 25) return "21-25년차";
    if (gradeYear <= 30) return "26-30년차";
    return "31년차+";
};

/**
 * 나이대 구간화 함수 (5년 단위)
 */
const getAgeGroup = (age: number) => {
    if (age < 25) return "20-24세";
    if (age < 30) return "25-29세";
    if (age < 35) return "30-34세";
    if (age < 40) return "35-39세";
    if (age < 45) return "40-44세";
    if (age < 50) return "45-49세";
    if (age < 55) return "50-54세";
    if (age < 60) return "55-59세";
    return "60세+";
};

/**
 * 근속년수 구간화 함수
 */
const getYearsGroup = (years: number) => {
    if (years < 6) return "0-5년";
    if (years < 11) return "6-10년";
    if (years < 16) return "11-15년";
    if (years < 21) return "16-20년";
    if (years < 26) return "21-25년";
    if (years < 31) return "26-30년";
    if (years < 36) return "31-35년";
    if (years < 41) return "36-40년";
    return "40년+";
};

/**
 * 집계 기준에 따른 카운트 계산 함수 (동의/비동의만)
 */
const calculateCounts = (employees: Employee[]) => {
    const total = employees.length;

    // 동의: 동의여부가 'Y'인 경우
    const agreed = employees.filter(emp => emp.agreementStatus === 'Y').length;

    // 비동의: 실시여부가 'Y'이면서 동의여부가 'N'인 경우
    const disagreed = employees.filter(emp => emp.isImplemented === 'Y' && emp.agreementStatus === 'N').length;

    const rate = total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0;

    return {
        total,
        agreed,
        disagreed,
        agreementRate: rate
    };
};

/**
 * 미실시자 집계 기준에 따른 카운트 계산 함수
 */
const calculateNotImplementedCounts = (employees: Employee[]) => {
    const total = employees.length;

    // 미실시: 실시여부가 'N'인 경우
    const notImplemented = employees.filter(emp => emp.isImplemented === 'N').length;

    const rate = total > 0 ? Math.round((notImplemented / total) * 100 * 10) / 10 : 0;

    return {
        total,
        notImplemented,
        notImplementedRate: rate
    };
};

/**
 * 전체 동의율 계산
 */
export function calculateOverallAgreementRate(employees: Employee[]): number {
    if (employees.length === 0) return 0;

    const agreedCount = employees.filter(emp => emp.agreementStatus === 'Y').length;
    return Math.round((agreedCount / employees.length) * 100);
}

/**
 * 진행인원 중 동의율 계산
 */
export function calculateImplementedAgreementRate(employees: Employee[]): number {
    const implementedEmployees = employees.filter(emp => emp.isImplemented === 'Y');
    if (implementedEmployees.length === 0) return 0;

    const agreedCount = implementedEmployees.filter(emp => emp.agreementStatus === 'Y').length;
    return Math.round((agreedCount / implementedEmployees.length) * 100);
}

/**
 * 전체기준 분석 - 여러 구분별 분석을 요약하여 보여줘
 */
export function analyzeByOverall(employees: Employee[]): AnalysisResult[] {
    if (employees.length === 0) return [];

    const counts = calculateCounts(employees);

    return [{
        name: '전체 동의율',
        agreed: counts.agreed,
        disagreed: counts.disagreed,
        notImplemented: 0,
        total: counts.total,
        agreementRate: counts.agreementRate
    }];
}

/**
 * 구분별 분석
 */
export function analyzeByCategory(employees: Employee[]): AnalysisResult[] {
    const categoryMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        if (!categoryMap.has(emp.category)) {
            categoryMap.set(emp.category, []);
        }
        categoryMap.get(emp.category)!.push(emp);
    });

    return Array.from(categoryMap.entries()).map(([category, categoryEmployees]) => {
        const counts = calculateCounts(categoryEmployees);

        return {
            name: category,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    }).sort((a, b) => b.total - a.total);
}

/**
 * 대조직별 분석
 */
export function analyzeByMajorOrg(employees: Employee[]): AnalysisResult[] {
    const orgMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        if (!orgMap.has(emp.majorOrg)) {
            orgMap.set(emp.majorOrg, []);
        }
        orgMap.get(emp.majorOrg)!.push(emp);
    });

    return Array.from(orgMap.entries()).map(([org, orgEmployees]) => {
        const counts = calculateCounts(orgEmployees);

        return {
            name: org,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    }).sort((a, b) => b.total - a.total);
}

/**
 * Grade별 분석
 */
export function analyzeByGrade(employees: Employee[]): AnalysisResult[] {
    const gradeMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        if (!gradeMap.has(emp.grade)) {
            gradeMap.set(emp.grade, []);
        }
        gradeMap.get(emp.grade)!.push(emp);
    });

    return Array.from(gradeMap.entries()).map(([grade, gradeEmployees]) => {
        const counts = calculateCounts(gradeEmployees);

        return {
            name: grade,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    }).sort((a, b) => {
        // Grade 순서대로 정렬 (예: SA, A, M)
        const gradeOrder = ['SA', 'A', 'M'];
        const aIndex = gradeOrder.indexOf(a.name);
        const bIndex = gradeOrder.indexOf(b.name);
        return aIndex - bIndex;
    });
}

/**
 * Grade년차별 분석
 */
export function analyzeByGradeYear(employees: Employee[]): AnalysisResult[] {
    const yearMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        const yearGroup = getGradeYearGroup(emp.gradeYear);
        if (!yearMap.has(yearGroup)) {
            yearMap.set(yearGroup, []);
        }
        yearMap.get(yearGroup)!.push(emp);
    });

    return Array.from(yearMap.entries()).map(([yearGroup, yearEmployees]) => {
        const counts = calculateCounts(yearEmployees);

        return {
            name: yearGroup,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    }).sort((a, b) => {
        // 년차 순서대로 정렬
        const aYear = parseInt(a.name.split('-')[0]);
        const bYear = parseInt(b.name.split('-')[0]);
        return aYear - bYear;
    });
}

/**
 * 입사구분별 분석
 */
export function analyzeByHiringType(employees: Employee[]): AnalysisResult[] {
    const typeMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        if (!typeMap.has(emp.hiringType)) {
            typeMap.set(emp.hiringType, []);
        }
        typeMap.get(emp.hiringType)!.push(emp);
    });

    return Array.from(typeMap.entries()).map(([type, typeEmployees]) => {
        const counts = calculateCounts(typeEmployees);

        return {
            name: type,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    });
}

/**
 * 직책별 분석
 */
export function analyzeByPosition(employees: Employee[]): AnalysisResult[] {
    const positionMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        if (!positionMap.has(emp.position)) {
            positionMap.set(emp.position, []);
        }
        positionMap.get(emp.position)!.push(emp);
    });

    return Array.from(positionMap.entries()).map(([position, positionEmployees]) => {
        const counts = calculateCounts(positionEmployees);

        return {
            name: position,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    }).sort((a, b) => b.total - a.total);
}

/**
 * 나이대별 분석 (5년 단위)
 */
export function analyzeByAgeGroup(employees: Employee[]): AnalysisResult[] {
    const ageMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        const ageGroup = getAgeGroup(emp.age);
        if (!ageMap.has(ageGroup)) {
            ageMap.set(ageGroup, []);
        }
        ageMap.get(ageGroup)!.push(emp);
    });

    return Array.from(ageMap.entries()).map(([ageGroup, ageEmployees]) => {
        const counts = calculateCounts(ageEmployees);

        return {
            name: ageGroup,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    }).sort((a, b) => {
        // 나이 순서대로 정렬
        const aAge = parseInt(a.name.split('-')[0]);
        const bAge = parseInt(b.name.split('-')[0]);
        return aAge - bAge;
    });
}

/**
 * 근속년수별 분석
 */
export function analyzeByYearsOfService(employees: Employee[]): AnalysisResult[] {
    const yearsMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        const yearsGroup = getYearsGroup(emp.yearsOfService);
        if (!yearsMap.has(yearsGroup)) {
            yearsMap.set(yearsGroup, []);
        }
        yearsMap.get(yearsGroup)!.push(emp);
    });

    return Array.from(yearsMap.entries()).map(([yearsGroup, yearsEmployees]) => {
        const counts = calculateCounts(yearsEmployees);

        return {
            name: yearsGroup,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    }).sort((a, b) => {
        // 근속년수 순서대로 정렬
        const aYears = parseInt(a.name.split('-')[0]);
        const bYears = parseInt(b.name.split('-')[0]);
        return aYears - bYears;
    });
}

/**
 * 성별별 분석
 */
export function analyzeByGender(employees: Employee[]): AnalysisResult[] {
    const genderMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        if (!genderMap.has(emp.gender)) {
            genderMap.set(emp.gender, []);
        }
        genderMap.get(emp.gender)!.push(emp);
    });

    return Array.from(genderMap.entries()).map(([gender, genderEmployees]) => {
        const counts = calculateCounts(genderEmployees);

        return {
            name: gender,
            agreed: counts.agreed,
            disagreed: counts.disagreed,
            notImplemented: 0,
            total: counts.total,
            agreementRate: counts.agreementRate
        };
    });
}

/**
 * 미실시자 현황 분석
 */
export function analyzeByNotImplemented(employees: Employee[]): AnalysisResult[] {
    const categoryMap = new Map<string, Employee[]>();

    employees.forEach(emp => {
        if (!categoryMap.has(emp.category)) {
            categoryMap.set(emp.category, []);
        }
        categoryMap.get(emp.category)!.push(emp);
    });

    return Array.from(categoryMap.entries()).map(([category, categoryEmployees]) => {
        const counts = calculateNotImplementedCounts(categoryEmployees);

        return {
            name: category,
            agreed: 0,
            disagreed: 0,
            notImplemented: counts.notImplemented,
            total: counts.total,
            agreementRate: counts.notImplementedRate
        };
    }).sort((a, b) => b.total - a.total);
}

/**
 * 카테고리별 분석 함수 매핑
 */
const analysisFunctions = {
    '전체기준': analyzeByOverall,
    '구분별': analyzeByCategory,
    '대조직별': analyzeByMajorOrg,
    'Grade별': analyzeByGrade,
    'Grade년차별': analyzeByGradeYear,
    '입사구분별': analyzeByHiringType,
    '직책별': analyzeByPosition,
    '나이대별': analyzeByAgeGroup,
    '근속년수별': analyzeByYearsOfService,
    '성별별': analyzeByGender,
    '미실시자현황': analyzeByNotImplemented
};

/**
 * 카테고리별 분석 실행
 */
export function analyzeByCategoryType(employees: Employee[], category: AnalysisCategory): AnalysisResult[] {
    const analysisFunction = analysisFunctions[category];
    if (!analysisFunction) {
        throw new Error(`지원하지 않는 분석 카테고리: ${category}`);
    }
    return analysisFunction(employees);
}

/**
 * 차트 데이터로 변환 (동의/비동의만)
 */
export function convertToChartData(analysisResults: AnalysisResult[]): ChartData {
    return {
        labels: analysisResults.map(result => result.name),
        datasets: [
            {
                label: '동의',
                data: analysisResults.map(result => result.agreed),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1
            },
            {
                label: '비동의',
                data: analysisResults.map(result => result.disagreed),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1
            }
        ]
    };
}

/**
 * 미실시자 차트 데이터로 변환
 */
export function convertToNotImplementedChartData(analysisResults: AnalysisResult[]): ChartData {
    return {
        labels: analysisResults.map(result => result.name),
        datasets: [
            {
                label: '미실시',
                data: analysisResults.map(result => result.notImplemented),
                backgroundColor: 'rgba(156, 163, 175, 0.8)',
                borderColor: 'rgb(156, 163, 175)',
                borderWidth: 1
            }
        ]
    };
}

/**
 * 비동의자 목록 필터링 - 수정된 기준 적용
 */
export function getDisagreedEmployees(employees: Employee[]): Employee[] {
    return employees
        .filter(emp => emp.isImplemented === 'Y' && emp.agreementStatus === 'N')
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 미실시자 목록 필터링
 */
export function getNotImplementedEmployees(employees: Employee[]): Employee[] {
    return employees
        .filter(emp => emp.isImplemented === 'N')
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Supabase에 파일 업로드 함수
 */
export async function uploadToSupabase(
    employees: Employee[],
    fileName: string,
    baseDate: string,
    baseTime: string
): Promise<{ success: boolean; error?: string; uploadBatchId?: string }> {
    console.log('=== uploadToSupabase Function Called ===')
    console.log('Parameters:', {
        employeesCount: employees.length,
        fileName,
        baseDate,
        baseTime
    })

    try {
        console.log('Preparing request payload...')
        const payload = {
            employees,
            fileName,
            baseDate,
            baseTime,
        }
        console.log('Request payload prepared:', {
            employeesCount: payload.employees.length,
            fileName: payload.fileName,
            baseDate: payload.baseDate,
            baseTime: payload.baseTime
        })

        console.log('Making API call to /api/upload-batch...')
        const response = await fetch('/api/upload-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        console.log('API response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        })

        if (!response.ok) {
            console.log('API call failed with status:', response.status)
            const errorData = await response.json()
            console.log('Error response data:', errorData)
            throw new Error(errorData.error || '업로드 중 오류가 발생했습니다.')
        }

        console.log('API call successful, parsing response...')
        const result = await response.json()
        console.log('Response data:', result)

        return {
            success: true,
            uploadBatchId: result.uploadBatchId,
        }
    } catch (error) {
        console.error('Upload to Supabase error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        }
    }
}
