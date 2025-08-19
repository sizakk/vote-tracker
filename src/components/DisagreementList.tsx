'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'

interface DisagreedEmployee {
    employeeId: string
    name: string
    majorOrg: string // organization에서 majorOrg로 변경
    grade: string
    position: string
    agreementStatus: string
    isImplemented: boolean
}

interface DisagreementListProps {
    data?: DisagreedEmployee[]
    total?: number
    page?: number
    totalPages?: number
    isLoading?: boolean
    error?: string
    onPageChange?: (page: number) => void
}

export default function DisagreementList({
    data = [],
    total = 0,
    page = 1,
    totalPages = 1,
    isLoading = false,
    error = '',
    onPageChange
}: DisagreementListProps) {

    const handlePreviousPage = () => {
        if (page > 1 && onPageChange) {
            onPageChange(page - 1)
        }
    }

    const handleNextPage = () => {
        if (page < totalPages && onPageChange) {
            onPageChange(page + 1)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                        <Users className="h-5 w-5 mr-2 text-red-600" />
                        비동의자 목록
                    </CardTitle>
                    <CardDescription className="text-sm">
                        실시되었으나 동의하지 않은 직원 목록
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mr-3"></div>
                        <span className="text-gray-600">로딩 중...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                        <Users className="h-5 w-5 mr-2 text-red-600" />
                        비동의자 목록
                    </CardTitle>
                    <CardDescription className="text-sm">
                        실시되었으나 동의하지 않은 직원 목록
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-red-600">
                        {error}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-red-600" />
                    비동의자 목록
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                    실시되었으나 동의하지 않은 직원 목록 ({total}명)
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">로딩 중...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>비동의자가 없습니다.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs font-medium text-gray-700">사번</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-700">이름</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-700">조직</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-700">Grade</TableHead>
                                        <TableHead className="text-xs font-medium text-gray-700">직책</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((employee, index) => (
                                        <TableRow key={employee.employeeId || index} className="hover:bg-gray-50">
                                            <TableCell className="text-xs text-gray-900 font-medium">
                                                {employee.employeeId}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-900">
                                                {employee.name}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-600">
                                                {employee.majorOrg}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-600">
                                                {employee.grade}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-600">
                                                {employee.position}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 px-2">
                                <div className="text-xs text-gray-600">
                                    {page}-{Math.min(page * 10, total)} / {total}명
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={page === 1}
                                        className="h-7 px-2"
                                    >
                                        <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    <span className="text-xs text-gray-600 px-2">
                                        {page} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={page === totalPages}
                                        className="h-7 px-2"
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
