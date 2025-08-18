'use client'

import React, { Suspense } from 'react'
import { LoadingSpinner, CardSkeleton } from '@/components/ui/loading'
import { ComponentErrorBoundary } from '@/components/ui/error-boundary'

// 지연 로딩 컴포넌트들
export const LazyKPICards = React.lazy(() => import('@/components/KPICards'))
export const LazyResultChart = React.lazy(() => import('@/components/ResultChart'))
export const LazyAIAnalysis = React.lazy(() => import('@/components/AIAnalysis'))
export const LazyDisagreementList = React.lazy(() => import('@/components/DisagreementList'))
export const LazyAnalysisButtons = React.lazy(() => import('@/components/AnalysisButtons'))
export const LazyFileUpload = React.lazy(() => import('@/components/FileUpload'))
export const LazyRealtimeStatus = React.lazy(() => import('@/components/RealtimeStatus'))

// 로딩 폴백 컴포넌트들
const KPICardsFallback = () => (
    <div className="space-y-4">
        {[1, 2].map((i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
)

const ChartFallback = () => (
    <CardSkeleton />
)

const AIAnalysisFallback = () => (
    <CardSkeleton />
)

const DisagreementListFallback = () => (
    <CardSkeleton />
)

const AnalysisButtonsFallback = () => (
    <CardSkeleton />
)

const FileUploadFallback = () => (
    <CardSkeleton />
)

const RealtimeStatusFallback = () => (
    <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-sm text-gray-600">실시간 상태 확인 중...</span>
    </div>
)

// Suspense 래퍼 컴포넌트들
export const SuspenseKPICards = (props: any) => (
    <ComponentErrorBoundary componentName="KPICards">
        <Suspense fallback={<KPICardsFallback />}>
            <LazyKPICards {...props} />
        </Suspense>
    </ComponentErrorBoundary>
)

export const SuspenseResultChart = (props: any) => (
    <ComponentErrorBoundary componentName="ResultChart">
        <Suspense fallback={<ChartFallback />}>
            <LazyResultChart {...props} />
        </Suspense>
    </ComponentErrorBoundary>
)

export const SuspenseAIAnalysis = (props: any) => (
    <ComponentErrorBoundary componentName="AIAnalysis">
        <Suspense fallback={<AIAnalysisFallback />}>
            <LazyAIAnalysis {...props} />
        </Suspense>
    </ComponentErrorBoundary>
)

export const SuspenseDisagreementList = (props: any) => (
    <ComponentErrorBoundary componentName="DisagreementList">
        <Suspense fallback={<DisagreementListFallback />}>
            <LazyDisagreementList {...props} />
        </Suspense>
    </ComponentErrorBoundary>
)

export const SuspenseAnalysisButtons = (props: any) => (
    <ComponentErrorBoundary componentName="AnalysisButtons">
        <Suspense fallback={<AnalysisButtonsFallback />}>
            <LazyAnalysisButtons {...props} />
        </Suspense>
    </ComponentErrorBoundary>
)

export const SuspenseFileUpload = (props: any) => (
    <ComponentErrorBoundary componentName="FileUpload">
        <Suspense fallback={<FileUploadFallback />}>
            <LazyFileUpload {...props} />
        </Suspense>
    </ComponentErrorBoundary>
)

export const SuspenseRealtimeStatus = (props: any) => (
    <ComponentErrorBoundary componentName="RealtimeStatus">
        <Suspense fallback={<RealtimeStatusFallback />}>
            <LazyRealtimeStatus {...props} />
        </Suspense>
    </ComponentErrorBoundary>
)

// 범용 Suspense 래퍼
export const SuspenseWrapper = ({
    children,
    fallback,
    errorBoundary = true
}: {
    children: React.ReactNode
    fallback?: React.ReactNode
    errorBoundary?: boolean
}) => {
    const content = (
        <Suspense fallback={fallback || <LoadingSpinner size="lg" />}>
            {children}
        </Suspense>
    )

    if (errorBoundary) {
        return (
            <ComponentErrorBoundary>
                {content}
            </ComponentErrorBoundary>
        )
    }

    return content
}

// 데이터 로딩용 Suspense 래퍼
export const DataSuspenseWrapper = ({
    children,
    dataName = '데이터',
    onRetry
}: {
    children: React.ReactNode
    dataName?: string
    onRetry?: () => void
}) => (
    <ComponentErrorBoundary dataName={dataName} onRetry={onRetry}>
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">{dataName}를 불러오는 중...</p>
                </div>
            </div>
        }>
            {children}
        </Suspense>
    </ComponentErrorBoundary>
)
