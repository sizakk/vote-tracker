import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = (page - 1) * limit

        // 최신 업로드 배치 조회
        const { data: latestBatch, error: batchError } = await supabase
            .from('upload_batches')
            .select('*')
            .order('upload_date', { ascending: false })
            .limit(1)
            .single()

        if (batchError || !latestBatch) {
            return NextResponse.json({
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0
            })
        }

        // 최신 배치의 비동의자 데이터 조회
        const { data: disagreedEmployees, error, count } = await supabase
            .from('employees')
            .select('*', { count: 'exact' })
            .eq('upload_batch_id', latestBatch.id)
            .eq('is_implemented', true)
            .eq('agreement_status', 'N')
            .order('employee_id', { ascending: true })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('Error fetching disagreed employees:', error)
            return NextResponse.json({ error: 'Failed to fetch disagreed employees' }, { status: 500 })
        }

        // 데이터 변환
        const transformedData = (disagreedEmployees || []).map(emp => ({
            employeeId: emp.employee_id,
            name: emp.name,
            organization: emp.organization,
            grade: emp.grade,
            position: emp.position,
            agreementStatus: emp.agreement_status,
            isImplemented: emp.is_implemented
        }))

        const response = {
            data: transformedData,
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Disagreement list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
