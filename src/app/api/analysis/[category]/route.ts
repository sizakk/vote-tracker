import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    try {
        const { category } = await params

        // 최신 업로드 배치 조회 (필요한 컬럼만 선택)
        const { data: latestBatch, error: batchError } = await supabase
            .from('upload_batches')
            .select('id')
            .order('upload_date', { ascending: false })
            .limit(1)
            .single()

        if (batchError || !latestBatch) {
            return NextResponse.json([])
        }

        // 카테고리별로 필요한 컬럼만 선택
        const selectColumns = getSelectColumnsForCategory(category)

        // 최신 배치의 직원 데이터 조회 (필요한 컬럼만 선택)
        const { data: employees, error: employeesError } = await supabase
            .from('employees')
            .select(selectColumns)
            .eq('upload_batch_id', latestBatch.id)

        if (employeesError) {
            console.error('Error fetching employees:', employeesError)
            return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
        }

        if (!employees || employees.length === 0) {
            return NextResponse.json([])
        }

        let results: any[] = []

        // 카테고리별 분석 로직
        switch (category) {
            case '전체기준':
                results = analyzeOverall(employees)
                break
            case '구분별':
                results = analyzeByCategory(employees)
                break
            case '대조직별':
                results = analyzeByMajorOrg(employees)
                break
            case 'Grade별':
                results = analyzeByGrade(employees)
                break
            case 'Grade년차별':
                results = analyzeByGradeYear(employees)
                break
            case '입사구분별':
                results = analyzeByHiringType(employees)
                break
            case '직책별':
                results = analyzeByPosition(employees)
                break
            case '나이대별':
                results = analyzeByAgeGroup(employees)
                break
            case '근속년수별':
                results = analyzeByYearsOfService(employees)
                break
            case '성별별':
                results = analyzeByGender(employees)
                break
            case '미실시자현황':
                results = analyzeByNotImplemented(employees)
                break
            default:
                return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
        }

        return NextResponse.json(results)
    } catch (error) {
        console.error('Analysis error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// 카테고리별로 필요한 컬럼만 선택하는 함수
function getSelectColumnsForCategory(category: string): string {
    const baseColumns = 'agreement_status, is_implemented'

    switch (category) {
        case '전체기준':
            return baseColumns
        case '구분별':
            return `${baseColumns}, category`
        case '대조직별':
            return `${baseColumns}, major_org`
        case 'Grade별':
            return `${baseColumns}, grade`
        case 'Grade년차별':
            return `${baseColumns}, grade_year`
        case '입사구분별':
            return `${baseColumns}, hiring_type`
        case '직책별':
            return `${baseColumns}, position`
        case '나이대별':
            return `${baseColumns}, age`
        case '근속년수별':
            return `${baseColumns}, years_of_service`
        case '성별별':
            return `${baseColumns}, gender`
        case '미실시자현황':
            return baseColumns
        default:
            return '*'
    }
}

// 분석 함수들
function analyzeOverall(employees: any[]) {
    const total = employees.length
    const agreed = employees.filter(emp => emp.agreement_status === 'Y').length
    const disagreed = employees.filter(emp => emp.is_implemented === true && emp.agreement_status === 'N').length
    const notImplemented = employees.filter(emp => emp.is_implemented === false).length

    return [{
        name: '전체',
        agreed,
        disagreed,
        notImplemented,
        total,
        agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
    }]
}

function analyzeByCategory(employees: any[]) {
    const groups = groupBy(employees, 'category')
    return Object.entries(groups).map(([name, group]) => {
        const groupArray = group as any[]
        const total = groupArray.length
        const agreed = groupArray.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = groupArray.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = groupArray.filter((emp: any) => emp.is_implemented === false).length

        return {
            name,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    })
}

function analyzeByMajorOrg(employees: any[]) {
    const groups = groupBy(employees, 'major_org')
    return Object.entries(groups).map(([name, group]) => {
        const groupArray = group as any[]
        const total = groupArray.length
        const agreed = groupArray.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = groupArray.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = groupArray.filter((emp: any) => emp.is_implemented === false).length

        return {
            name,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    })
}

function analyzeByGrade(employees: any[]) {
    const groups = groupBy(employees, 'grade')
    return Object.entries(groups).map(([name, group]) => {
        const groupArray = group as any[]
        const total = groupArray.length
        const agreed = groupArray.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = groupArray.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = groupArray.filter((emp: any) => emp.is_implemented === false).length

        return {
            name,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    })
}

function analyzeByGradeYear(employees: any[]) {
    const groups = groupBy(employees, 'grade_year')
    return Object.entries(groups).map(([name, group]) => {
        const groupArray = group as any[]
        const total = groupArray.length
        const agreed = groupArray.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = groupArray.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = groupArray.filter((emp: any) => emp.is_implemented === false).length

        return {
            name: `${name}년차`,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    })
}

function analyzeByHiringType(employees: any[]) {
    const groups = groupBy(employees, 'hiring_type')
    return Object.entries(groups).map(([name, group]) => {
        const groupArray = group as any[]
        const total = groupArray.length
        const agreed = groupArray.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = groupArray.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = groupArray.filter((emp: any) => emp.is_implemented === false).length

        return {
            name,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    })
}

function analyzeByPosition(employees: any[]) {
    const groups = groupBy(employees, 'position')
    return Object.entries(groups).map(([name, group]) => {
        const total = group.length
        const agreed = group.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = group.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = group.filter((emp: any) => emp.is_implemented === false).length

        return {
            name,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    })
}

function analyzeByAgeGroup(employees: any[]) {
    const ageGroups = {
        '20-24': (age: number) => age >= 20 && age <= 24,
        '25-29': (age: number) => age >= 25 && age <= 29,
        '30-34': (age: number) => age >= 30 && age <= 34,
        '35-39': (age: number) => age >= 35 && age <= 39,
        '40-44': (age: number) => age >= 40 && age <= 44,
        '45-49': (age: number) => age >= 45 && age <= 49,
        '50+': (age: number) => age >= 50
    }

    return Object.entries(ageGroups).map(([name, filterFn]) => {
        const group = employees.filter((emp: any) => emp.age && filterFn(emp.age))
        const total = group.length
        const agreed = group.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = group.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = group.filter((emp: any) => emp.is_implemented === false).length

        return {
            name,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    }).filter(result => result.total > 0)
}

function analyzeByYearsOfService(employees: any[]) {
    const serviceGroups = {
        '1-5년': (years: number) => years >= 1 && years <= 5,
        '6-10년': (years: number) => years >= 6 && years <= 10,
        '11-15년': (years: number) => years >= 11 && years <= 15,
        '16-20년': (years: number) => years >= 16 && years <= 20,
        '21년+': (years: number) => years >= 21
    }

    return Object.entries(serviceGroups).map(([name, filterFn]) => {
        const group = employees.filter((emp: any) => emp.years_of_service && filterFn(emp.years_of_service))
        const total = group.length
        const agreed = group.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = group.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = group.filter((emp: any) => emp.is_implemented === false).length

        return {
            name,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    }).filter(result => result.total > 0)
}

function analyzeByGender(employees: any[]) {
    const groups = groupBy(employees, 'gender')
    return Object.entries(groups).map(([name, group]) => {
        const total = group.length
        const agreed = group.filter((emp: any) => emp.agreement_status === 'Y').length
        const disagreed = group.filter((emp: any) => emp.is_implemented === true && emp.agreement_status === 'N').length
        const notImplemented = group.filter((emp: any) => emp.is_implemented === false).length

        return {
            name,
            agreed,
            disagreed,
            notImplemented,
            total,
            agreementRate: total > 0 ? Math.round((agreed / total) * 100 * 10) / 10 : 0
        }
    })
}

function analyzeByNotImplemented(employees: any[]) {
    const notImplemented = employees.filter(emp => emp.is_implemented === false)
    const total = employees.length

    return [{
        name: '미실시자',
        agreed: 0,
        disagreed: 0,
        notImplemented: notImplemented.length,
        total,
        agreementRate: 0
    }]
}

// 유틸리티 함수
function groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
        const group = item[key] || '미분류'
        groups[group] = groups[group] || []
        groups[group].push(item)
        return groups
    }, {})
}
