import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AnalysisCategory } from '@/lib/types'

interface EmployeeData {
  agreement_status: string
  is_implemented: boolean
  category?: string
  major_org?: string
  grade?: string
}

interface AnalysisResult {
  name: string
  agreed: number
  disagreed: number
  notImplemented: number
  total: number
}

function getSelectColumnsForCategory(category: string): string {
  const baseColumns = 'agreement_status, is_implemented'

  switch (category) {
    case '전체기준':
      return baseColumns
    case '카테고리별':
      return `${baseColumns}, category`
    case '대조직별':
      return `${baseColumns}, major_org`
    case '직급별':
      return `${baseColumns}, grade`
    default:
      return baseColumns
  }
}

function getEmptyResult(category: string): AnalysisResult[] {
  if (category === '전체기준') {
    return [{ name: '전체', agreed: 0, disagreed: 0, notImplemented: 0, total: 0 }]
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
    } else if (employee.agreement_status === '동의') {
      stats.agreed++
    } else if (employee.agreement_status === '비동의') {
      stats.disagreed++
    }
  })

  return Array.from(categoryMap.entries()).map(([name, stats]) => ({
    name,
    agreed: stats.agreed,
    disagreed: stats.disagreed,
    notImplemented: stats.notImplemented,
    total: stats.agreed + stats.disagreed + stats.notImplemented
  }))
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
    } else if (employee.agreement_status === '동의') {
      stats.agreed++
    } else if (employee.agreement_status === '비동의') {
      stats.disagreed++
    }
  })

  return Array.from(orgMap.entries()).map(([name, stats]) => ({
    name,
    agreed: stats.agreed,
    disagreed: stats.disagreed,
    notImplemented: stats.notImplemented,
    total: stats.agreed + stats.disagreed + stats.notImplemented
  }))
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
    } else if (employee.agreement_status === '동의') {
      stats.agreed++
    } else if (employee.agreement_status === '비동의') {
      stats.disagreed++
    }
  })

  return Array.from(gradeMap.entries()).map(([name, stats]) => ({
    name,
    agreed: stats.agreed,
    disagreed: stats.disagreed,
    notImplemented: stats.notImplemented,
    total: stats.agreed + stats.disagreed + stats.notImplemented
  }))
}

function analyzeOverall(employees: EmployeeData[]): AnalysisResult[] {
  const stats = { agreed: 0, disagreed: 0, notImplemented: 0 }

  employees.forEach(employee => {
    if (!employee.is_implemented) {
      stats.notImplemented++
    } else if (employee.agreement_status === '동의') {
      stats.agreed++
    } else if (employee.agreement_status === '비동의') {
      stats.disagreed++
    }
  })

  return [{
    name: '전체',
    agreed: stats.agreed,
    disagreed: stats.disagreed,
    notImplemented: stats.notImplemented,
    total: stats.agreed + stats.disagreed + stats.notImplemented
  }]
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params

    if (!category) {
      return NextResponse.json(getEmptyResult('전체기준'))
    }

    // 최신 업로드 배치 ID 조회
    const { data: latestBatch, error: batchError } = await supabase
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

    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(selectColumns)
      .eq('upload_batch_id', latestBatch.id)

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
      case '카테고리별':
        analysisResult = analyzeByCategory(employees as unknown as EmployeeData[])
        break
      case '대조직별':
        analysisResult = analyzeByMajorOrg(employees as unknown as EmployeeData[])
        break
      case '직급별':
        analysisResult = analyzeByGrade(employees as unknown as EmployeeData[])
        break
      case '전체기준':
      default:
        analysisResult = analyzeOverall(employees as unknown as EmployeeData[])
        break
    }

    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json(getEmptyResult('전체기준'))
  }
}
