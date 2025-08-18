'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Users, History, Settings } from 'lucide-react'
import AdminFileUpload from '@/components/AdminFileUpload'
import UploadHistory from '@/components/UploadHistory'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('upload')

  const handleUploadSuccess = () => {
    // 업로드 성공 시 처리
    console.log('File uploaded successfully')
  }

  const handleSetupSampleData = async () => {
    try {
      const response = await fetch('/api/setup-sample-data', {
        method: 'POST',
      })

      if (response.ok) {
        alert('샘플 데이터가 성공적으로 설정되었습니다.')
      } else {
        const error = await response.json()
        alert(`샘플 데이터 설정 실패: ${error.error}`)
      }
    } catch (error) {
      console.error('Sample data setup error:', error)
      alert('샘플 데이터 설정 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600 mt-1">동의현황 확인 시스템 관리</p>
          </div>
          <Button onClick={handleSetupSampleData} variant="outline">
            샘플 데이터 설정
          </Button>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              파일 업로드
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              업로드 기록
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              사용자 관리
            </TabsTrigger>
          </TabsList>

          {/* 파일 업로드 탭 */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Excel 파일 업로드
                </CardTitle>
                <CardDescription>
                  직원 동의 현황 데이터가 포함된 Excel 파일을 업로드하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminFileUpload onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 업로드 기록 탭 */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  업로드 기록
                </CardTitle>
                <CardDescription>
                  이전에 업로드된 파일들의 기록을 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadHistory />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 사용자 관리 탭 */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  사용자 관리
                </CardTitle>
                <CardDescription>
                  시스템 사용자들을 관리할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">사용자 관리 기능은 별도 페이지에서 제공됩니다.</p>
                  <Button asChild>
                    <a href="/admin/users">사용자 관리 페이지로 이동</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
