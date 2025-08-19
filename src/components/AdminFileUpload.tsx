'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Upload,
  FileSpreadsheet,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { parseExcelFile } from '@/lib/excel-parser'
import { uploadToSupabase } from '@/lib/analysis-utils'
import { Employee } from '@/lib/types'

interface AdminFileUploadProps {
  onUploadSuccess?: () => void
}

export default function AdminFileUpload({ onUploadSuccess }: AdminFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [baseDate, setBaseDate] = useState('')
  const [baseTime, setBaseTime] = useState('')
  const [parsedData, setParsedData] = useState<Employee[] | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('=== File Drop Started ===')
    console.log('Accepted files:', acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))

    if (acceptedFiles.length === 0) {
      console.log('No files accepted')
      return
    }

    const file = acceptedFiles[0]
    console.log('Processing file:', { name: file.name, size: file.size, type: file.type })

    // 파일 확장자 검증
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      console.log('Invalid file extension:', file.name)
      setErrorMessage('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.')
      return
    }

    try {
      console.log('Starting file upload process...')
      setUploadStatus('uploading')
      setUploadProgress(10)
      setErrorMessage(null)

      // Excel 파일 파싱
      console.log('Parsing Excel file...')
      const employees = await parseExcelFile(file)
      console.log('Excel parsing completed. Employee count:', employees.length)
      console.log('First employee sample:', employees[0])
      setParsedData(employees)
      setUploadProgress(30)

      // 기준 날짜/시간 검증
      console.log('Validating date/time:', { baseDate, baseTime })
      if (!baseDate || !baseTime) {
        console.log('Date/time validation failed')
        setErrorMessage('기준 날짜와 시간을 입력해주세요.')
        setUploadStatus('error')
        return
      }

      setUploadProgress(50)

      // 파일명 생성 (yyyy-mm-dd-hhmm.xlsx 형식)
      const dateTime = new Date(`${baseDate}T${baseTime}`)
      const fileName = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, '0')}-${String(dateTime.getDate()).padStart(2, '0')}-${String(dateTime.getHours()).padStart(2, '0')}${String(dateTime.getMinutes()).padStart(2, '0')}.xlsx`
      console.log('Generated filename:', fileName)

      setUploadProgress(70)

      // Supabase에 업로드
      console.log('Uploading to Supabase...')
      const result = await uploadToSupabase(employees, fileName, baseDate, baseTime)
      console.log('Upload result:', result)

      if (result.success) {
        console.log('Upload successful!')
        setUploadProgress(100)
        setUploadStatus('success')
        setParsedData(null)
        setBaseDate('')
        setBaseTime('')

        // 성공 콜백 호출
        if (onUploadSuccess) {
          console.log('Calling onUploadSuccess callback')
          onUploadSuccess()
        }
      } else {
        console.log('Upload failed:', result.error)
        throw new Error(result.error || '업로드 중 오류가 발생했습니다.')
      }

    } catch (error) {
      console.error('File upload error:', error)
      setErrorMessage(error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.')
      setUploadStatus('error')
    } finally {
      console.log('File upload process completed')
      setIsUploading(false)
    }
  }, [baseDate, baseTime, onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleReset = () => {
    setUploadStatus('idle')
    setUploadProgress(0)
    setErrorMessage(null)
    setParsedData(null)
    setBaseDate('')
    setBaseTime('')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          파일 업로드
        </CardTitle>
        <CardDescription>
          Excel 파일을 업로드하여 동의 현황 데이터를 분석할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 기준 날짜/시간 입력 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              기준 날짜
            </Label>
            <Input
              id="base-date"
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              disabled={uploadStatus === 'uploading'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="base-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              기준 시간
            </Label>
            <Input
              id="base-time"
              type="time"
              value={baseTime}
              onChange={(e) => setBaseTime(e.target.value)}
              disabled={uploadStatus === 'uploading'}
            />
          </div>
        </div>

        {/* 파일 업로드 영역 */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive
              ? 'border-blue-500 bg-blue-50'
              : uploadStatus === 'success'
                ? 'border-green-500 bg-green-50'
                : uploadStatus === 'error'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
            }
            ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />

          {uploadStatus === 'uploading' ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div>
                <p className="text-lg font-medium text-gray-900">업로드 중...</p>
                <p className="text-sm text-gray-600">파일을 처리하고 있습니다.</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <p className="text-lg font-medium text-green-900">업로드 완료!</p>
                <p className="text-sm text-green-700">파일이 성공적으로 업로드되었습니다.</p>
                <p className="text-xs text-blue-600 mt-2">3초 후 자동으로 분석 페이지로 이동합니다...</p>
              </div>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <div>
                <p className="text-lg font-medium text-red-900">업로드 실패</p>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
                </p>
                <p className="text-sm text-gray-600">
                  Excel 파일(.xlsx, .xls)만 지원됩니다
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">업로드 전 확인사항:</p>
              <ul className="space-y-1">
                <li>• Excel 파일의 첫 번째 행은 헤더로 사용됩니다</li>
                <li>• 필수 컬럼: 사번, 이름, 실시여부, 동의여부</li>
                <li>• 업로드된 파일은 자동으로 &quot;yyyy-mm-dd-hhmm.xlsx&quot; 형식으로 저장됩니다</li>
                <li>• 기존 데이터는 새로운 파일로 대체됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          {uploadStatus === 'success' && (
            <>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                새로 업로드
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                분석 페이지로 이동
              </Button>
            </>
          )}
          {uploadStatus === 'error' && (
            <Button onClick={handleReset} variant="outline" className="flex-1">
              다시 시도
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
