'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, RefreshCw, Sparkles, Clock, AlertCircle, ChevronDown, ChevronUp, Zap, Send, MessageSquare } from 'lucide-react'
import { useAIAnalysis, useCachedAIAnalysis } from '@/lib/hooks/useAIAnalysis'
import { AnalysisResult } from '@/lib/types'

interface AIAnalysisProps {
    category: string
    data: AnalysisResult[]
    latestUploadInfo?: {
        fileName: string
        baseDate: string
        baseTime: string
        totalEmployees: number
    }
    autoAnalyze?: boolean
}

export default function AIAnalysis({
    category,
    data,
    latestUploadInfo,
    autoAnalyze = false
}: AIAnalysisProps) {
    const [showAnalysis, setShowAnalysis] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [userQuestion, setUserQuestion] = useState('')
    const [lastDataHash, setLastDataHash] = useState<string>('')

    const aiAnalysis = useAIAnalysis()
    const cachedAnalysis = useCachedAIAnalysis(category)

    // 데이터 변경 감지
    useEffect(() => {
        if (!data || data.length === 0) return

        const currentHash = JSON.stringify(data.map(item => ({
            name: item.name,
            agreed: item.agreed,
            disagreed: item.disagreed,
            notImplemented: item.notImplemented,
            total: item.total
        })))

        if (currentHash !== lastDataHash) {
            setLastDataHash(currentHash)
        }
    }, [data, lastDataHash])

    const handleAnalyze = async () => {
        if (!data || data.length === 0 || !userQuestion.trim()) return

        setShowAnalysis(true)

        try {
            await aiAnalysis.mutateAsync({
                category,
                data,
                latestUploadInfo,
                userQuestion: userQuestion.trim()
            })
        } catch (error) {
            console.error('AI 분석 오류:', error)
        }
    }

    const handleRefresh = () => {
        aiAnalysis.reset()
        handleAnalyze()
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleAnalyze()
        }
    }

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // 요약 텍스트 생성 (긴 텍스트를 축약)
    const getSummaryText = (fullText: string) => {
        const sentences = fullText.split('.').filter(s => s.trim().length > 0)
        return sentences.slice(0, 2).join('.') + (sentences.length > 2 ? '...' : '')
    }

    if (!showAnalysis) {
        return (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                        <Brain className="h-5 w-5 mr-2 text-purple-600" />
                        AI 분석
                    </CardTitle>
                    <CardDescription className="text-sm">
                        데이터에 대해 질문하고 AI로 분석 결과를 받아보세요
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="ai-question" className="text-sm font-medium text-gray-700">
                            질문을 입력하세요
                        </label>
                        <div className="flex space-x-2">
                            <Input
                                id="ai-question"
                                value={userQuestion}
                                onChange={(e) => setUserQuestion(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="예: 전체 동의율이 가장 높은 조직은 어디인가요?"
                                className="flex-1"
                                disabled={aiAnalysis.isPending}
                            />
                            <Button
                                onClick={handleAnalyze}
                                disabled={!data || data.length === 0 || !userQuestion.trim() || aiAnalysis.isPending}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                {aiAnalysis.isPending ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Enter 키를 눌러서 질문을 제출할 수 있습니다
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">질문 예시:</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• 전체 동의율이 가장 높은 조직은 어디인가요?</li>
                            <li>• 직급별 동의 현황을 분석해주세요</li>
                            <li>• 실시 여부와 동의율의 상관관계를 설명해주세요</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center text-lg">
                            <Brain className="h-5 w-5 mr-2 text-purple-600" />
                            AI 분석 결과
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {category} 분석 결과
                        </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        {autoAnalyze && (
                            <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                <Zap className="h-3 w-3 mr-1" />
                                자동 업데이트
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={aiAnalysis.isPending}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${aiAnalysis.isPending ? 'animate-spin' : ''}`} />
                            새로고침
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {aiAnalysis.isPending ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">AI가 데이터를 분석하고 있습니다...</p>
                            <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
                        </div>
                    </div>
                ) : aiAnalysis.isError ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                        </AlertDescription>
                    </Alert>
                ) : aiAnalysis.data ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTimestamp(aiAnalysis.data.timestamp)}
                            </div>
                            {aiAnalysis.data.fromCache && (
                                <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded-full">캐시된 결과</span>
                            )}
                        </div>
                        <div className="prose prose-sm max-w-none">
                            {isExpanded ? (
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {aiAnalysis.data.analysis}
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {getSummaryText(aiAnalysis.data.analysis)}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => setIsExpanded(true)}
                                        className="p-0 h-auto text-purple-600 hover:text-purple-700"
                                    >
                                        더 보기
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : cachedAnalysis.data ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTimestamp(cachedAnalysis.data.timestamp)}
                            </div>
                            <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded-full">캐시된 결과</span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                            {isExpanded ? (
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {cachedAnalysis.data.analysis}
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {getSummaryText(cachedAnalysis.data.analysis)}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => setIsExpanded(true)}
                                        className="p-0 h-auto text-purple-600 hover:text-purple-700"
                                    >
                                        더 보기
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>분석 결과가 없습니다.</p>
                        <p className="text-sm mt-1">AI 분석을 시작해보세요</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
