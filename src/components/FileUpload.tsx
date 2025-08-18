'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Calendar, Clock, X } from 'lucide-react';
import { parseExcelFile, validateEmployeeData } from '@/lib/excel-parser';
import { Employee, ExcelParseError } from '@/lib/types';

interface FileUploadProps {
    onFileProcessed: (employees: Employee[]) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string) => void;
}

export default function FileUpload({ onFileProcessed, setIsLoading, setError }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedData, setParsedData] = useState<Employee[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setShowDateTimePicker(true);
    };

    const handleDateTimeConfirm = async () => {
        if (!selectedFile || !selectedDate || !selectedTime) {
            setError('파일, 기준날짜, 시간을 모두 선택해주세요.');
            return;
        }

        setIsUploading(true);
        setIsLoading(true);
        try {
            setIsParsing(true);
            const employees = await parseExcelFile(selectedFile);
            const isValid = validateEmployeeData(employees);
            if (!isValid) {
                throw new ExcelParseError('데이터 유효성 검사에 실패했습니다.');
            }
            setParsedData(employees);
            await uploadToSupabase(employees, selectedFile.name, selectedDate, selectedTime);
            onFileProcessed(employees);
            console.log('파싱 및 업로드 완료:', employees.length, '명의 직원 데이터');

            // 성공 후 초기화
            setSelectedFile(null);
            setSelectedDate('');
            setSelectedTime('');
            setShowDateTimePicker(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            const errorMessage = err instanceof ExcelParseError ? err.message : '파일 파싱 중 오류가 발생했습니다.';
            setError(errorMessage);
            console.error('파싱 오류:', err);
        } finally {
            setIsUploading(false);
            setIsParsing(false);
            setIsLoading(false);
        }
    };

    const uploadToSupabase = async (employees: Employee[], originalFileName: string, baseDate: string, baseTime: string) => {
        try {
            // 기준날짜와 시간을 조합하여 파일명 생성 (yyyy-mm-dd-hhmm 형식)
            const timeString = baseTime.replace(':', '');
            const autoFileName = `${baseDate}-${timeString}.xlsx`;

            // 1. 배치 생성
            const batchResponse = await fetch('/api/upload-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: autoFileName,
                    totalEmployees: employees.length,
                    baseDate: baseDate,
                    baseTime: baseTime
                })
            });

            if (!batchResponse.ok) {
                throw new Error('배치 생성에 실패했습니다.');
            }

            const { batchId } = await batchResponse.json();

            // 2. 직원 데이터 업로드
            const employeesResponse = await fetch('/api/upload-employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employees,
                    batchId
                })
            });

            if (!employeesResponse.ok) {
                throw new Error('직원 데이터 업로드에 실패했습니다.');
            }

            console.log('Supabase 업로드 완료');
        } catch (error) {
            console.error('Supabase 업로드 오류:', error);
            throw error;
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel') {
                handleFileSelect(file);
            } else {
                setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
            }
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel') {
                handleFileSelect(file);
            } else {
                setError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
            }
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setSelectedDate('');
        setSelectedTime('');
        setShowDateTimePicker(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {/* 파일 업로드 카드 */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        파일 업로드
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600">
                        직원 투표 데이터가 포함된 Excel 파일을 업로드하여 분석을 시작하세요
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                            파일을 여기에 드래그하거나 클릭하세요
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Excel 파일(.xlsx, .xls)을 업로드하여 직원 투표 현황을 분석할 수 있습니다
                        </p>
                        <Button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isUploading}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            파일 선택
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-500">
                        지원 형식: .xlsx, .xls (최대 10MB)
                    </div>

                    {selectedFile && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                선택된 파일: {selectedFile.name}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 기준날짜 및 시간 선택 팝업 */}
            {showDateTimePicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                                    기준날짜 및 시간 선택
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                파일 업로드에 사용할 기준날짜와 시간을 선택하세요
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="baseDate" className="text-sm font-medium">
                                    기준날짜
                                </Label>
                                <Input
                                    id="baseDate"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="baseTime" className="text-sm font-medium">
                                    기준시간
                                </Label>
                                <Input
                                    id="baseTime"
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            {selectedDate && selectedTime && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        생성될 파일명: <span className="font-mono text-blue-600">
                                            {selectedDate}-{selectedTime.replace(':', '')}.xlsx
                                        </span>
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleDateTimeConfirm}
                                    disabled={!selectedDate || !selectedTime || isUploading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    {isUploading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            업로드 중...
                                        </div>
                                    ) : (
                                        '업로드'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
