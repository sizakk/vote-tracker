'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RefreshCw, BarChart3, TrendingUp, Users, Brain } from 'lucide-react'

// 기본 로딩 스피너
export const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    }

    return (
        <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-600 ${className}`} />
    )
}

// 카드 스켈레톤 로더
export const CardSkeleton = ({
    title = true,
    content = true,
    className = ''
}: {
    title?: boolean
    content?: boolean
    className?: string
}) => (
    <Card className={`bg-white/95 backdrop-blur-sm border-0 shadow-2xl ${className}`}>
        {title && (
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
            </CardHeader>
        )}
        {content && (
            <CardContent className="pt-0">
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
            </CardContent>
        )}
    </Card>
)

// KPI 카드 스켈레톤
export const KPICardSkeleton = () => (
    <div className="space-y-4">
        {[1, 2].map((i) => (
            <Card key={i} className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="space-y-3">
                            <div className="text-center">
                                <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                            </div>
                            <div className="space-y-1.5">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
)

// 차트 스켈레톤
export const ChartSkeleton = () => (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="h-80 bg-gray-100 rounded-lg animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
            </div>
        </CardContent>
    </Card>
)

// AI 분석 스켈레톤
export const AIAnalysisSkeleton = () => (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
                </div>
            </div>
        </CardContent>
    </Card>
)

// 테이블 스켈레톤
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-hidden">
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
                <div className="space-y-3">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="h-4 bg-gray-100 rounded animate-pulse"></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
)

// 폼 스켈레톤
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                ))}
                <div className="flex gap-3 pt-4">
                    <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-20 bg-gray-100 rounded animate-pulse"></div>
                </div>
            </div>
        </CardContent>
    </Card>
)

// 네비게이션 스켈레톤
export const NavigationSkeleton = () => (
    <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-100 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
)

// 사이드바 스켈레톤
export const SidebarSkeleton = () => (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                ))}
            </div>
        </div>
    </div>
)

// 페이지 로딩 오버레이
export const PageLoadingOverlay = ({
    message = '데이터를 불러오는 중...',
    show = false
}: {
    message?: string
    show?: boolean
}) => {
    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">{message}</p>
                </div>
            </div>
        </div>
    )
}

// 페이드 인 애니메이션 래퍼
export const FadeInWrapper = ({
    children,
    delay = 0,
    className = ''
}: {
    children: React.ReactNode
    delay?: number
    className?: string
}) => (
    <div
        className={`animate-in fade-in duration-500 ${className}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {children}
    </div>
)

// 슬라이드 인 애니메이션 래퍼
export const SlideInWrapper = ({
    children,
    direction = 'up',
    delay = 0,
    className = ''
}: {
    children: React.ReactNode
    direction?: 'up' | 'down' | 'left' | 'right'
    delay?: number
    className?: string
}) => {
    const directionClasses = {
        up: 'slide-in-from-bottom',
        down: 'slide-in-from-top',
        left: 'slide-in-from-right',
        right: 'slide-in-from-left'
    }

    return (
        <div
            className={`animate-in ${directionClasses[direction]} duration-500 ${className}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}

// 스켈레톤 텍스트
export const SkeletonText = ({
    lines = 1,
    className = ''
}: {
    lines?: number
    className?: string
}) => (
    <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
            />
        ))}
    </div>
)

// 스켈레톤 버튼
export const SkeletonButton = ({
    size = 'md',
    className = ''
}: {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}) => {
    const sizeClasses = {
        sm: 'h-8 w-20',
        md: 'h-10 w-24',
        lg: 'h-12 w-32'
    }

    return (
        <div className={`${sizeClasses[size]} bg-gray-200 rounded animate-pulse ${className}`} />
    )
}

// 스켈레톤 아바타
export const SkeletonAvatar = ({
    size = 'md',
    className = ''
}: {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12'
    }

    return (
        <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse ${className}`} />
    )
}

// 스켈레톤 배지
export const SkeletonBadge = ({
    className = ''
}: {
    className?: string
}) => (
    <div className={`h-6 w-16 bg-gray-200 rounded-full animate-pulse ${className}`} />
)

// 스켈레톤 인풋
export const SkeletonInput = ({
    className = ''
}: {
    className?: string
}) => (
    <div className={`h-10 bg-gray-100 rounded border animate-pulse ${className}`} />
)

// 스켈레톤 셀렉트
export const SkeletonSelect = ({
    className = ''
}: {
    className?: string
}) => (
    <div className={`h-10 bg-gray-100 rounded border animate-pulse ${className}`} />
)
