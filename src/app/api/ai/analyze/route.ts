import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface AnalysisRequest {
  category: string
  data: Record<string, unknown>[]
  userQuestion: string
  latestUploadInfo?: {
    fileName: string
    baseDate: string
    baseTime: string
    totalEmployees: number
  }
}

export async function POST(request: NextRequest) {
  let category: string = ''
  let data: Record<string, unknown>[] = []
  let userQuestion: string = ''
  let latestUploadInfo: any = null

  try {
    const requestData: AnalysisRequest = await request.json()
    category = requestData.category
    data = requestData.data
    userQuestion = requestData.userQuestion
    latestUploadInfo = requestData.latestUploadInfo

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '분석할 데이터가 없습니다.' }, { status: 400 })
    }

    if (!userQuestion || userQuestion.trim() === '') {
      return NextResponse.json({ error: '질문을 입력해주세요.' }, { status: 400 })
    }

    // 캐시된 결과 확인
    console.log('캐시된 AI 분석 결과를 확인합니다...')

    const { data: cachedAnalysis } = await supabase
      .from('ai_analysis_cache')
      .select('analysis')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cachedAnalysis) {
      console.log('캐시된 분석 결과를 반환합니다.')
      return NextResponse.json({
        analysis: cachedAnalysis.analysis,
        insights: extractInsights(cachedAnalysis.analysis),
        recommendations: extractRecommendations(cachedAnalysis.analysis),
        timestamp: new Date().toISOString(),
        fromCache: true
      })
    }

    // 캐시된 결과가 없으면 기본 분석 결과 생성
    console.log('캐시된 결과가 없어 기본 분석 결과를 생성합니다.')
    const defaultAnalysis = generateDefaultAnalysis(category, data, userQuestion, latestUploadInfo)

    // 기본 분석 결과를 Supabase에 저장 (캐싱)
    const { error: cacheError } = await supabase
      .from('ai_analysis_cache')
      .upsert({
        category,
        analysis: defaultAnalysis,
        created_at: new Date().toISOString(),
        data_hash: JSON.stringify(data).length
      })

    if (cacheError) {
      console.error('AI 분석 캐싱 오류:', cacheError)
    }

    return NextResponse.json({
      analysis: defaultAnalysis,
      insights: extractInsights(defaultAnalysis),
      recommendations: extractRecommendations(defaultAnalysis),
      timestamp: new Date().toISOString(),
      fromDefault: true
    })

  } catch (error) {
    console.error('AI 분석 오류:', error)

    // 오류 시 기본 분석 결과 반환
    try {
      const defaultAnalysis = generateDefaultAnalysis(category, data, userQuestion, latestUploadInfo)
      return NextResponse.json({
        analysis: defaultAnalysis,
        insights: extractInsights(defaultAnalysis),
        recommendations: extractRecommendations(defaultAnalysis),
        timestamp: new Date().toISOString(),
        fromDefault: true,
        error: '캐시 조회 중 오류가 발생하여 기본 분석 결과를 제공합니다.'
      })
    } catch (defaultError) {
      console.error('기본 분석 생성 오류:', defaultError)
      return NextResponse.json(
        { error: 'AI 분석을 사용할 수 없습니다.' },
        { status: 503 }
      )
    }
  }
}

function generateDefaultAnalysis(category: string, data: Record<string, unknown>[], userQuestion: string, latestUploadInfo?: AnalysisRequest['latestUploadInfo']) {
  const baseInfo = latestUploadInfo
    ? `기준 시점: ${latestUploadInfo.baseDate} ${latestUploadInfo.baseTime}, 총 직원 수: ${latestUploadInfo.totalEmployees}명`
    : '기준 시점 정보 없음'

  // 데이터 분석
  const totalEmployees = data.reduce((sum: number, item: any) => sum + (item.total || 0), 0)
  const agreedEmployees = data.reduce((sum: number, item: any) => sum + (item.agreed || 0), 0)
  const disagreedEmployees = data.reduce((sum: number, item: any) => sum + (item.disagreed || 0), 0)
  const notImplementedEmployees = data.reduce((sum: number, item: any) => sum + (item.notImplemented || 0), 0)
  const overallAgreementRate = totalEmployees > 0 ? Math.round((agreedEmployees / totalEmployees) * 100 * 10) / 10 : 0

  // 카테고리별 분석
  let categoryAnalysis = ''
  if (category === '전체기준') {
    categoryAnalysis = `전체 직원 ${totalEmployees}명 중 동의자 ${agreedEmployees}명, 비동의자 ${disagreedEmployees}명, 미실시자 ${notImplementedEmployees}명으로, 전체 동의율은 ${overallAgreementRate}%입니다.`
  } else if (category === 'Grade별') {
    const gradeAnalysis = data.map((item: any) =>
      `${item.name}: 총 ${item.total}명 (동의 ${item.agreed}명, 비동의 ${item.disagreed}명, 미실시 ${item.notImplemented}명, 동의율 ${item.agreementRate}%)`
    ).join('\n')
    categoryAnalysis = `Grade별 분석 결과:\n${gradeAnalysis}`
  } else {
    const categoryAnalysis = data.map((item: any) =>
      `${item.name}: 총 ${item.total}명 (동의 ${item.agreed}명, 비동의 ${item.disagreed}명, 미실시 ${item.notImplemented}명, 동의율 ${item.agreementRate}%)`
    ).join('\n')
    categoryAnalysis = `${category} 분석 결과:\n${categoryAnalysis}`
  }

  return `
**${category} 분석 결과**

${baseInfo}

**전체 현황:**
- 총 직원 수: ${totalEmployees}명
- 동의자: ${agreedEmployees}명 (${overallAgreementRate}%)
- 비동의자: ${disagreedEmployees}명
- 미실시자: ${notImplementedEmployees}명

**${category}별 상세 분석:**
${categoryAnalysis}

**주요 인사이트:**
1. 전체 동의율이 ${overallAgreementRate}%로 나타나고 있습니다.
2. 미실시자가 ${notImplementedEmployees}명으로 상당한 비중을 차지하고 있습니다.
3. 비동의자는 ${disagreedEmployees}명으로 관리가 필요한 상황입니다.

**권장사항:**
1. 미실시자 대상 추가 설득 및 교육 프로그램 운영
2. 비동의자 대상 개별 면담 및 우려사항 해결
3. 동의율이 낮은 그룹에 대한 집중 관리 방안 수립
4. 정기적인 동의 현황 모니터링 및 보고 체계 구축

이 분석은 ${new Date().toLocaleDateString('ko-KR')} 기준으로 작성되었습니다.
`
}

function generateQuestionBasedPrompt(category: string, data: Record<string, unknown>[], userQuestion: string, latestUploadInfo?: AnalysisRequest['latestUploadInfo']) {
  const baseInfo = latestUploadInfo
    ? `기준 시점: ${latestUploadInfo.baseDate} ${latestUploadInfo.baseTime}, 총 직원 수: ${latestUploadInfo.totalEmployees}명`
    : '기준 시점 정보 없음'

  return `
다음 데이터를 기반으로 사용자의 질문에 답변해주세요.

**기본 정보:**
- 분석 카테고리: ${category}
- ${baseInfo}

**데이터:**
${JSON.stringify(data, null, 2)}

**사용자 질문:**
${userQuestion}

위 데이터를 분석하여 사용자의 질문에 대해 구체적이고 상세한 답변을 제공해주세요. 
답변은 2000자 정도로 작성하고, 수치와 통계를 포함하여 객관적인 분석을 제공해주세요.
`
}

function extractInsights(analysis: string): string[] {
  const sentences = analysis.split('.').filter(s => s.trim().length > 0)
  return sentences.slice(0, 3).map(s => s.trim() + '.')
}

function extractRecommendations(analysis: string): string[] {
  const sentences = analysis.split('.').filter(s => s.trim().length > 0)
  return sentences.slice(-2).map(s => s.trim() + '.')
}
