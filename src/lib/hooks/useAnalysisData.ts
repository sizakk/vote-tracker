import { useQuery } from '@tanstack/react-query'
import { AnalysisCategory, AnalysisResult } from '@/lib/types'

async function fetchAnalysisData(category: AnalysisCategory): Promise<AnalysisResult[]> {
    const response = await fetch(`/api/analysis/${category}`, {
        headers: {
            'Cache-Control': 'max-age=600', // 10분간 브라우저 캐싱
        },
    })
    if (!response.ok) {
        throw new Error(`Failed to fetch analysis data for ${category}`)
    }
    const data: AnalysisResult[] = await response.json()
    return data
}

export function useAnalysisData(category: AnalysisCategory) {
    return useQuery({
        queryKey: ['analysis', category],
        queryFn: () => fetchAnalysisData(category),
        staleTime: 1000 * 60 * 10, // 10분간 데이터를 신선하다고 간주
        gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    })
}
