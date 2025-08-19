'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Upload, BarChart3, Users, FileText } from 'lucide-react'
import { useDashboardData } from '@/lib/hooks/useDashboardData'
import { useAnalysisData } from '@/lib/hooks/useAnalysisData'
import { useDisagreementList } from '@/lib/hooks/useDisagreementList'
import { AnalysisCategory } from '@/lib/types'
import RealtimeStatus from '@/components/RealtimeStatus'
import AnalysisButtons from '@/components/AnalysisButtons'
import {
  FadeInWrapper,
  SlideInWrapper,
  PageLoadingOverlay
} from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import {
  LazyKPICardsWrapper,
  LazyResultChartWrapper,
  LazyAIAnalysisWrapper,
  LazyDisagreementListWrapper
} from '@/components/ui/lazy-components'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory>('전체기준')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboardData()
  const { data: analysisData, isLoading: analysisLoading, error: analysisError } = useAnalysisData(selectedCategory)
  const { data: disagreementData, isLoading: disagreementLoading } = useDisagreementList(currentPage, 20)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <PageLoadingOverlay />
  }

  if (!session) {
    return null
  }

  const formatBaseDateTime = (fileName: string) => {
    // 파일명에서 날짜와 시간 추출 (예: 2025_08_14_1430.xlsx)
    const match = fileName.match(/(\d{4})_(\d{2})_(\d{2})_(\d{2})(\d{2})/)
    if (match) {
      const [, year, month, day, hour, minute] = match
      return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분 기준`
    }
    return fileName
  }

  const isAdmin = session.user?.role === 'admin'

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <PageLoadingOverlay />

        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">동의현황 확인</h1>
                <RealtimeStatus isConnected={false} />
              </div>

              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Button
                    onClick={() => setShowFileUpload(true)}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>파일 업로드</span>
                  </Button>
                )}

                <Button
                  onClick={() => router.push('/admin')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>관리자</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {/* 기준 시점 정보 표시 */}
          <FadeInWrapper>
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>기준 시점 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.latestUploadInfo ? (
                  <div className="text-sm text-gray-600">
                    {formatBaseDateTime(dashboardData.latestUploadInfo.fileName)}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">업로드된 파일이 없습니다.</div>
                )}
              </CardContent>
            </Card>
          </FadeInWrapper>

          {/* 분석 카테고리 선택 */}
          <FadeInWrapper>
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>분석 카테고리</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisButtons
                  onSelectAnalysis={setSelectedCategory}
                  selectedCategory={selectedCategory}
                  disabled={dashboardLoading}
                />
              </CardContent>
            </Card>
          </FadeInWrapper>

          {/* 메인 대시보드 그리드 */}
          <SlideInWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* KPI 카드 */}
              <div className="lg:col-span-1">
                {dashboardData && (
                  <LazyKPICardsWrapper
                    overallAgreementRate={dashboardData.overallAgreementRate || 0}
                    implementedAgreementRate={dashboardData.implementedAgreementRate || 0}
                    totalEmployees={dashboardData.totalEmployees || 0}
                    agreedEmployees={dashboardData.agreedEmployees || 0}
                    implementedEmployees={dashboardData.implementedEmployees || 0}
                    agreedImplementedEmployees={dashboardData.agreedImplementedEmployees || 0}
                    isLoading={dashboardLoading}
                    lastUpdated={dashboardData.lastUpdated}
                  />
                )}
              </div>

              {/* 분석 차트 */}
              <div className="lg:col-span-2">
                {analysisData && (
                  <LazyResultChartWrapper
                    data={analysisData}
                    category={selectedCategory}
                    isLoading={analysisLoading}
                    lastUpdated={dashboardData?.lastUpdated}
                  />
                )}
              </div>
            </div>

            {/* AI 분석 섹션 */}
            <div className="mt-6">
              {analysisData && (
                <LazyAIAnalysisWrapper
                  category={selectedCategory}
                  data={analysisData}
                  latestUploadInfo={dashboardData?.latestUploadInfo}
                  autoAnalyze={true}
                />
              )}
            </div>

            {/* 비동의 목록 */}
            {selectedCategory === '전체기준' && disagreementData && (
              <div className="mt-6">
                <LazyDisagreementListWrapper
                  data={disagreementData.data || []}
                  total={disagreementData.total || 0}
                  page={disagreementData.page || 1}
                  totalPages={disagreementData.totalPages || 1}
                  isLoading={disagreementLoading}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </SlideInWrapper>
        </main>
      </div>
    </ErrorBoundary>
  )
}
