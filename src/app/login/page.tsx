'use client'

import { useState, useEffect } from 'react'
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
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const router = useRouter()

    // 이미 로그인된 사용자인지 확인
    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await getSession()
                if (session) {
                    console.log('Already logged in, redirecting to home')
                    router.push('/')
                }
            } catch (error) {
                console.error('Session check error:', error)
            } finally {
                setIsCheckingSession(false)
            }
        }
        
        checkSession()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!employeeId.trim()) {
            setError('사번을 입력해주세요.')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            console.log('Attempting login with employee ID:', employeeId.trim())
            
            const result = await signIn('credentials', {
                employeeId: employeeId.trim(),
                redirect: false
            })

            console.log('SignIn result:', result)

            if (result?.error) {
                console.error('Login error:', result.error)
                setError('사번을 확인해주세요.')
            } else if (result?.ok) {
                console.log('Login successful, redirecting...')
                // 강제로 새로고침하여 세션 상태 업데이트
                window.location.href = '/'
            } else {
                console.error('Unexpected login result:', result)
                setError('로그인 중 오류가 발생했습니다.')
            }
        } catch (error) {
            console.error('Login error:', error)
            setError('로그인 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    // 세션 확인 중일 때 로딩 표시
    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">로그인 상태를 확인하는 중...</p>
                </div>
            </div>
        )
    }

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
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ''))}
                                    placeholder="사번을 입력하세요"
                                    className="pl-10 h-12 text-lg"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                사번은 숫자만 입력해주세요.
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
                            disabled={isLoading || employeeId.trim().length === 0}
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
                </CardContent>
            </Card>
        </div>
    )
}
