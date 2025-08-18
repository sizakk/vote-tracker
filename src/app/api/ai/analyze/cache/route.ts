import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        if (!category) {
            return NextResponse.json({ error: '카테고리가 필요합니다.' }, { status: 400 })
        }

        // 최신 캐시된 분석 결과 조회
        const { data: cachedAnalysis, error } = await supabase
            .from('ai_analysis_cache')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error || !cachedAnalysis) {
            return NextResponse.json(null)
        }

        return NextResponse.json({
            analysis: cachedAnalysis.analysis,
            category: cachedAnalysis.category,
            timestamp: cachedAnalysis.created_at,
            fromCache: true
        })

    } catch (error) {
        console.error('캐시 조회 오류:', error)
        return NextResponse.json({ error: '캐시 조회 중 오류가 발생했습니다.' }, { status: 500 })
    }
}
