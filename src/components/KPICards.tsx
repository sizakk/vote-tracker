'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface KPICardsProps {
    overallAgreementRate: number;
    implementedAgreementRate: number;
    totalEmployees: number;
    agreedEmployees: number;
    implementedEmployees: number;
    agreedImplementedEmployees: number;
    isLoading?: boolean;
    lastUpdated?: string;
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

// 숫자 애니메이션 컴포넌트
const AnimatedNumber = React.memo(function AnimatedNumber({
    value,
    className = "",
    duration = 1000
}: {
    value: number;
    className?: string;
    duration?: number;
}) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (displayValue !== value) {
            setIsAnimating(true);
            const startValue = displayValue;
            const endValue = value;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // 이징 함수 (부드러운 시작과 끝)
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);

                setDisplayValue(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setIsAnimating(false);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [value, displayValue, duration]);

    return (
        <span className={`${className} ${isAnimating ? 'text-blue-600' : ''}`}>
            {displayValue.toLocaleString()}
        </span>
    );
});

// 퍼센트 애니메이션 컴포넌트
const AnimatedPercentage = React.memo(function AnimatedPercentage({
    value,
    className = "",
    duration = 1000
}: {
    value: number;
    className?: string;
    duration?: number;
}) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (Math.abs(displayValue - value) > 0.1) {
            setIsAnimating(true);
            const startValue = displayValue;
            const endValue = value;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // 이징 함수 (부드러운 시작과 끝)
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = startValue + (endValue - startValue) * easeOutQuart;

                setDisplayValue(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setIsAnimating(false);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [value, displayValue, duration]);

    return (
        <span className={`${className} ${isAnimating ? 'text-blue-600' : ''}`}>
            {displayValue.toFixed(1)}%
        </span>
    );
});

const KPICards = React.memo(function KPICards({
    overallAgreementRate,
    implementedAgreementRate,
    totalEmployees,
    agreedEmployees,
    implementedEmployees,
    agreedImplementedEmployees,
    isLoading = false,
    lastUpdated
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

    // 로딩 스켈레톤 컴포넌트
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[1, 2].map((i) => (
                <Card key={i} className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                            <div className="space-y-3">
                                <div className="text-center">
                                    <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
                                </div>
                                <div className="space-y-1.5">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="space-y-4">
            {/* 실시간 업데이트 상태 표시 */}
            {lastUpdated && (
                <div className="flex items-center justify-center text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    <span>실시간 업데이트 중... 마지막 업데이트: {lastUpdated}</span>
                </div>
            )}

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
                                    <AnimatedPercentage
                                        value={overallAgreementRate}
                                        className="text-3xl font-bold text-gray-900"
                                    />
                                </div>
                                <div className="text-sm text-gray-600">
                                    <AnimatedNumber value={agreedEmployees} /> / <AnimatedNumber value={totalEmployees} />명
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200">
                                    <span className="text-green-700 font-medium text-sm">동의</span>
                                    <span className="text-green-700 font-bold text-sm">
                                        <AnimatedNumber value={agreedEmployees} />명
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                                    <span className="text-red-700 font-medium text-sm">비동의</span>
                                    <span className="text-red-700 font-bold text-sm">
                                        <AnimatedNumber value={disagreedImplementedEmployees} />명
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200">
                                    <span className="text-gray-700 font-medium text-sm">미실시</span>
                                    <span className="text-gray-700 font-bold text-sm">
                                        <AnimatedNumber value={notImplementedEmployees} />명
                                    </span>
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
                                    <AnimatedPercentage
                                        value={implementedAgreementRate}
                                        className="text-3xl font-bold text-gray-900"
                                    />
                                </div>
                                <div className="text-sm text-gray-600">
                                    <AnimatedNumber value={agreedImplementedEmployees} /> / <AnimatedNumber value={implementedEmployees} />명
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200">
                                    <span className="text-blue-700 font-medium text-sm">동의</span>
                                    <span className="text-blue-700 font-bold text-sm">
                                        <AnimatedNumber value={agreedImplementedEmployees} />명
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-200">
                                    <span className="text-red-700 font-medium text-sm">비동의</span>
                                    <span className="text-red-700 font-bold text-sm">
                                        <AnimatedNumber value={disagreedImplementedEmployees} />명
                                    </span>
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
