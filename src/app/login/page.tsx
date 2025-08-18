'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, User, LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [employeeId, setEmployeeId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!employeeId.trim()) return

        setIsLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                employeeId: employeeId.trim(),
                redirect: false
            })

            if (result && 'error' in result && result.error) {
                setError('사번을 확인해주세요.')
            } else {
                router.push('/')
            }
        } catch (error) {
            console.error('Login error:', error)
            setError('로그인 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 숫자만 허용
        const value = e.target.value.replace(/\D/g, '')
        setEmployeeId(value)
    }

    const adminIds = ['122400298', '121800140', '121800077']
    const userIds = ['120700243', '121500029', '121500065', '121600245', '121600276', '121700072', '121900074']

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-2xl border-0" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px'
            }}>
                <CardHeader className="text-center pb-8">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                    }}>
                        <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                        동의현황 확인
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                        직원 동의 현황 분석 시스템
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700 mb-2 block">
                                사번
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="employeeId"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={employeeId}
                                    onChange={handleChange}
                                    placeholder="사번(숫자만)을 입력하세요"
                                    className="pl-10 h-12 text-lg"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                관리자 로그인 시 헤더에 파일 업로드 버튼이 노출됩니다.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                    로그인 중...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <LogIn className="h-5 w-5 mr-2" />
                                    로그인
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">사용 가능한 사번</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                                <p className="font-medium text-blue-600 mb-1">관리자</p>
                                <div className="flex flex-wrap gap-1">
                                    {adminIds.map(id => (
                                        <span key={id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">{id}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-medium text-green-600 mb-1">일반 사용자</p>
                                <div className="flex flex-wrap gap-1">
                                    {userIds.map(id => (
                                        <span key={id} className="px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">{id}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
