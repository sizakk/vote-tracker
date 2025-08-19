import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        console.log('=== Dashboard Summary API Called ===')

        // 최신 업로드 배치 조회 (base_date, base_time 컬럼이 없을 수 있으므로 조건부로 처리)
        console.log('Fetching latest upload batch...')

        // RLS 우회를 위해 supabaseAdmin 사용
        const client = supabaseAdmin || supabase
        console.log('Using client:', client === supabaseAdmin ? 'supabaseAdmin' : 'supabase')

        const { data: latestBatch, error: batchError } = await client
            .from('upload_batches')
            .select('id, file_name, upload_date, total_employees')
            .order('upload_date', { ascending: false })
            .limit(1)
            .single()

        console.log('Latest batch result:', { data: latestBatch, error: batchError })

        if (batchError || !latestBatch) {
            console.log('No latest batch found, returning empty data')
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

        console.log('Latest batch found:', latestBatch)

        // 최신 배치의 직원 데이터 조회 (페이지네이션으로 전체 데이터 가져오기)
        console.log('Fetching employees for batch ID:', latestBatch.id)

        // 먼저 전체 개수 확인
        const { count: totalCount } = await client
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('upload_batch_id', latestBatch.id)

        console.log('Total employee count:', totalCount)

        // 페이지네이션으로 전체 데이터 가져오기
        const pageSize = 1000
        const totalPages = Math.ceil((totalCount || 0) / pageSize)
        console.log('Total pages needed:', totalPages)

        let allEmployees: any[] = []

        for (let page = 0; page < totalPages; page++) {
            const startRange = page * pageSize
            const endRange = startRange + pageSize - 1

            console.log(`Fetching page ${page + 1}/${totalPages} (range: ${startRange}-${endRange})`)

            const { data: pageData, error: pageError } = await client
                .from('employees')
                .select('agreement_status, is_implemented')
                .eq('upload_batch_id', latestBatch.id)
                .range(startRange, endRange)

            if (pageError) {
                console.error(`Error fetching page ${page + 1}:`, pageError)
                return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
            }

            allEmployees = allEmployees.concat(pageData || [])
            console.log(`Page ${page + 1} fetched: ${pageData?.length || 0} records`)
        }

        const employees = allEmployees
        const employeesError = null

        console.log('Employees fetch result:', {
            count: employees?.length || 0,
            error: employeesError,
            sampleData: employees?.slice(0, 3)
        })

        if (employeesError) {
            console.error('Error fetching employees:', employeesError)
            return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
        }

        const totalEmployees = employees?.length || 0
        const agreedEmployees = employees?.filter(emp => emp.agreement_status === 'Y').length || 0
        const implementedEmployees = employees?.filter(emp => emp.is_implemented === true).length || 0
        const agreedImplementedEmployees = employees?.filter(emp => emp.is_implemented === true && emp.agreement_status === 'Y').length || 0

        console.log('Calculated statistics:', {
            totalEmployees,
            agreedEmployees,
            implementedEmployees,
            agreedImplementedEmployees
        })

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
                baseDate: null, // base_date 컬럼이 없으므로 null로 처리
                baseTime: null, // base_time 컬럼이 없으므로 null로 처리
                totalEmployees: latestBatch.total_employees
            }
        }

        console.log('Final response:', response)
        return NextResponse.json(response)
    } catch (error) {
        console.error('Dashboard summary error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
