'use client'

import React, { Suspense, ComponentType } from 'react'
import { ErrorBoundary } from './error-boundary'

// Lazy-loaded components
export const LazyKPICards = React.lazy(() => import('@/components/KPICards'))
export const LazyResultChart = React.lazy(() => import('@/components/ResultChart'))
export const LazyAIAnalysis = React.lazy(() => import('@/components/AIAnalysis'))
export const LazyDisagreementList = React.lazy(() => import('@/components/DisagreementList'))
export const LazyFileUpload = React.lazy(() => import('@/components/FileUpload'))
export const LazyAdminFileUpload = React.lazy(() => import('@/components/AdminFileUpload'))
export const LazyUploadHistory = React.lazy(() => import('@/components/UploadHistory'))
export const LazyUserManagement = React.lazy(() => import('@/components/UserManagement'))
export const LazyLoginPage = React.lazy(() => import('@/app/login/page'))
export const LazyAdminPage = React.lazy(() => import('@/app/admin/page'))

// Fallback components
const KPICardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    ))}
  </div>
)

const ResultChartSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
)

const AIAnalysisSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
)

const DisagreementListSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
)

const FileUploadSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-32 bg-gray-200 rounded border-2 border-dashed"></div>
  </div>
)

const AdminFileUploadSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-32 bg-gray-200 rounded border-2 border-dashed"></div>
  </div>
)

const UploadHistorySkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
)

const UserManagementSkeleton = () => (
  <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
)

const LoginPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-sm animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
)

const AdminPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
)

// Wrapper components with Suspense and Error Boundary
export const LazyKPICardsWrapper: ComponentType<React.ComponentProps<typeof LazyKPICards>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<KPICardsSkeleton />}>
      <LazyKPICards {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyResultChartWrapper: ComponentType<React.ComponentProps<typeof LazyResultChart>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<ResultChartSkeleton />}>
      <LazyResultChart {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyAIAnalysisWrapper: ComponentType<React.ComponentProps<typeof LazyAIAnalysis>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<AIAnalysisSkeleton />}>
      <LazyAIAnalysis {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyDisagreementListWrapper: ComponentType<React.ComponentProps<typeof LazyDisagreementList>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<DisagreementListSkeleton />}>
      <LazyDisagreementList {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyFileUploadWrapper: ComponentType<React.ComponentProps<typeof LazyFileUpload>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<FileUploadSkeleton />}>
      <LazyFileUpload {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyAdminFileUploadWrapper: ComponentType<React.ComponentProps<typeof LazyAdminFileUpload>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<AdminFileUploadSkeleton />}>
      <LazyAdminFileUpload {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyUploadHistoryWrapper: ComponentType<React.ComponentProps<typeof LazyUploadHistory>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<UploadHistorySkeleton />}>
      <LazyUploadHistory {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyUserManagementWrapper: ComponentType<React.ComponentProps<typeof LazyUserManagement>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<UserManagementSkeleton />}>
      <LazyUserManagement {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyLoginPageWrapper: ComponentType<React.ComponentProps<typeof LazyLoginPage>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<LoginPageSkeleton />}>
      <LazyLoginPage {...props} />
    </Suspense>
  </ErrorBoundary>
)

export const LazyAdminPageWrapper: ComponentType<React.ComponentProps<typeof LazyAdminPage>> = (props) => (
  <ErrorBoundary>
    <Suspense fallback={<AdminPageSkeleton />}>
      <LazyAdminPage {...props} />
    </Suspense>
  </ErrorBoundary>
)

// Utility function for creating lazy components
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ComponentType
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(importFn)
  
  return (props: React.ComponentProps<T>) => (
    <ErrorBoundary>
      <Suspense fallback={React.createElement(fallback)}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

// Generic Suspense wrapper
export const SuspenseWrapper: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ children, fallback }) => (
  <ErrorBoundary>
    <Suspense fallback={fallback || <div className="animate-pulse">Loading...</div>}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

// Data-specific Suspense wrapper
export const DataSuspenseWrapper: React.FC<{
  children: React.ReactNode
  isLoading?: boolean
  error?: Error | null
}> = ({ children, isLoading, error }) => {
  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return <>{children}</>
}
