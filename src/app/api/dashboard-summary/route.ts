import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        // 최신 업로드 배치 조회 (필요한 컬럼만 선택)
        const { data: latestBatch, error: batchError } = await supabase
            .from('upload_batches')
            .select('id, file_name, upload_date, base_date, base_time, total_employees')
            .order('upload_date', { ascending: false })
            .limit(1)
            .single()

        if (batchError || !latestBatch) {
            return NextResponse.json({
                totalEmployees: 0,
                agreedEmployees: 0,
                implementedEmployees: 0,
                agreedImplementedEmployees: 0,
                overallAgreementRate: 0,
                implementedAgreementRate: 0,
                lastUpdated: new Date().toISOString(),
                latestUploadInfo: null
            })
        }

        // 최신 배치의 직원 데이터 조회 (필요한 컬럼만 선택)
        const { data: employees, error: employeesError } = await supabase
            .from('employees')
            .select('agreement_status, is_implemented')
            .eq('upload_batch_id', latestBatch.id)

        if (employeesError) {
            console.error('Error fetching employees:', employeesError)
            return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
        }

        const totalEmployees = employees?.length || 0
        const agreedEmployees = employees?.filter(emp => emp.agreement_status === 'Y').length || 0
        const implementedEmployees = employees?.filter(emp => emp.is_implemented === true).length || 0
        const agreedImplementedEmployees = employees?.filter(emp => emp.is_implemented === true && emp.agreement_status === 'Y').length || 0

        const overallAgreementRate = totalEmployees > 0 ? (agreedEmployees / totalEmployees) * 100 : 0
        const implementedAgreementRate = implementedEmployees > 0 ? (agreedImplementedEmployees / implementedEmployees) * 100 : 0

        const response = {
            totalEmployees,
            agreedEmployees,
            implementedEmployees,
            agreedImplementedEmployees,
            overallAgreementRate: Math.round(overallAgreementRate * 10) / 10,
            implementedAgreementRate: Math.round(implementedAgreementRate * 10) / 10,
            lastUpdated: new Date().toISOString(),
            latestUploadInfo: {
                fileName: latestBatch.file_name,
                uploadDate: latestBatch.upload_date,
                baseDate: latestBatch.base_date,
                baseTime: latestBatch.base_time,
                totalEmployees: latestBatch.total_employees
            }
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Dashboard summary error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
