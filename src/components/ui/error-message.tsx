'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    AlertCircle,
    RefreshCw,
    Home,
    ArrowLeft,
    Settings,
    Wifi,
    FileText,
    Database,
    Shield,
    X
} from 'lucide-react'
import { USER_FRIENDLY_MESSAGES, ERROR_CODES } from '@/lib/errors'

interface ErrorMessageProps {
    error?: Error | string
    errorCode?: string
    title?: string
    description?: string
    showRetry?: boolean
    showGoBack?: boolean
    showGoHome?: boolean
    onRetry?: () => void
    onGoBack?: () => void
    onGoHome?: () => void
    onDismiss?: () => void
    variant?: 'default' | 'inline' | 'toast'
    className?: string
}

// 에러 타입별 아이콘과 색상
const getErrorStyle = (errorCode?: string) => {
    switch (errorCode) {
        case ERROR_CODES.AUTH_INVALID_CREDENTIALS:
        case ERROR_CODES.AUTH_SESSION_EXPIRED:
        case ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS:
            return {
                icon: Shield,
                bgColor: 'bg-purple-50',
                borderColor: 'border-purple-200',
                textColor: 'text-purple-800',
                iconColor: 'text-purple-600',
            }
        case ERROR_CODES.FILE_UPLOAD_FAILED:
        case ERROR_CODES.FILE_INVALID_FORMAT:
        case ERROR_CODES.FILE_TOO_LARGE:
            return {
                icon: FileText,
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-800',
                iconColor: 'text-blue-600',
            }
        case ERROR_CODES.DATA_VALIDATION_FAILED:
        case ERROR_CODES.DATA_NOT_FOUND:
        case ERROR_CODES.DATA_ALREADY_EXISTS:
        case ERROR_CODES.DATA_INVALID_FORMAT:
            return {
                icon: Database,
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-800',
                iconColor: 'text-yellow-600',
            }
        case ERROR_CODES.API_RATE_LIMIT_EXCEEDED:
        case ERROR_CODES.API_SERVICE_UNAVAILABLE:
        case ERROR_CODES.API_TIMEOUT:
            return {
                icon: Wifi,
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                textColor: 'text-orange-800',
                iconColor: 'text-orange-600',
            }
        default:
            return {
                icon: AlertCircle,
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                iconColor: 'text-red-600',
            }
    }
}

export function ErrorMessage({
    error,
    errorCode,
    title,
    description,
    showRetry = true,
    showGoBack = true,
    showGoHome = true,
    onRetry,
    onGoBack,
    onGoHome,
    onDismiss,
    variant = 'default',
    className = '',
}: ErrorMessageProps) {
    const errorMessage = typeof error === 'string' ? error : error?.message
    const userFriendlyMessage = errorCode ? USER_FRIENDLY_MESSAGES[errorCode as keyof typeof USER_FRIENDLY_MESSAGES] : undefined
    const displayMessage = userFriendlyMessage || errorMessage || '오류가 발생했습니다.'

    const style = getErrorStyle(errorCode)
    const IconComponent = style.icon

    const handleRetry = () => {
        if (onRetry) {
            onRetry()
        } else {
            window.location.reload()
        }
    }

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack()
        } else {
            window.history.back()
        }
    }

    const handleGoHome = () => {
        if (onGoHome) {
            onGoHome()
        } else {
            window.location.href = '/'
        }
    }

    // 인라인 에러 메시지
    if (variant === 'inline') {
        return (
            <Alert variant="destructive" className={`${style.bgColor} ${style.borderColor} ${className}`}>
                <IconComponent className={`h-4 w-4 ${style.iconColor}`} />
                <AlertDescription className={style.textColor}>
                    {displayMessage}
                </AlertDescription>
                {onDismiss && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="ml-auto h-auto p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </Alert>
        )
    }

    // 토스트 스타일 에러 메시지
    if (variant === 'toast') {
        return (
            <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
                <Card className={`${style.bgColor} ${style.borderColor} shadow-lg`}>
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                            <IconComponent className={`h-5 w-5 ${style.iconColor} mt-0.5`} />
                            <div className="flex-1">
                                {title && (
                                    <h4 className={`font-medium ${style.textColor} mb-1`}>
                                        {title}
                                    </h4>
                                )}
                                <p className={`text-sm ${style.textColor}`}>
                                    {displayMessage}
                                </p>
                            </div>
                            {onDismiss && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onDismiss}
                                    className="h-auto p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 기본 카드 스타일 에러 메시지
    return (
        <Card className={`${style.bgColor} ${style.borderColor} ${className}`}>
            <CardHeader>
                <CardTitle className={`flex items-center ${style.textColor}`}>
                    <IconComponent className={`h-5 w-5 mr-2 ${style.iconColor}`} />
                    {title || '오류가 발생했습니다'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className={style.textColor}>
                    {displayMessage}
                </p>

                {/* 해결 방법 제안 */}
                <div className={`bg-white/50 border border-white/20 rounded-lg p-3`}>
                    <h4 className={`font-medium ${style.textColor} mb-2`}>
                        해결 방법:
                    </h4>
                    <ul className={`text-sm ${style.textColor} space-y-1`}>
                        {errorCode === ERROR_CODES.AUTH_INVALID_CREDENTIALS && (
                            <>
                                <li>• 사번과 비밀번호를 다시 확인해주세요</li>
                                <li>• 대소문자를 정확히 입력해주세요</li>
                                <li>• Caps Lock이 켜져 있지 않은지 확인해주세요</li>
                            </>
                        )}
                        {errorCode === ERROR_CODES.FILE_UPLOAD_FAILED && (
                            <>
                                <li>• 파일이 손상되지 않았는지 확인해주세요</li>
                                <li>• 다른 파일로 시도해보세요</li>
                                <li>• 파일 크기가 제한을 초과하지 않았는지 확인해주세요</li>
                            </>
                        )}
                        {errorCode === ERROR_CODES.API_SERVICE_UNAVAILABLE && (
                            <>
                                <li>• 인터넷 연결을 확인해주세요</li>
                                <li>• 잠시 후 다시 시도해주세요</li>
                                <li>• 시스템 점검 중일 수 있습니다</li>
                            </>
                        )}
                        {!errorCode && (
                            <>
                                <li>• 페이지를 새로고침해보세요</li>
                                <li>• 이전 페이지로 돌아가보세요</li>
                                <li>• 홈페이지로 이동해보세요</li>
                            </>
                        )}
                    </ul>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex flex-wrap gap-3">
                    {showRetry && (
                        <Button
                            onClick={handleRetry}
                            variant="outline"
                            className="flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            다시 시도
                        </Button>
                    )}
                    {showGoBack && (
                        <Button
                            onClick={handleGoBack}
                            variant="outline"
                            className="flex items-center"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            이전 페이지
                        </Button>
                    )}
                    {showGoHome && (
                        <Button
                            onClick={handleGoHome}
                            className="flex items-center"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            홈으로
                        </Button>
                    )}
                </div>

                {/* 추가 정보 (개발 환경에서만) */}
                {process.env.NODE_ENV === 'development' && error && (
                    <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                            개발자 정보 (클릭하여 확장)
                        </summary>
                        <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto">
                            <div className="mb-2">
                                <strong>Error:</strong> {error instanceof Error ? error.message : error}
                            </div>
                            {error instanceof Error && error.stack && (
                                <div>
                                    <strong>Stack:</strong>
                                    <pre className="mt-1 whitespace-pre-wrap">
                                        {error.stack}
                                    </pre>
                                </div>
                            )}
                            {errorCode && (
                                <div className="mt-2">
                                    <strong>Error Code:</strong> {errorCode}
                                </div>
                            )}
                        </div>
                    </details>
                )}
            </CardContent>
        </Card>
    )
}

// 특정 에러 타입별 컴포넌트들
export const AuthErrorMessage = (props: Omit<ErrorMessageProps, 'errorCode'>) => (
    <ErrorMessage {...props} errorCode={ERROR_CODES.AUTH_INVALID_CREDENTIALS} />
)

export const FileErrorMessage = (props: Omit<ErrorMessageProps, 'errorCode'>) => (
    <ErrorMessage {...props} errorCode={ERROR_CODES.FILE_UPLOAD_FAILED} />
)

export const DataErrorMessage = (props: Omit<ErrorMessageProps, 'errorCode'>) => (
    <ErrorMessage {...props} errorCode={ERROR_CODES.DATA_VALIDATION_FAILED} />
)

export const NetworkErrorMessage = (props: Omit<ErrorMessageProps, 'errorCode'>) => (
    <ErrorMessage {...props} errorCode={ERROR_CODES.API_SERVICE_UNAVAILABLE} />
)

export const PermissionErrorMessage = (props: Omit<ErrorMessageProps, 'errorCode'>) => (
    <ErrorMessage {...props} errorCode={ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS} />
)
