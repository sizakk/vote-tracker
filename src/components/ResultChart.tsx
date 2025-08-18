'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AnalysisResult, AnalysisCategory } from '@/lib/types';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ResultChartProps {
    data: AnalysisResult[];
    category: AnalysisCategory;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: AnalysisResult }>;
    label?: string;
}

const CustomTooltip = React.memo(function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
                <p className="font-bold text-gray-900 mb-2">{data.name}</p>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-green-600">동의:</span>
                        <span className="font-bold">{data.agreed}명</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-red-600">비동의:</span>
                        <span className="font-bold">{data.disagreed}명</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between">
                        <span className="font-semibold">총 인원:</span>
                        <span className="font-bold">{data.total}명</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between">
                        <span className="font-semibold text-blue-600">동의율:</span>
                        <span className="font-bold text-blue-600">{data.agreementRate}%</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
});

const NotImplementedTooltip = React.memo(function NotImplementedTooltip({ active, payload, label }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
                <p className="font-bold text-gray-900 mb-2">{data.name}</p>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">미실시:</span>
                        <span className="font-bold">{data.notImplemented}명</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between">
                        <span className="font-semibold">총 인원:</span>
                        <span className="font-bold">{data.total}명</span>
                    </div>
                    <div className="border-t pt-1 flex justify-between">
                        <span className="font-semibold text-gray-600">미실시율:</span>
                        <span className="font-bold text-gray-600">{data.agreementRate}%</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
});

const ResultChart = React.memo(function ResultChart({ data, category }: ResultChartProps) {
    const isNotImplemented = category === '미실시자현황';

    // 차트 데이터 준비
    const chartData = data.map(item => {
        if (isNotImplemented) {
            return {
                name: item.name,
                미실시: item.notImplemented,
                미실시율: item.agreementRate
            };
        } else {
            return {
                name: item.name,
                동의: item.agreed,
                비동의: item.disagreed,
                동의율: item.agreementRate
            };
        }
    });

    return (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    {category} 분석 결과
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 50,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                label={{
                                    value: '인원 수',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle', fontSize: 12, fill: '#374151' }
                                }}
                            />
                            <Tooltip content={isNotImplemented ? <NotImplementedTooltip /> : <CustomTooltip />} />
                            <Legend
                                verticalAlign="top"
                                height={30}
                                formatter={(value) => (
                                    <span className="text-xs font-medium">{value}</span>
                                )}
                            />
                            {isNotImplemented ? (
                                <Bar
                                    dataKey="미실시"
                                    fill="#6b7280"
                                    radius={[4, 4, 0, 0]}
                                    name="미실시"
                                />
                            ) : (
                                <>
                                    <Bar
                                        dataKey="동의"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                        name="동의"
                                    />
                                    <Bar
                                        dataKey="비동의"
                                        fill="#ef4444"
                                        radius={[4, 4, 0, 0]}
                                        name="비동의"
                                    />
                                </>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 요약 통계 */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {isNotImplemented ? (
                        <>
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span className="font-semibold text-gray-700 text-sm">총 미실시</span>
                                </div>
                                <div className="text-xl font-bold text-gray-600">
                                    {data.reduce((sum, item) => sum + item.notImplemented, 0)}명
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-semibold text-blue-700 text-sm">총 인원</span>
                                </div>
                                <div className="text-xl font-bold text-blue-600">
                                    {data.reduce((sum, item) => sum + item.total, 0)}명
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="font-semibold text-purple-700 text-sm">평균 미실시율</span>
                                </div>
                                <div className="text-xl font-bold text-purple-600">
                                    {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.agreementRate, 0) / data.length * 10) / 10 : 0}%
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="font-semibold text-green-700 text-sm">총 동의</span>
                                </div>
                                <div className="text-xl font-bold text-green-600">
                                    {data.reduce((sum, item) => sum + item.agreed, 0)}명
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="font-semibold text-red-700 text-sm">총 비동의</span>
                                </div>
                                <div className="text-xl font-bold text-red-600">
                                    {data.reduce((sum, item) => sum + item.disagreed, 0)}명
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-semibold text-blue-700 text-sm">평균 동의율</span>
                                </div>
                                <div className="text-xl font-bold text-blue-600">
                                    {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.agreementRate, 0) / data.length * 10) / 10 : 0}%
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

export default ResultChart;
