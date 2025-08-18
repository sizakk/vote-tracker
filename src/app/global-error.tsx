'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, AlertCircle } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // 에러 로깅
        console.error('Global Error:', error)
    }, [error])

    return (
        <html>
            <body>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <Card className="max-w-lg w-full">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="h-10 w-10 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                시스템 오류가 발생했습니다
                            </CardTitle>
                            <p className="text-gray-600 mt-2">
                                예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 className="font-medium text-red-900 mb-2">오류 정보:</h3>
                                <p className="text-sm text-red-800">
                                    {error.message || '알 수 없는 오류가 발생했습니다.'}
                                </p>
                                {error.digest && (
                                    <p className="text-xs text-red-600 mt-2">
                                        오류 코드: {error.digest}
                                    </p>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-medium text-blue-900 mb-2">해결 방법:</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• 페이지를 새로고침해보세요</li>
                                    <li>• 브라우저 캐시를 삭제해보세요</li>
                                    <li>• 다른 브라우저로 시도해보세요</li>
                                    <li>• 문제가 지속되면 관리자에게 문의하세요</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={reset}
                                    className="w-full"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    다시 시도
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

                            <div className="text-center">
                                <p className="text-sm text-gray-500">
                                    지속적인 문제가 발생하면 관리자에게 문의해주세요.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </body>
        </html>
    )
}
