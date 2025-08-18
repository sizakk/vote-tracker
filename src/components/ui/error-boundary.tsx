'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Home, ArrowLeft, Settings } from 'lucide-react'
import { logger } from '@/lib/errors'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    resetKey?: string | number
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        // 에러 로깅
        logger.error(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: 'ErrorBoundary',
        })

        this.setState({
            error,
            errorInfo
        })

        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false, error: undefined, errorInfo: undefined })
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    handleReload = () => {
        window.location.reload()
    }

    handleGoBack = () => {
        window.history.back()
    }

    handleGoHome = () => {
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Card className="bg-red-50 border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center text-red-800">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            오류가 발생했습니다
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                예상치 못한 오류가 발생했습니다. 문제가 지속되면 페이지를 새로고침하거나 관리자에게 문의해주세요.
                            </AlertDescription>
                        </Alert>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                                    개발자 정보 (클릭하여 확장)
                                </summary>
                                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto">
                                    <div className="mb-2">
                                        <strong>Error:</strong> {this.state.error.message}
                                    </div>
                                    {this.state.errorInfo && (
                                        <div>
                                            <strong>Component Stack:</strong>
                                            <pre className="mt-1 whitespace-pre-wrap">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                className="flex items-center"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                다시 시도
                            </Button>
                            <Button
                                onClick={this.handleGoBack}
                                variant="outline"
                                className="flex items-center"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                이전 페이지
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                className="flex items-center"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                홈으로
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return this.props.children
    }
}

// 함수형 컴포넌트용 Error Boundary Hook
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null)

    const handleError = React.useCallback((error: Error) => {
        console.error('useErrorBoundary caught an error:', error)
        logger.error(error, { hook: 'useErrorBoundary' })
        setError(error)
    }, [])

    const resetError = React.useCallback(() => {
        setError(null)
    }, [])

    return { error, handleError, resetError }
}

// 특정 컴포넌트용 Error Boundary
export const ComponentErrorBoundary = ({
    children,
    componentName = 'Component',
    fallback
}: {
    children: ReactNode
    componentName?: string
    fallback?: ReactNode
}) => (
    <ErrorBoundary
        fallback={fallback}
        onError={(error, errorInfo) => {
            logger.error(error, {
                componentName,
                componentStack: errorInfo.componentStack,
                errorBoundary: 'ComponentErrorBoundary',
            })
        }}
    >
        {children}
    </ErrorBoundary>
)

// 데이터 로딩용 Error Boundary
export const DataErrorBoundary = ({
    children,
    dataName = '데이터',
    onRetry
}: {
    children: ReactNode
    dataName?: string
    onRetry?: () => void
}) => (
    <ErrorBoundary
        fallback={
            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                    <CardTitle className="flex items-center text-yellow-800">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {dataName} 로딩 오류
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-yellow-700 mb-4">
                        {dataName}를 불러오는 중 오류가 발생했습니다.
                    </p>
                    {onRetry && (
                        <Button onClick={onRetry} className="flex items-center">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            다시 시도
                        </Button>
                    )}
                </CardContent>
            </Card>
        }
    >
        {children}
    </ErrorBoundary>
)

// 네트워크 오류용 Error Boundary
export const NetworkErrorBoundary = ({
    children,
    onRetry
}: {
    children: ReactNode
    onRetry?: () => void
}) => (
    <ErrorBoundary
        fallback={
            <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                    <CardTitle className="flex items-center text-orange-800">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        네트워크 연결 오류
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-orange-700 mb-4">
                        네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {onRetry && (
                            <Button onClick={onRetry} className="flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                다시 시도
                            </Button>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            페이지 새로고침
                        </Button>
                    </div>
                </CardContent>
            </Card>
        }
    >
        {children}
    </ErrorBoundary>
)

// 권한 오류용 Error Boundary
export const PermissionErrorBoundary = ({
    children,
    onGoBack
}: {
    children: ReactNode
    onGoBack?: () => void
}) => (
    <ErrorBoundary
        fallback={
            <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                    <CardTitle className="flex items-center text-purple-800">
                        <Settings className="h-5 w-5 mr-2" />
                        권한 부족
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-purple-700 mb-4">
                        이 페이지에 접근할 권한이 없습니다. 관리자에게 문의해주세요.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {onGoBack && (
                            <Button onClick={onGoBack} className="flex items-center">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                이전 페이지
                            </Button>
                        )}
                        <Button
                            onClick={() => window.location.href = '/'}
                            className="flex items-center"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            홈으로
                        </Button>
                    </div>
                </CardContent>
            </Card>
        }
    >
        {children}
    </ErrorBoundary>
)

// 폼 오류용 Error Boundary
export const FormErrorBoundary = ({
    children,
    onReset
}: {
    children: ReactNode
    onReset?: () => void
}) => (
    <ErrorBoundary
        fallback={
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center text-blue-800">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        폼 처리 오류
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-blue-700 mb-4">
                        폼 처리 중 오류가 발생했습니다. 입력한 정보를 확인하고 다시 시도해주세요.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {onReset && (
                            <Button onClick={onReset} className="flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                폼 초기화
                            </Button>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            페이지 새로고침
                        </Button>
                    </div>
                </CardContent>
            </Card>
        }
    >
        {children}
    </ErrorBoundary>
)

// 전체 페이지용 Error Boundary
export const PageErrorBoundary = ({
    children,
    pageName = '페이지'
}: {
    children: ReactNode
    pageName?: string
}) => (
    <ErrorBoundary
        fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center text-red-800">
                            <AlertCircle className="h-8 w-8 mr-3" />
                            {pageName} 오류
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-600 mb-6">
                            {pageName}를 불러오는 중 오류가 발생했습니다.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                페이지 새로고침
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                                className="w-full"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                홈으로 돌아가기
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        }
    >
        {children}
    </ErrorBoundary>
)
