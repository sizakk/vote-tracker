'use client';

import { Button } from '@/components/ui/button';
import { AnalysisCategory } from '@/lib/types';

interface AnalysisButtonsProps {
    onSelectAnalysis: (category: AnalysisCategory) => void;
    selectedCategory: AnalysisCategory | null;
    disabled?: boolean;
}

const analysisCategories: { key: AnalysisCategory; label: string }[] = [
    { key: '전체기준', label: '전체기준' },
    { key: '구분별', label: '구분별' },
    { key: '대조직별', label: '대조직별' },
    { key: 'Grade별', label: 'Grade별' },
    { key: 'Grade년차별', label: 'Grade년차별' },
    { key: '입사구분별', label: '입사구분별' },
    { key: '직책별', label: '직책별' },
    { key: '나이대별', label: '나이대별' },
    { key: '근속년수별', label: '근속년수별' },
    { key: '성별별', label: '성별별' },
    { key: '미실시자현황', label: '미실시자 현황' },
];

export default function AnalysisButtons({ onSelectAnalysis, selectedCategory, disabled = false }: AnalysisButtonsProps) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {analysisCategories.map((category) => {
                    const isSelected = selectedCategory === category.key;
                    return (
                        <Button
                            key={category.key}
                            onClick={() => onSelectAnalysis(category.key)}
                            disabled={disabled}
                            className={`h-10 px-3 text-sm font-medium transition-all duration-300 ${isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:scale-105 hover:shadow-md'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{
                                borderRadius: '8px',
                                border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.1)'
                            }}
                        >
                            {category.label}
                        </Button>
                    );
                })}
            </div>

            {selectedCategory && (
                <div className="flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                    <span className="text-blue-700 font-semibold text-sm">
                        선택됨: {selectedCategory}
                    </span>
                </div>
            )}
        </div>
    );
}
