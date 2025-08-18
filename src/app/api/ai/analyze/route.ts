import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
})

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
    try {
        const { category, data, userQuestion, latestUploadInfo }: AnalysisRequest = await request.json()

        if (!data || data.length === 0) {
            return NextResponse.json({ error: '분석할 데이터가 없습니다.' }, { status: 400 })
        }

        if (!userQuestion || userQuestion.trim() === '') {
            return NextResponse.json({ error: '질문을 입력해주세요.' }, { status: 400 })
        }

        // 사용자 질문 기반 프롬프트 생성
        const prompt = generateQuestionBasedPrompt(category, data, userQuestion, latestUploadInfo)

        // OpenAI API 호출
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: '당신은 직원 동의 현황을 분석하는 전문가입니다. 사용자의 질문에 대해 데이터를 기반으로 정확하고 상세한 답변을 제공해주세요. 답변은 2000자 정도로 작성하고, 구체적인 수치와 인사이트를 포함해주세요.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 2500, // 2000자 정도의 답변을 위해 토큰 수 증가
            temperature: 0.7,
        })

        const analysis = completion.choices[0]?.message?.content || '분석 결과를 생성할 수 없습니다.'

        // 분석 결과를 Supabase에 저장 (캐싱)
        const { error: cacheError } = await supabase
            .from('ai_analysis_cache')
            .upsert({
                category,
                analysis,
                created_at: new Date().toISOString(),
                data_hash: JSON.stringify(data).length // 간단한 해시
            })

        if (cacheError) {
            console.error('AI 분석 캐싱 오류:', cacheError)
        }

        return NextResponse.json({
            analysis,
            insights: extractInsights(analysis),
            recommendations: extractRecommendations(analysis),
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('AI 분석 오류:', error)

        // OpenAI API 오류 시 캐시된 결과 반환 시도
        try {
            const { data: cachedAnalysis } = await supabase
                .from('ai_analysis_cache')
                .select('analysis')
                .eq('category', (await request.json()).category)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (cachedAnalysis) {
                return NextResponse.json({
                    analysis: cachedAnalysis.analysis,
                    insights: extractInsights(cachedAnalysis.analysis),
                    recommendations: extractRecommendations(cachedAnalysis.analysis),
                    timestamp: new Date().toISOString(),
                    fromCache: true
                })
            }
        } catch (cacheError) {
            console.error('캐시 조회 오류:', cacheError)
        }

        return NextResponse.json(
            { error: 'AI 분석 중 오류가 발생했습니다.' },
            { status: 500 }
        )
    }
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
    // 분석 텍스트에서 인사이트를 추출하는 간단한 로직
    const sentences = analysis.split('.').filter(s => s.trim().length > 0)
    return sentences.slice(0, 3).map(s => s.trim() + '.')
}

function extractRecommendations(analysis: string): string[] {
    // 분석 텍스트에서 권장사항을 추출하는 간단한 로직
    const sentences = analysis.split('.').filter(s => s.trim().length > 0)
    return sentences.slice(-2).map(s => s.trim() + '.')
}
