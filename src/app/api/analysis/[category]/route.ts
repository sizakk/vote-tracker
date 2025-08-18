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
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params
    
    if (!category) {
      return NextResponse.json({ error: '카테고리가 필요합니다.' }, { status: 400 })
    }

    // 최신 업로드 배치 ID 조회
    const { data: latestBatch, error: batchError } = await supabase
      .from('upload_batches')
      .select('id')
      .order('upload_date', { ascending: false })
      .limit(1)
      .single()

    if (batchError || !latestBatch) {
      return NextResponse.json({ error: '업로드된 데이터가 없습니다.' }, { status: 404 })
    }

    // 해당 카테고리에 필요한 컬럼만 선택
    const selectColumns = getSelectColumnsForCategory(category)
    
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(selectColumns)
      .eq('upload_batch_id', latestBatch.id)

    if (employeesError) {
      console.error('Employees fetch error:', employeesError)
      return NextResponse.json({ error: '데이터 조회 중 오류가 발생했습니다.' }, { status: 500 })
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({ error: '분석할 데이터가 없습니다.' }, { status: 404 })
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
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
