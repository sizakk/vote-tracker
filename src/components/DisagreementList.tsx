'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Users, AlertTriangle } from 'lucide-react';
import { Employee } from '@/lib/types';

interface DisagreementListProps {
    employees: Employee[];
}

export default function DisagreementList({ employees }: DisagreementListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 비동의자 필터링: 실시여부가 Y이면서 동의여부가 N인 사람만
    const disagreedEmployees = employees.filter(emp =>
        emp.isImplemented === 'Y' && emp.agreementStatus === 'N'
    );
    const totalPages = Math.ceil(disagreedEmployees.length / itemsPerPage);

    // 현재 페이지의 데이터
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEmployees = disagreedEmployees.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    if (disagreedEmployees.length === 0) {
        return (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">비동의자가 없습니다</h3>
                        <p className="text-gray-600">실시 대상 중 비동의한 직원이 없습니다.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-orange-600">
                        <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    비동의자 목록 ({disagreedEmployees.length}명)
                </CardTitle>
                <p className="text-xs text-gray-600 mt-1">
                    실시 대상 중 비동의한 직원 목록입니다.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="font-bold text-gray-900 w-12 text-xs">No.</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">사번</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">성명</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">구분</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">대조직</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">조직</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">Grade</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">직책</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">성별</TableHead>
                                <TableHead className="font-bold text-gray-900 text-xs">나이</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentEmployees.map((employee, index) => (
                                <TableRow
                                    key={employee.employeeId}
                                    className="hover:bg-gray-50/50 transition-colors duration-200"
                                >
                                    <TableCell className="font-medium text-gray-900 text-xs">
                                        {startIndex + index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium text-blue-600 text-xs">
                                        {employee.employeeId}
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900 text-xs">
                                        {employee.name}
                                    </TableCell>
                                    <TableCell className="text-gray-700 text-xs">
                                        {employee.category}
                                    </TableCell>
                                    <TableCell className="text-gray-700 text-xs">
                                        {employee.majorOrg}
                                    </TableCell>
                                    <TableCell className="text-gray-700 max-w-xs truncate text-xs">
                                        {employee.organization}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900 text-xs">
                                        {employee.grade}
                                    </TableCell>
                                    <TableCell className="text-gray-700 text-xs">
                                        {employee.position}
                                    </TableCell>
                                    <TableCell className="text-gray-700 text-xs">
                                        {employee.gender}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900 text-xs">
                                        {employee.age}세
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex items-center justify-between p-4 bg-gray-50/50 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                        {startIndex + 1} - {Math.min(endIndex, disagreedEmployees.length)} / {disagreedEmployees.length}명
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="bg-white border-gray-300 hover:bg-gray-50 h-8 px-2"
                        >
                            <ChevronLeft className="h-3 w-3" />
                            이전
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageClick(pageNum)}
                                        className={`w-8 h-8 text-xs ${currentPage === pageNum
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="bg-white border-gray-300 hover:bg-gray-50 h-8 px-2"
                        >
                            다음
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
