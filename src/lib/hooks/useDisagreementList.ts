import { useQuery } from '@tanstack/react-query'

export interface DisagreedEmployee {
    id: number
    employeeId: string
    name: string
    organization: string
    grade: string
    position: string
    agreementStatus: string
}

interface DisagreementListResponse {
    employees: DisagreedEmployee[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

async function fetchDisagreementList(page: number = 1, pageSize: number = 20): Promise<DisagreementListResponse> {
    const response = await fetch(`/api/disagreement-list?page=${page}&pageSize=${pageSize}`, {
        headers: {
            'Cache-Control': 'max-age=300', // 5분간 브라우저 캐싱
        },
    })
    if (!response.ok) {
        throw new Error('Failed to fetch disagreement list')
    }
    return response.json()
}

export function useDisagreementList(page: number = 1, pageSize: number = 20) {
    return useQuery({
        queryKey: ['disagreement-list', page, pageSize],
        queryFn: () => fetchDisagreementList(page, pageSize),
        staleTime: 1000 * 60 * 5, // 5분간 데이터를 신선하다고 간주
        gcTime: 1000 * 60 * 15, // 15분간 캐시 유지
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        placeholderData: (previousData) => previousData, // 페이지 변경 시 이전 데이터 유지
    })
}
