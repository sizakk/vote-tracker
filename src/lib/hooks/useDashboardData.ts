import { useQuery } from '@tanstack/react-query'

interface DashboardSummary {
    totalEmployees: number
    agreedEmployees: number
    implementedEmployees: number
    agreedImplementedEmployees: number
    overallAgreementRate: number
    implementedAgreementRate: number
    lastUpdated?: string
    latestUploadInfo: {
        fileName: string
        uploadDate: string
        baseDate: string
        baseTime: string
        totalEmployees: number
    } | null
}

async function fetchDashboardSummary(): Promise<DashboardSummary> {
    const response = await fetch('/api/dashboard-summary', {
        headers: {
            'Cache-Control': 'max-age=300', // 5분간 브라우저 캐싱
        },
    })
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary')
    }
    return response.json()
}

export function useDashboardData() {
    return useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: fetchDashboardSummary,
        refetchInterval: 60000, // 1분마다 자동 새로고침 (30초에서 증가)
        staleTime: 1000 * 60 * 5, // 5분간 데이터를 신선하다고 간주 (2분에서 증가)
        gcTime: 1000 * 60 * 15, // 15분간 캐시 유지
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    })
}
