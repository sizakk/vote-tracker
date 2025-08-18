'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

interface KPICardsProps {
    overallAgreementRate: number;
    implementedAgreementRate: number;
    totalEmployees: number;
    agreedEmployees: number;
    implementedEmployees: number;
    agreedImplementedEmployees: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}

const CustomTooltip = React.memo(function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
                <p className="font-bold text-gray-900">{`${label}: ${payload[0].value}명`}</p>
            </div>
        );
    }
    return null;
});

const KPICards = React.memo(function KPICards({
    overallAgreementRate,
    implementedAgreementRate,
    totalEmployees,
    agreedEmployees,
    implementedEmployees,
    agreedImplementedEmployees
}: KPICardsProps) {

    // 수정된 집계 기준에 따른 계산
    const notImplementedEmployees = totalEmployees - implementedEmployees; // 실시여부가 'N'인 경우
    const disagreedImplementedEmployees = implementedEmployees - agreedImplementedEmployees; // 실시여부가 'Y'이면서 동의여부가 'N'인 경우

    const overallData = React.useMemo(() => [
        { name: '동의', value: agreedEmployees, color: '#10b981' },
        { name: '비동의', value: disagreedImplementedEmployees, color: '#ef4444' },
        { name: '미실시', value: notImplementedEmployees, color: '#6b7280' }
    ], [agreedEmployees, disagreedImplementedEmployees, notImplementedEmployees]);

    const implementedData = React.useMemo(() => [
        { name: '동의', value: agreedImplementedEmployees, color: '#3b82f6' },
        { name: '비동의', value: disagreedImplementedEmployees, color: '#ef4444' }
    ], [agreedImplementedEmployees, disagreedImplementedEmployees]);

    return (
        <div className="space-y-4">
            {/* 전체 동의율 카드 */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            }}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        전체 동의율
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        {/* 차트 */}
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={overallData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={50}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {overallData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={24}
                                        formatter={(value) => (
                                            <span className="text-xs font-medium">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 수치 정보 */}
                        <div className="space-y-3">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {overallAgreementRate.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600">
                                    {agreedEmployees} / {totalEmployees}명
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200">
                                    <span className="text-green-700 font-medium text-sm">동의</span>
                                    <span className="text-green-700 font-bold text-sm">{agreedEmployees}명</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                                    <span className="text-red-700 font-medium text-sm">비동의</span>
                                    <span className="text-red-700 font-bold text-sm">{disagreedImplementedEmployees}명</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200">
                                    <span className="text-gray-700 font-medium text-sm">미실시</span>
                                    <span className="text-gray-700 font-bold text-sm">{notImplementedEmployees}명</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 진행인원 중 동의율 카드 */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            }}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                        진행인원 중 동의율
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        {/* 차트 */}
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={implementedData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={50}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {implementedData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={24}
                                        formatter={(value) => (
                                            <span className="text-xs font-medium">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 수치 정보 */}
                        <div className="space-y-3">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {implementedAgreementRate.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600">
                                    {agreedImplementedEmployees} / {implementedEmployees}명
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200">
                                    <span className="text-blue-700 font-medium text-sm">동의</span>
                                    <span className="text-blue-700 font-bold text-sm">{agreedImplementedEmployees}명</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                                    <span className="text-red-700 font-medium text-sm">비동의</span>
                                    <span className="text-red-700 font-bold text-sm">{disagreedImplementedEmployees}명</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

export default KPICards;
