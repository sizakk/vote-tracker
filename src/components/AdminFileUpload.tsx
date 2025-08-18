'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Calendar, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { parseExcelFile } from '@/lib/excel-parser'
import { uploadToSupabase } from '@/lib/analysis-utils'
import toast from 'react-hot-toast'

interface UploadBatch {
    id: string
    uploaded_by: string
    upload_date: string
    total_employees: number
    file_name: string
    base_date: string
    base_time: string
}

export default function AdminFileUpload() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [showDateTimePicker, setShowDateTimePicker] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            setSelectedFile(file)
            setShowDateTimePicker(true)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false
    })

    const handleUpload = async () => {
        if (!selectedFile || !selectedDate || !selectedTime) {
            toast.error('파일과 날짜/시간을 모두 선택해주세요.')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        try {
            // 파일 파싱
            setUploadProgress(20)
            const employees = await parseExcelFile(selectedFile)

            if (!employees || employees.length === 0) {
                throw new Error('파일에서 데이터를 읽을 수 없습니다.')
            }

            // 파일명 생성 (yyyy-mm-dd-hhmm.xlsx)
            const dateTime = new Date(`${selectedDate}T${selectedTime}`)
            const autoFileName = `${selectedDate.replace(/-/g, '')}-${selectedTime.replace(/:/g, '')}.xlsx`

            setUploadProgress(40)

            // Supabase에 업로드
            const uploadResult = await uploadToSupabase(
                employees,
                autoFileName,
                selectedDate,
                selectedTime
            )

            setUploadProgress(80)

            if (uploadResult.success) {
                toast.success('파일이 성공적으로 업로드되었습니다!')
                setSelectedFile(null)
                setShowDateTimePicker(false)
                setSelectedDate('')
                setSelectedTime('')
                setUploadProgress(100)

                // 잠시 후 진행률 초기화
                setTimeout(() => setUploadProgress(0), 2000)
            } else {
                throw new Error(uploadResult.error || '업로드 중 오류가 발생했습니다.')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.')
            setUploadProgress(0)
        } finally {
            setIsUploading(false)
        }
    }

    const handleCancel = () => {
        setSelectedFile(null)
        setShowDateTimePicker(false)
        setSelectedDate('')
        setSelectedTime('')
        setUploadProgress(0)
    }

    return (
        <div className="space-y-6">
            {/* File Upload Area */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <Upload className="h-6 w-6 mr-2 text-blue-600" />
                        Excel 파일 업로드
                    </CardTitle>
                    <CardDescription>
                        직원 동의 현황 데이터가 포함된 Excel 파일을 업로드하세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showDateTimePicker ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            {isDragActive ? (
                                <p className="text-blue-600 font-medium">파일을 여기에 놓으세요...</p>
                            ) : (
                                <div>
                                    <p className="text-lg font-medium text-gray-900 mb-2">
                                        파일을 드래그하거나 클릭하여 선택
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Excel 파일 (.xlsx, .xls)만 지원됩니다
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Selected File Info */}
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium text-blue-900">{selectedFile?.name}</p>
                                        <p className="text-sm text-blue-700">
                                            크기: {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Date and Time Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="date" className="flex items-center mb-2">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        기준 날짜
                                    </Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="time" className="flex items-center mb-2">
                                        <Clock className="h-4 w-4 mr-2" />
                                        기준 시간
                                    </Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Auto-generated filename preview */}
                            {selectedDate && selectedTime && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">자동 생성될 파일명:</p>
                                    <p className="font-mono text-sm font-medium text-gray-900">
                                        {selectedDate.replace(/-/g, '')}-{selectedTime.replace(/:/g, '')}.xlsx
                                    </p>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>업로드 진행률</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <Button
                                    onClick={handleUpload}
                                    disabled={!selectedDate || !selectedTime || isUploading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    {isUploading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            업로드 중...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Upload className="h-4 w-4 mr-2" />
                                            업로드
                                        </div>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={isUploading}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    취소
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                        업로드 가이드
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Excel 파일은 .xlsx 또는 .xls 형식이어야 합니다.</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>필수 컬럼: 사번, 구분, 대조직, 조직, 이름, Grade, Grade년차, 직책, 근속년수, 입사구분, 성별, 나이, 실시여부, 동의여부</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>실시여부와 동의여부는 'Y' 또는 'N'으로 입력해야 합니다.</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>업로드된 파일은 자동으로 'yyyy-mm-dd-hhmm.xlsx' 형식으로 저장됩니다.</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
