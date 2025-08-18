'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, FileText, X } from 'lucide-react';
import { parseExcelFile, validateEmployeeData } from '@/lib/excel-parser';
import { calculateOverallAgreementRate, calculateImplementedAgreementRate } from '@/lib/analysis-utils';
import { Employee, ExcelParseError } from '@/lib/types';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
    onDataParsed?: (employees: Employee[]) => void;
    onKPICalculated?: (overallRate: number, implementedRate: number) => void;
}

export default function FileUpload({ onFileUpload, onDataParsed, onKPICalculated }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedData, setParsedData] = useState<Employee[] | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setError(null);
            handleFile(files[0]);
        }
    };

    const handleFile = async (file: File) => {
        // 파일 유효성 검사
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            setError('파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        setUploadedFile(file);
        setIsUploading(true);
        onFileUpload(file);

        try {
            setIsParsing(true);
            const employees = await parseExcelFile(file);

            // 데이터 유효성 검사
            const isValid = validateEmployeeData(employees);
            if (!isValid) {
                throw new ExcelParseError('데이터 유효성 검사에 실패했습니다.');
            }

            setParsedData(employees);

            // KPI 계산
            const overallRate = calculateOverallAgreementRate(employees);
            const implementedRate = calculateImplementedAgreementRate(employees);

            // 콜백 호출
            if (onDataParsed) {
                onDataParsed(employees);
            }

            if (onKPICalculated) {
                onKPICalculated(overallRate, implementedRate);
            }

            console.log('파싱 완료:', employees.length, '명의 직원 데이터');
            console.log('전체 동의율:', overallRate, '%');
            console.log('진행인원 중 동의율:', implementedRate, '%');

        } catch (err) {
            const errorMessage = err instanceof ExcelParseError ? err.message : '파일 파싱 중 오류가 발생했습니다.';
            setError(errorMessage);
            console.error('파싱 오류:', err);
        } finally {
            setIsUploading(false);
            setIsParsing(false);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setParsedData(null);
        setError(null);
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4 py-8">
            <Card className="w-full max-w-2xl shadow-2xl border-0" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px'
            }}>
                <CardHeader className="text-center pb-8">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                    }}>
                        <FileText className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                        파일 업로드
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 max-w-md mx-auto">
                        직원 투표 데이터가 포함된 Excel 파일을 업로드하여 분석을 시작하세요
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    {/* 드래그 앤 드롭 영역 */}
                    <div
                        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out ${isDragging
                                ? 'border-blue-500 bg-blue-50/50 scale-105'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
                            } ${uploadedFile ? 'border-green-400 bg-green-50/30' : ''}`}
                        style={{
                            minHeight: '300px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {!uploadedFile ? (
                            <div className="p-12 text-center">
                                {/* 업로드 아이콘 */}
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-lg" style={{
                                    background: isDragging
                                        ? 'linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%)'
                                        : 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)'
                                }}>
                                    <Upload className="h-10 w-10 text-blue-600 transition-colors" style={{
                                        color: isDragging ? '#2563eb' : '#3b82f6'
                                    }} />
                                </div>

                                {/* 메인 텍스트 */}
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    파일을 여기에 드래그하거나 클릭하세요
                                </h3>

                                {/* 서브 텍스트 */}
                                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                                    Excel 파일(.xlsx, .xls)을 업로드하여 직원 투표 현황을 분석할 수 있습니다
                                </p>

                                {/* 파일 선택 버튼 */}
                                <Button
                                    size="lg"
                                    className="font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    style={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                    asChild
                                >
                                    <label className="cursor-pointer">
                                        <Upload className="mr-2 h-5 w-5" />
                                        파일 선택
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </label>
                                </Button>

                                {/* 파일 형식 안내 */}
                                <p className="text-sm text-gray-500 mt-4">
                                    지원 형식: .xlsx, .xls (최대 10MB)
                                </p>
                            </div>
                        ) : (
                            <div className="p-8 w-full">
                                {/* 파일 정보 카드 */}
                                <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 shadow-sm">
                                                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-semibold text-gray-900 truncate">
                                                    {uploadedFile.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeFile}
                                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* 상태 표시 */}
                                    <div className="mt-6 space-y-3">
                                        {isUploading && (
                                            <div className="flex items-center space-x-3 text-blue-600">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                                                <span className="font-medium">파일 업로드 중...</span>
                                            </div>
                                        )}

                                        {isParsing && (
                                            <div className="flex items-center space-x-3 text-orange-600">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-600 border-t-transparent"></div>
                                                <span className="font-medium">데이터 파싱 중...</span>
                                            </div>
                                        )}

                                        {parsedData && (
                                            <div className="flex items-center space-x-3 text-green-600">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-medium">
                                                    파싱 완료! {parsedData.length}명의 직원 데이터가 로드되었습니다.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 오류 메시지 */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-center space-x-3 text-red-700">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
