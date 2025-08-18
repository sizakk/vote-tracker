'use client'

import React, { Suspense } from 'react'
import { ErrorBoundary } from './error-boundary'
import {
    CardSkeleton,
    KPICardSkeleton,
    ChartSkeleton,
    AIAnalysisSkeleton
} from './loading'

// 대시보드 컴포넌트들의 지연 로딩
export const LazyKPICards = React.lazy(() => import('../KPICards').then(module => ({ default: module.default })))
export const LazyResultChart = React.lazy(() => import('../ResultChart').then(module => ({ default: module.default })))
export const LazyAIAnalysis = React.lazy(() => import('../AIAnalysis').then(module => ({ default: module.default })))
export const LazyDisagreementList = React.lazy(() => import('../DisagreementList').then(module => ({ default: module.default })))
export const LazyFileUpload = React.lazy(() => import('../FileUpload').then(module => ({ default: module.default })))
export const LazyAdminFileUpload = React.lazy(() => import('../AdminFileUpload').then(module => ({ default: module.default })))
export const LazyUploadHistory = React.lazy(() => import('../UploadHistory').then(module => ({ default: module.default })))
export const LazyUserManagement = React.lazy(() => import('../UserManagement').then(module => ({ default: module.default })))

// 각 컴포넌트별 로딩 스켈레톤
const KPICardsFallback = () => <KPICardSkeleton />
const ResultChartFallback = () => <ChartSkeleton />
const AIAnalysisFallback = () => <AIAnalysisSkeleton />
const DisagreementListFallback = () => <CardSkeleton />
const FileUploadFallback = () => <CardSkeleton />
const AdminFileUploadFallback = () => <CardSkeleton />
const UploadHistoryFallback = () => <CardSkeleton />
const UserManagementFallback = () => <CardSkeleton />

// Suspense 래퍼 컴포넌트
export function SuspenseWrapper({
    children,
    fallback,
    errorFallback,
}: {
    children: React.ReactNode
    fallback?: React.ReactNode
    errorFallback?: React.ReactNode
}) {
    return (
        <ErrorBoundary fallback={errorFallback}>
            <Suspense fallback={fallback}>
                {children}
            </Suspense>
        </ErrorBoundary>
    )
}

// 데이터 로딩을 위한 Suspense 래퍼
export function DataSuspenseWrapper({
    children,
    isLoading,
    fallback,
    errorFallback,
}: {
    children: React.ReactNode
    isLoading?: boolean
    fallback?: React.ReactNode
    errorFallback?: React.ReactNode
}) {
    if (isLoading) {
        return <>{fallback}</>
    }

    return (
        <ErrorBoundary fallback={errorFallback}>
            <Suspense fallback={fallback}>
                {children}
            </Suspense>
        </ErrorBoundary>
    )
}

// 지연 로딩된 컴포넌트들을 위한 래퍼들
export function LazyKPICardsWrapper(props: any) {
    return (
        <SuspenseWrapper fallback={<KPICardsFallback />}>
            <LazyKPICards {...props} />
        </SuspenseWrapper>
    )
}

export function LazyResultChartWrapper(props: any) {
    return (
        <SuspenseWrapper fallback={<ResultChartFallback />}>
            <LazyResultChart {...props} />
        </SuspenseWrapper>
    )
}

export function LazyAIAnalysisWrapper(props: any) {
    return (
        <SuspenseWrapper fallback={<AIAnalysisFallback />}>
            <LazyAIAnalysis {...props} />
        </SuspenseWrapper>
    )
}

export function LazyDisagreementListWrapper(props: any) {
    return (
        <SuspenseWrapper fallback={<DisagreementListFallback />}>
            <LazyDisagreementList {...props} />
        </SuspenseWrapper>
    )
}

export function LazyFileUploadWrapper(props: any) {
    return (
        <SuspenseWrapper fallback={<FileUploadFallback />}>
            <LazyFileUpload {...props} />
        </SuspenseWrapper>
    )
}

export function LazyAdminFileUploadWrapper(props: any) {
    return (
        <SuspenseWrapper fallback={<AdminFileUploadFallback />}>
            <LazyAdminFileUpload {...props} />
        </SuspenseWrapper>
    )
}

export function LazyUploadHistoryWrapper(props: any) {
    return (
        <SuspenseWrapper fallback={<UploadHistoryFallback />}>
            <LazyUploadHistory {...props} />
        </SuspenseWrapper>
    )
}

export function LazyUserManagementWrapper(props: any) {
    return (
        <SuspenseWrapper fallback={<UserManagementFallback />}>
            <LazyUserManagement {...props} />
        </SuspenseWrapper>
    )
}

// 동적 임포트 유틸리티 함수
export function createLazyComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    fallback: React.ComponentType
) {
    const LazyComponent = React.lazy(importFunc)

    return function LazyWrapper(props: React.ComponentProps<T>) {
        return (
            <SuspenseWrapper fallback={<fallback />}>
                <LazyComponent {...props} />
            </SuspenseWrapper>
        )
    }
}

// 페이지별 코드 분할을 위한 동적 임포트
export const LazyLoginPage = React.lazy(() => import('@/app/login/page'))
export const LazyAdminPage = React.lazy(() => import('@/app/admin/page'))

// 페이지 로딩을 위한 스켈레톤
const PageSkeleton = () => (
    <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
            </div>
        </div>
    </div>
)

export function LazyLoginPageWrapper() {
    return (
        <SuspenseWrapper fallback={<PageSkeleton />}>
            <LazyLoginPage />
        </SuspenseWrapper>
    )
}

export function LazyAdminPageWrapper() {
    return (
        <SuspenseWrapper fallback={<PageSkeleton />}>
            <LazyAdminPage />
        </SuspenseWrapper>
    )
}
