'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
    const handleGoBack = () => {
        if (typeof window !== 'undefined') {
            window.history.back()
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        페이지를 찾을 수 없습니다
                    </CardTitle>
                    <p className="text-gray-600 mt-2">
                        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">다음 중 하나를 시도해보세요:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• URL을 다시 확인해주세요</li>
                            <li>• 이전 페이지로 돌아가기</li>
                            <li>• 홈페이지로 이동하기</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button asChild className="w-full">
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                홈으로 돌아가기
                            </Link>
                        </Button>
                        <Button
                            onClick={handleGoBack}
                            variant="outline"
                            className="w-full"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            이전 페이지
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            문제가 지속되면 관리자에게 문의해주세요.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
