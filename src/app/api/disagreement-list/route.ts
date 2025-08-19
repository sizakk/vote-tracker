import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = (page - 1) * limit

        // RLS 우회를 위해 supabaseAdmin 사용
        const client = supabaseAdmin || supabase

        // 최신 업로드 배치 조회
        const { data: latestBatch, error: batchError } = await client
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

        // 먼저 전체 비동의자 개수 확인 (실시여부='Y' AND 동의여부='N')
        const { count: totalCount } = await client
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('upload_batch_id', latestBatch.id)
            .eq('is_implemented', true)
            .eq('agreement_status', 'N')

        console.log('Disagreement list - Total disagreed employees:', totalCount)

        // 페이지네이션으로 전체 비동의자 데이터 가져오기
        const pageSize = 1000
        const totalPages = Math.ceil((totalCount || 0) / pageSize)
        console.log('Disagreement list - Total pages needed:', totalPages)

        let allDisagreedEmployees: any[] = []

        for (let page = 0; page < totalPages; page++) {
            const startRange = page * pageSize
            const endRange = startRange + pageSize - 1

            console.log(`Disagreement list - Fetching page ${page + 1}/${totalPages} (range: ${startRange}-${endRange})`)

            const { data: pageData, error: pageError } = await client
                .from('employees')
                .select('*')
                .eq('upload_batch_id', latestBatch.id)
                .eq('is_implemented', true)
                .eq('agreement_status', 'N')
                .order('employee_id', { ascending: true })
                .range(startRange, endRange)

            if (pageError) {
                console.error(`Disagreement list - Error fetching page ${page + 1}:`, pageError)
                return NextResponse.json({ error: 'Failed to fetch disagreed employees' }, { status: 500 })
            }

            allDisagreedEmployees = allDisagreedEmployees.concat(pageData || [])
            console.log(`Disagreement list - Page ${page + 1} fetched: ${pageData?.length || 0} records`)
        }

        // 페이지네이션 적용 (클라이언트 요청에 맞춰)
        const startIndex = offset
        const endIndex = offset + limit
        const disagreedEmployees = allDisagreedEmployees.slice(startIndex, endIndex)
        const count = totalCount

        // 데이터 변환
        const transformedData = (disagreedEmployees || []).map(emp => ({
            employeeId: emp.employee_id,
            name: emp.name,
            majorOrg: emp.major_org, // organization 대신 major_org 사용
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
