'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText, Users, Calendar, Download, Trash2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UploadHistoryItem {
    id: string
    uploaded_by: string
    upload_date: string
    total_employees: number
    file_name: string
    base_date: string
    base_time: string
}

export default function UploadHistory() {
    const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchUploadHistory()
    }, [])

    const fetchUploadHistory = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const { data, error } = await supabase
                .from('upload_batches')
                .select('*')
                .order('upload_date', { ascending: false })

            if (error) {
                throw error
            }

            setUploadHistory(data || [])
        } catch (err) {
            console.error('Error fetching upload history:', err)
            setError('업로드 히스토리를 불러오는 중 오류가 발생했습니다.')
            toast.error('업로드 히스토리를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('정말로 이 업로드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return
        }

        try {
            // 먼저 관련된 직원 데이터 삭제
            const { error: employeesError } = await supabase
                .from('employees')
                .delete()
                .eq('upload_batch_id', id)

            if (employeesError) {
                throw employeesError
            }

            // 업로드 배치 삭제
            const { error: batchError } = await supabase
                .from('upload_batches')
                .delete()
                .eq('id', id)

            if (batchError) {
                throw batchError
            }

            toast.success('업로드가 성공적으로 삭제되었습니다.')
            fetchUploadHistory() // 목록 새로고침
        } catch (err) {
            console.error('Error deleting upload:', err)
            toast.error('업로드 삭제 중 오류가 발생했습니다.')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatBaseDateTime = (baseDate: string, baseTime: string) => {
        if (!baseDate || !baseTime) return 'N/A'

        const date = new Date(baseDate)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()

        const [hours, minutes] = baseTime.split(':')

        return `${year}년 ${month.toString().padStart(2, '0')}월 ${day.toString().padStart(2, '0')}일 ${hours}시 ${minutes}분`
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <Clock className="h-6 w-6 mr-2 text-blue-600" />
                        업로드 히스토리
                    </CardTitle>
                    <CardDescription>
                        업로드된 파일들의 히스토리를 확인할 수 있습니다
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
                        <span className="text-gray-600">히스토리를 불러오는 중...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <Clock className="h-6 w-6 mr-2 text-blue-600" />
                        업로드 히스토리
                    </CardTitle>
                    <CardDescription>
                        업로드된 파일들의 히스토리를 확인할 수 있습니다
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                        <div>
                            <p className="text-red-600 font-medium">오류가 발생했습니다</p>
                            <p className="text-sm text-gray-500">{error}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center text-xl">
                            <Clock className="h-6 w-6 mr-2 text-blue-600" />
                            업로드 히스토리
                        </CardTitle>
                        <CardDescription>
                            업로드된 파일들의 히스토리를 확인할 수 있습니다
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchUploadHistory}
                    >
                        새로고침
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {uploadHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium">업로드된 파일이 없습니다</p>
                        <p className="text-sm text-gray-400 mt-1">첫 번째 파일을 업로드해보세요</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {uploadHistory.map((item) => (
                            <div
                                key={item.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-medium text-gray-900">{item.file_name}</h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {item.total_employees.toLocaleString()}명
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>기준: {formatBaseDateTime(item.base_date, item.base_time)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Clock className="h-4 w-4" />
                                                <span>업로드: {formatDate(item.upload_date)}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Users className="h-4 w-4" />
                                                <span>업로더: {item.uploaded_by}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
