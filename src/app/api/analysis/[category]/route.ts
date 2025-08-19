import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { AnalysisCategory } from '@/lib/types'

interface EmployeeData {
  agreement_status: string
  is_implemented: boolean
  category?: string
  major_org?: string
  grade?: string
  position?: string
  gender?: string
  age?: number
  years_of_service?: number
  hiring_type?: string
  grade_year?: number
}

interface AnalysisResult {
  name: string
  agreed: number
  disagreed: number
  notImplemented: number
  total: number
  agreementRate: number
}

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
    case '직책별':
      return `${baseColumns}, position`
    case '성별별':
      return `${baseColumns}, gender`
    case '나이대별':
      return `${baseColumns}, age`
    case '근속년수별':
      return `${baseColumns}, years_of_service`
    case '입사구분별':
      return `${baseColumns}, hiring_type`
    case 'Grade년차별':
      return `${baseColumns}, grade_year`
    case '미실시자현황':
      return baseColumns
    default:
      return baseColumns
  }
}

function getEmptyResult(category: string): AnalysisResult[] {
  if (category === '전체기준') {
    return [{ name: '전체', agreed: 0, disagreed: 0, notImplemented: 0, total: 0, agreementRate: 0 }]
  }
  return []
}

function analyzeByCategory(employees: EmployeeData[]): AnalysisResult[] {
  const categoryMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  employees.forEach(employee => {
    const category = employee.category || '미분류'

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = categoryMap.get(category)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  return Array.from(categoryMap.entries()).map(([name, stats]) => {
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })
}

function analyzeByMajorOrg(employees: EmployeeData[]): AnalysisResult[] {
  const orgMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  employees.forEach(employee => {
    const org = employee.major_org || '미분류'

    if (!orgMap.has(org)) {
      orgMap.set(org, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = orgMap.get(org)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  return Array.from(orgMap.entries()).map(([name, stats]) => {
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })
}

function analyzeByGrade(employees: EmployeeData[]): AnalysisResult[] {
  const gradeMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  employees.forEach(employee => {
    const grade = employee.grade || '미분류'

    if (!gradeMap.has(grade)) {
      gradeMap.set(grade, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = gradeMap.get(grade)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  // Grade 순서 정의: JA, A, SA, M, S, Aa, SAa, Ma, Sa
  const gradeOrder = ['JA', 'A', 'SA', 'M', 'S', 'Aa', 'SAa', 'Ma', 'Sa']

  // 정의된 순서대로 정렬하고, 정의되지 않은 Grade는 마지막에 추가
  const sortedGrades = Array.from(gradeMap.keys()).sort((a, b) => {
    const indexA = gradeOrder.indexOf(a)
    const indexB = gradeOrder.indexOf(b)

    // 둘 다 정의된 순서에 있는 경우
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }
    // A만 정의된 순서에 있는 경우
    if (indexA !== -1 && indexB === -1) {
      return -1
    }
    // B만 정의된 순서에 있는 경우
    if (indexA === -1 && indexB !== -1) {
      return 1
    }
    // 둘 다 정의되지 않은 경우 알파벳 순서
    return a.localeCompare(b)
  })

  return sortedGrades.map(name => {
    const stats = gradeMap.get(name)!
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })
}

function analyzeByPosition(employees: EmployeeData[]): AnalysisResult[] {
  const positionMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  employees.forEach(employee => {
    const position = employee.position || '미분류'

    if (!positionMap.has(position)) {
      positionMap.set(position, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = positionMap.get(position)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  return Array.from(positionMap.entries()).map(([name, stats]) => {
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })
}

function analyzeByGender(employees: EmployeeData[]): AnalysisResult[] {
  const genderMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  employees.forEach(employee => {
    const gender = employee.gender || '미분류'

    if (!genderMap.has(gender)) {
      genderMap.set(gender, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = genderMap.get(gender)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  return Array.from(genderMap.entries()).map(([name, stats]) => {
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })
}

function analyzeByAgeGroup(employees: EmployeeData[]): AnalysisResult[] {
  const ageGroupMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  console.log('analyzeByAgeGroup - Processing employees:', employees.length)
  console.log('analyzeByAgeGroup - Sample employee data:', employees.slice(0, 3))

  employees.forEach(employee => {
    const age = employee.age || 0
    let ageGroup = '미분류'

    if (age >= 20 && age < 30) ageGroup = '20-29세'
    else if (age >= 30 && age < 40) ageGroup = '30-39세'
    else if (age >= 40 && age < 50) ageGroup = '40-49세'
    else if (age >= 50 && age < 60) ageGroup = '50-59세'
    else if (age >= 60) ageGroup = '60세 이상'

    if (!ageGroupMap.has(ageGroup)) {
      ageGroupMap.set(ageGroup, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = ageGroupMap.get(ageGroup)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  const result = Array.from(ageGroupMap.entries()).map(([name, stats]) => {
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })

  console.log('analyzeByAgeGroup - Final result:', result)
  return result
}

function analyzeByYearsOfService(employees: EmployeeData[]): AnalysisResult[] {
  const serviceMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  employees.forEach(employee => {
    const years = employee.years_of_service || 0
    let serviceGroup = '미분류'

    if (years < 5) serviceGroup = '5년 미만'
    else if (years < 10) serviceGroup = '5-9년'
    else if (years < 15) serviceGroup = '10-14년'
    else if (years < 20) serviceGroup = '15-19년'
    else if (years < 25) serviceGroup = '20-24년'
    else if (years < 30) serviceGroup = '25-29년'
    else serviceGroup = '30년 이상'

    if (!serviceMap.has(serviceGroup)) {
      serviceMap.set(serviceGroup, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = serviceMap.get(serviceGroup)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  return Array.from(serviceMap.entries()).map(([name, stats]) => {
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })
}

function analyzeByHiringType(employees: EmployeeData[]): AnalysisResult[] {
  const hiringMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  employees.forEach(employee => {
    const hiringType = employee.hiring_type || '미분류'

    if (!hiringMap.has(hiringType)) {
      hiringMap.set(hiringType, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = hiringMap.get(hiringType)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  return Array.from(hiringMap.entries()).map(([name, stats]) => {
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })
}

function analyzeByGradeYear(employees: EmployeeData[]): AnalysisResult[] {
  const gradeYearMap = new Map<string, { agreed: number; disagreed: number; notImplemented: number }>()

  employees.forEach(employee => {
    const gradeYear = employee.grade_year || 0
    let gradeYearGroup = '미분류'

    if (gradeYear < 5) gradeYearGroup = '5년차 미만'
    else if (gradeYear < 10) gradeYearGroup = '5-9년차'
    else if (gradeYear < 15) gradeYearGroup = '10-14년차'
    else if (gradeYear < 20) gradeYearGroup = '15-19년차'
    else if (gradeYear < 25) gradeYearGroup = '20-24년차'
    else gradeYearGroup = '25년차 이상'

    if (!gradeYearMap.has(gradeYearGroup)) {
      gradeYearMap.set(gradeYearGroup, { agreed: 0, disagreed: 0, notImplemented: 0 })
    }

    const stats = gradeYearMap.get(gradeYearGroup)!

    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  return Array.from(gradeYearMap.entries()).map(([name, stats]) => {
    const total = stats.agreed + stats.disagreed + stats.notImplemented
    return {
      name,
      agreed: stats.agreed,
      disagreed: stats.disagreed,
      notImplemented: stats.notImplemented,
      total,
      agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
    }
  })
}

function analyzeNotImplemented(employees: EmployeeData[]): AnalysisResult[] {
  const notImplementedCount = employees.filter(emp => !emp.is_implemented).length
  const implementedCount = employees.filter(emp => emp.is_implemented).length

  return [{
    name: '미실시',
    agreed: 0,
    disagreed: 0,
    notImplemented: notImplementedCount,
    total: notImplementedCount,
    agreementRate: 0
  }, {
    name: '실시',
    agreed: 0,
    disagreed: 0,
    notImplemented: 0,
    total: implementedCount,
    agreementRate: 0
  }]
}

function analyzeOverall(employees: EmployeeData[]): AnalysisResult[] {
  const stats = { agreed: 0, disagreed: 0, notImplemented: 0 }

  employees.forEach(employee => {
    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === 'Y') {
      stats.agreed++
    } else if (employee.agreement_status === 'N') {
      stats.disagreed++
    }
  })

  const total = stats.agreed + stats.disagreed + stats.notImplemented
  return [{
    name: '전체',
    agreed: stats.agreed,
    disagreed: stats.disagreed,
    notImplemented: stats.notImplemented,
    total,
    agreementRate: total > 0 ? Math.round((stats.agreed / total) * 100 * 10) / 10 : 0
  }]
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params

    if (!category) {
      return NextResponse.json(getEmptyResult('전체기준'))
    }

    // 최신 업로드 배치 ID 조회
    const client = supabaseAdmin || supabase
    const { data: latestBatch, error: batchError } = await client
      .from('upload_batches')
      .select('id')
      .order('upload_date', { ascending: false })
      .limit(1)
      .single()

    if (batchError || !latestBatch) {
      return NextResponse.json(getEmptyResult(category))
    }

    // 해당 카테고리에 필요한 컬럼만 선택
    const selectColumns = getSelectColumnsForCategory(category)

    // 먼저 전체 개수 확인
    const { count: totalCount } = await client
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('upload_batch_id', latestBatch.id)

    console.log('Analysis API - Total employee count:', totalCount)

    // 페이지네이션으로 전체 데이터 가져오기
    const pageSize = 1000
    const totalPages = Math.ceil((totalCount || 0) / pageSize)
    console.log('Analysis API - Total pages needed:', totalPages)

    let allEmployees: EmployeeData[] = []

    for (let page = 0; page < totalPages; page++) {
      const startRange = page * pageSize
      const endRange = startRange + pageSize - 1

      console.log(`Analysis API - Fetching page ${page + 1}/${totalPages} (range: ${startRange}-${endRange})`)

      const { data: pageData, error: pageError } = await client
        .from('employees')
        .select(selectColumns)
        .eq('upload_batch_id', latestBatch.id)
        .range(startRange, endRange)

      console.log(`Analysis API - Page ${page + 1} sample data:`, pageData?.slice(0, 2))

      if (pageError) {
        console.error(`Analysis API - Error fetching page ${page + 1}:`, pageError)
        return NextResponse.json(getEmptyResult(category))
      }

      if (pageData && Array.isArray(pageData)) {
        allEmployees = allEmployees.concat(pageData)
      }
      console.log(`Analysis API - Page ${page + 1} fetched: ${pageData?.length || 0} records`)
    }

    const employees = allEmployees
    const employeesError = null

    if (employeesError) {
      console.error('Employees fetch error:', employeesError)
      return NextResponse.json(getEmptyResult(category))
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json(getEmptyResult(category))
    }

    // 카테고리별 분석 수행
    let analysisResult: AnalysisResult[]

    switch (category) {
      case '구분별':
        analysisResult = analyzeByCategory(employees as unknown as EmployeeData[])
        break
      case '대조직별':
        analysisResult = analyzeByMajorOrg(employees as unknown as EmployeeData[])
        break
      case 'Grade별':
        analysisResult = analyzeByGrade(employees as unknown as EmployeeData[])
        break
      case '직책별':
        analysisResult = analyzeByPosition(employees as unknown as EmployeeData[])
        break
      case '성별별':
        analysisResult = analyzeByGender(employees as unknown as EmployeeData[])
        break
      case '나이대별':
        analysisResult = analyzeByAgeGroup(employees as unknown as EmployeeData[])
        break
      case '근속년수별':
        analysisResult = analyzeByYearsOfService(employees as unknown as EmployeeData[])
        break
      case '입사구분별':
        analysisResult = analyzeByHiringType(employees as unknown as EmployeeData[])
        break
      case 'Grade년차별':
        analysisResult = analyzeByGradeYear(employees as unknown as EmployeeData[])
        break
      case '미실시자현황':
        analysisResult = analyzeNotImplemented(employees as unknown as EmployeeData[])
        break
      case '전체기준':
      default:
        analysisResult = analyzeOverall(employees as unknown as EmployeeData[])
        break
    }

    console.log(`Analysis API - Final result for ${category}:`, analysisResult)
    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json(getEmptyResult('전체기준'))
  }
}
