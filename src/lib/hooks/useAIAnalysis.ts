import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface AIAnalysisRequest {
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

interface AIAnalysisResponse {
    analysis: string
    insights: string[]
    recommendations: string[]
    timestamp: string
    fromCache?: boolean
}

interface CachedAnalysis {
    id: string
    category: string
    analysis: string
    insights: string[]
    recommendations: string[]
    created_at: string
    timestamp: string
}

// AI 분석 요청 함수
async function requestAIAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=3600', // 1시간간 브라우저 캐싱
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        throw new Error('Failed to request AI analysis')
    }

    return response.json()
}

// 캐시된 분석 결과 조회 함수
async function fetchCachedAnalysis(category: string): Promise<CachedAnalysis | null> {
    const response = await fetch(`/api/ai/analyze/cache?category=${encodeURIComponent(category)}`, {
        headers: {
            'Cache-Control': 'max-age=1800', // 30분간 브라우저 캐싱
        },
    })

    if (response.status === 404) {
        return null
    }

    if (!response.ok) {
        throw new Error('Failed to fetch cached analysis')
    }

    return response.json()
}

// AI 분석 요청 훅
export function useAIAnalysis() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: requestAIAnalysis,
        onSuccess: (data, variables) => {
            // 성공 시 해당 카테고리의 캐시 무효화
            queryClient.invalidateQueries({
                queryKey: ['ai-analysis-cache', variables.category]
            })
        },
        retry: 1,
        retryDelay: 2000,
    })
}

// AI 분석 요청 훅 (기존 이름 유지)
export function useAIAnalysisMutation() {
    return useAIAnalysis()
}

// 캐시된 분석 결과 조회 훅
export function useCachedAIAnalysis(category: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['ai-analysis-cache', category],
        queryFn: () => fetchCachedAnalysis(category),
        enabled: enabled && !!category,
        staleTime: 1000 * 60 * 30, // 30분간 데이터를 신선하다고 간주
        gcTime: 1000 * 60 * 60, // 1시간간 캐시 유지
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    })
}
