'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // 에러 로깅
        console.error('Page Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        페이지 오류가 발생했습니다
                    </CardTitle>
                    <p className="text-gray-600 mt-2">
                        페이지를 불러오는 중 문제가 발생했습니다.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h3 className="font-medium text-orange-900 mb-2">오류 정보:</h3>
                        <p className="text-sm text-orange-800">
                            {error.message || '알 수 없는 오류가 발생했습니다.'}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-orange-600 mt-2">
                                오류 코드: {error.digest}
                            </p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">해결 방법:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• 다시 시도 버튼을 클릭해보세요</li>
                            <li>• 이전 페이지로 돌아가보세요</li>
                            <li>• 홈페이지로 이동해보세요</li>
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
                            onClick={() => window.history.back()}
                            variant="outline"
                            className="w-full"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            이전 페이지
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
    )
}

