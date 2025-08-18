'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Users, FileText, Clock, AlertCircle, Shield } from 'lucide-react'
import AdminFileUpload from '@/components/AdminFileUpload'
import UploadHistory from '@/components/UploadHistory'
import UserManagement from '@/components/UserManagement'
import { useDashboardData } from '@/lib/hooks/useDashboardData'

export default function AdminPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'upload' | 'history' | 'overview' | 'users'>('overview')

    const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData()

    // 관리자 권한 확인
    const isAdmin = session?.user?.role === 'admin'

    const handleSetupSampleData = async () => {
        try {
            const response = await fetch('/api/setup-sample-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to setup sample data')
            }

            const result = await response.json()
            alert(`샘플 데이터 설정이 완료되었습니다!\n총 ${result.totalEmployees}명의 직원 데이터가 설정되었습니다.`)

            // 페이지 새로고침하여 데이터 반영
            window.location.reload()
        } catch (error) {
            console.error('Error setting up sample data:', error)
            alert(error instanceof Error ? error.message : '샘플 데이터 설정 중 오류가 발생했습니다.')
        }
    }

    useEffect(() => {
        if (status === 'loading') return

        if (!session) {
            router.push('/login')
            return
        }

        if (!isAdmin) {
            router.push('/')
            return
        }
    }, [session, status, isAdmin, router])

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">로딩 중...</span>
            </div>
        )
    }

    if (!session || !isAdmin) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
                                <p className="text-sm text-gray-600">파일 업로드 및 데이터 관리</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/')}
                        >
                            메인 페이지로
                        </Button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border">
                    <Button
                        variant={activeTab === 'overview' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('overview')}
                        className="flex items-center space-x-2"
                    >
                        <Users className="h-4 w-4" />
                        <span>개요</span>
                    </Button>
                    <Button
                        variant={activeTab === 'upload' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('upload')}
                        className="flex items-center space-x-2"
                    >
                        <Upload className="h-4 w-4" />
                        <span>파일 업로드</span>
                    </Button>
                    <Button
                        variant={activeTab === 'history' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('history')}
                        className="flex items-center space-x-2"
                    >
                        <Clock className="h-4 w-4" />
                        <span>업로드 히스토리</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/admin/users')}
                        className="flex items-center space-x-2"
                    >
                        <Users className="h-4 w-4" />
                        <span>사용자 관리</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="mt-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* System Overview */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-lg">
                                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                                        시스템 현황
                                    </CardTitle>
                                    <CardDescription>
                                        현재 시스템 상태 및 통계
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isDashboardLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                                            <span className="ml-2 text-gray-600">로딩 중...</span>
                                        </div>
                                    ) : dashboardData ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                                <span className="text-sm text-blue-700">총 직원 수</span>
                                                <span className="text-lg font-semibold text-blue-900">
                                                    {dashboardData.totalEmployees.toLocaleString()}명
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                                <span className="text-sm text-green-700">동의율</span>
                                                <span className="text-lg font-semibold text-green-900">
                                                    {dashboardData.overallAgreementRate.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                                <span className="text-sm text-orange-700">실시 동의율</span>
                                                <span className="text-lg font-semibold text-orange-900">
                                                    {dashboardData.implementedAgreementRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>데이터가 없습니다.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Latest Upload Info */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-lg">
                                        <FileText className="h-5 w-5 mr-2 text-green-600" />
                                        최신 업로드
                                    </CardTitle>
                                    <CardDescription>
                                        가장 최근에 업로드된 파일 정보
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData?.latestUploadInfo ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-600">파일명</div>
                                                <div className="font-medium text-gray-900 truncate">
                                                    {dashboardData.latestUploadInfo.fileName}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-600">기준 시점</div>
                                                <div className="font-medium text-gray-900">
                                                    {dashboardData.latestUploadInfo.baseDate} {dashboardData.latestUploadInfo.baseTime}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-600">업로드 일시</div>
                                                <div className="font-medium text-gray-900">
                                                    {new Date(dashboardData.latestUploadInfo.uploadDate).toLocaleString('ko-KR')}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Upload className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>업로드된 파일이 없습니다.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center text-lg">
                                        <Upload className="h-5 w-5 mr-2 text-purple-600" />
                                        빠른 작업
                                    </CardTitle>
                                    <CardDescription>
                                        자주 사용하는 관리 기능
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => setActiveTab('upload')}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            새 파일 업로드
                                        </Button>
                                        <Button
                                            onClick={() => setActiveTab('history')}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Clock className="h-4 w-4 mr-2" />
                                            업로드 히스토리
                                        </Button>
                                        <Button
                                            onClick={() => router.push('/')}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            분석 페이지로
                                        </Button>
                                        <Button
                                            onClick={handleSetupSampleData}
                                            variant="outline"
                                            className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            샘플 데이터 설정
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <AdminFileUpload />
                    )}

                    {activeTab === 'history' && (
                        <UploadHistory />
                    )}


                </div>
            </div>
        </div>
    )
}
