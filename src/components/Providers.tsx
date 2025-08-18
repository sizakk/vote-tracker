'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 10, // 10분으로 증가 (더 긴 캐싱)
                gcTime: 1000 * 60 * 30, // 30분간 가비지 컬렉션 지연 (이전 cacheTime)
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
                retry: (failureCount, error) => {
                    // 네트워크 오류가 아닌 경우 1번만 재시도
                    if (error instanceof Error && error.message.includes('Failed to fetch')) {
                        return failureCount < 2
                    }
                    return false
                },
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            },
            mutations: {
                retry: 1,
                retryDelay: 1000,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                {/* 개발 환경에서만 React Query DevTools 표시 */}
                {/* ReactQueryDevtools는 현재 비활성화됨 */}
            </SessionProvider>
        </QueryClientProvider>
    )
}
