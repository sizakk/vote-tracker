'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUpload from '@/components/FileUpload';
import KPICards from '@/components/KPICards';
import AnalysisButtons from '@/components/AnalysisButtons';
import DisagreementList from '@/components/DisagreementList';
import ResultChart from '@/components/ResultChart';
import { Employee, AnalysisCategory, AnalysisResult } from '@/lib/types';
import { analyzeByCategoryType } from '@/lib/analysis-utils';
import { Upload, RefreshCw, AlertCircle, CheckCircle, BarChart3, Users } from 'lucide-react';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [overallAgreementRate, setOverallAgreementRate] = useState<number>(0);
  const [implementedAgreementRate, setImplementedAgreementRate] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setError(null);
    setIsLoading(true);
    console.log('파일이 업로드되었습니다:', file.name);
  };

  const handleDataParsed = (parsedEmployees: Employee[]) => {
    setEmployees(parsedEmployees);
    setIsLoading(false);
    console.log('파싱된 직원 데이터:', parsedEmployees);
  };

  const handleKPICalculated = (overallRate: number, implementedRate: number) => {
    setOverallAgreementRate(overallRate);
    setImplementedAgreementRate(implementedRate);
    console.log('KPI 계산 완료:', { overallRate, implementedRate });
  };

  const handleAnalysisSelect = (category: AnalysisCategory) => {
    setSelectedCategory(category);
    setIsProcessing(true);

    try {
      const results = analyzeByCategoryType(employees, category);
      setAnalysisResults(results);
      console.log(`${category} 분석 결과:`, results);
    } catch (error) {
      console.error('분석 중 오류 발생:', error);
      setError('분석 중 오류가 발생했습니다.');
      setAnalysisResults([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewFileUpload = () => {
    setUploadedFile(null);
    setEmployees([]);
    setOverallAgreementRate(0);
    setImplementedAgreementRate(0);
    setSelectedCategory(null);
    setAnalysisResults([]);
    setError(null);
    setIsLoading(false);
    setIsProcessing(false);
  };

  // KPI 데이터 계산
  const totalEmployees = employees.length;
  const agreedEmployees = employees.filter(emp => emp.agreementStatus === 'Y').length;
  const implementedEmployees = employees.filter(emp => emp.isImplemented === 'Y').length;
  const agreedImplementedEmployees = employees.filter(emp => emp.isImplemented === 'Y' && emp.agreementStatus === 'Y').length;

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <BarChart3 className="h-8 w-8" />
                </div>
                VoteTracker
              </h1>
              <p className="text-white/80 text-lg">직원 투표 현황 분석 시스템</p>
            </div>
            {employees.length > 0 && (
              <Button
                onClick={handleNewFileUpload}
                variant="outline"
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Upload className="h-4 w-4" />
                새 파일 업로드
              </Button>
            )}
          </div>
        </header>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50/90 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 메인 컨텐츠 */}
        <main className="space-y-8">
          {/* 1단계: 파일 업로드 전 - 업로드 화면만 표시 */}
          {employees.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FileUpload
                onFileUpload={handleFileUpload}
                onDataParsed={handleDataParsed}
                onKPICalculated={handleKPICalculated}
              />
            </div>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-600 text-lg">파일을 처리하고 있습니다...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2단계: 파일 업로드 완료 후 - 메인 대시보드 표시 */}
          {employees.length > 0 && !isLoading && (
            <>
              {/* 2-1: 새파일업로드 버튼 (헤더에 이미 있음) */}

              {/* 2-2: 대시보드 그리드 레이아웃 */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 왼쪽 컬럼: KPI 카드 */}
                <div className="xl:col-span-1">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      핵심 지표
                    </h2>
                    <KPICards
                      overallAgreementRate={overallAgreementRate}
                      implementedAgreementRate={implementedAgreementRate}
                      totalEmployees={totalEmployees}
                      agreedEmployees={agreedEmployees}
                      implementedEmployees={implementedEmployees}
                      agreedImplementedEmployees={agreedImplementedEmployees}
                    />
                  </div>

                  {/* 비동의자 목록 */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      비동의자 목록
                    </h2>
                    <DisagreementList employees={employees} />
                  </div>
                </div>

                {/* 오른쪽 컬럼: 분석 섹션 */}
                <div className="xl:col-span-2">
                  {/* 분석 카테고리 섹션 */}
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        분석 카테고리
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        분석할 기준을 선택하세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <AnalysisButtons
                        onSelectAnalysis={handleAnalysisSelect}
                        selectedCategory={selectedCategory}
                        disabled={isProcessing}
                      />
                      {isProcessing && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                          <span className="font-medium text-sm">분석 중...</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 선택된 차트 섹션 */}
                  {selectedCategory && analysisResults.length > 0 && !isProcessing && (
                    <>
                      {/* 차트 섹션 */}
                      <ResultChart data={analysisResults} category={selectedCategory} />

                      {/* 상세 결과 섹션 */}
                      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mt-6">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            상세 분석 결과
                          </CardTitle>
                          <CardDescription className="text-base text-gray-600">
                            {selectedCategory} 분석 결과 상세 정보
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analysisResults.map((result, index) => {
                              const isNotImplemented = selectedCategory === '미실시자현황';

                              return (
                                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                  <h4 className="font-bold text-gray-900 mb-3 text-base">{result.name}</h4>
                                  <div className="space-y-2 text-sm">
                                    {isNotImplemented ? (
                                      <>
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-600">미실시:</span>
                                          <span className="text-gray-600 font-bold">{result.notImplemented}명</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between items-center">
                                          <span className="text-gray-800 font-semibold">총 인원:</span>
                                          <span className="font-bold text-lg text-gray-900">{result.total}명</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between items-center">
                                          <span className="text-gray-800 font-semibold">미실시율:</span>
                                          <span className="text-gray-600 font-bold text-lg">{result.agreementRate}%</span>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-600">동의:</span>
                                          <span className="text-green-600 font-bold">{result.agreed}명</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-600">비동의:</span>
                                          <span className="text-red-600 font-bold">{result.disagreed}명</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between items-center">
                                          <span className="text-gray-800 font-semibold">총 인원:</span>
                                          <span className="font-bold text-lg text-gray-900">{result.total}명</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between items-center">
                                          <span className="text-gray-800 font-semibold">동의율:</span>
                                          <span className="text-blue-600 font-bold text-lg">{result.agreementRate}%</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
