import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { Employee } from '@/lib/types'

export async function POST(request: NextRequest) {
    console.log('=== Upload Batch API Called ===')

    try {
        const session = await getServerSession(authOptions)
        console.log('Session:', session ? { employeeId: session.user?.employeeId, role: session.user?.role } : 'No session')

        if (!session?.user?.employeeId) {
            console.log('Unauthorized: No session or employeeId')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 관리자만 파일 업로드 가능
        if (session.user.role !== 'admin') {
            console.log('Forbidden: User role is not admin', session.user.role)
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const requestBody = await request.json()
        console.log('Request body received:', {
            employeesCount: requestBody.employees?.length || 0,
            fileName: requestBody.fileName,
            baseDate: requestBody.baseDate,
            baseTime: requestBody.baseTime
        })

        const { employees, fileName, baseDate, baseTime } = requestBody

        if (!employees || !Array.isArray(employees) || employees.length === 0) {
            console.log('Bad request: No employee data provided')
            return NextResponse.json({ error: 'No employee data provided' }, { status: 400 })
        }

        console.log('Starting database operations...')

        // 기존 데이터 삭제
        console.log('Deleting existing data...')
        const client = supabaseAdmin || supabase
        const { error: deleteError } = await client
            .from('employees')
            .delete()
            .neq('id', 0) // 모든 데이터 삭제

        if (deleteError) {
            console.error('Delete existing data error:', deleteError)
            return NextResponse.json({ error: 'Failed to clear existing data' }, { status: 500 })
        }
        console.log('Existing data deleted successfully')

        // 새로운 업로드 배치 생성
        console.log('Creating new upload batch...')

        // 데이터베이스 스키마에 따라 조건부로 필드 추가
        const batchData = {
            uploaded_by: session.user.employeeId,
            file_name: fileName,
            total_employees: employees.length
        }

        let batch: { id: string } | null = null

        // base_date와 base_time이 있는 경우에만 추가 (데이터베이스 스키마에 따라)
        try {
            // supabaseAdmin이 없으면 일반 supabase 클라이언트 사용
            const client = supabaseAdmin || supabase

            const { data: batchWithDate, error: batchError } = await client
                .from('upload_batches')
                .insert({
                    ...batchData,
                    base_date: baseDate,
                    base_time: baseTime
                })
                .select()
                .single()

            if (batchError) {
                console.log('Failed with base_date/base_time, trying without them...')
                // base_date와 base_time이 없는 경우 다시 시도
                const { data: batchWithoutDate, error: batchError2 } = await client
                    .from('upload_batches')
                    .insert(batchData)
                    .select()
                    .single()

                if (batchError2) {
                    console.error('Create batch error:', batchError2)
                    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
                }

                console.log('Upload batch created successfully (without base_date/base_time):', batchWithoutDate.id)
                batch = batchWithoutDate
            } else {
                console.log('Upload batch created successfully (with base_date/base_time):', batchWithDate.id)
                batch = batchWithDate
            }
        } catch (error) {
            console.error('Create batch error:', error)
            return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
        }

        if (!batch) {
            console.error('Failed to create batch')
            return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
        }

        // Excel 날짜 변환 함수
        const convertExcelDateToTimestamp = (excelDate: string | number): string | null => {
            if (!excelDate || excelDate === '' || excelDate === 0) {
                return null;
            }

            // Excel 날짜가 숫자인 경우 (시리얼 날짜)
            const dateValue = typeof excelDate === 'string' ? parseFloat(excelDate) : excelDate;

            if (isNaN(dateValue) || dateValue <= 0) {
                return null;
            }

            // Excel 시리얼 날짜를 JavaScript Date로 변환
            // Excel은 1900년 1월 1일을 1로 시작하지만, 1900년을 윤년으로 잘못 처리
            // 따라서 1900년 1월 1일부터 계산하고 2일을 빼야 함
            const excelEpoch = new Date(1900, 0, 1);
            const jsDate = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);

            // 유효한 날짜인지 확인
            if (isNaN(jsDate.getTime())) {
                return null;
            }

            // PostgreSQL 형식으로 반환 (YYYY-MM-DD)
            return jsDate.toISOString().split('T')[0];
        }

        // 직원 데이터 준비
        console.log('Preparing employee data for insertion...')
        const employeeData = employees.map(employee => ({
            upload_batch_id: batch.id,
            employee_id: employee.employeeId,
            name: employee.name,
            category: employee.category,
            major_org: employee.majorOrg,
            grade: employee.grade,
            grade_year: employee.gradeYear,
            position: employee.position,
            years_of_service: employee.yearsOfService,
            hiring_type: employee.hiringType,
            gender: employee.gender,
            age: employee.age,
            is_implemented: employee.isImplemented === 'Y',
            implemented_date: convertExcelDateToTimestamp(employee.implementationDate),
            agreement_status: employee.agreementStatus,
            is_confirmed: employee.confirmationStatus === 'Y',
            confirmed_date: convertExcelDateToTimestamp(employee.confirmationDate),
            final_agreement: employee.agreementType || null
        }))
        console.log('Employee data prepared. Sample data:', employeeData.slice(0, 2))
        console.log('Total employees to insert:', employeeData.length)

        // 직원 데이터 삽입
        console.log('Inserting employee data...')
        const { data: insertedEmployees, error: insertError } = await client
            .from('employees')
            .insert(employeeData)
            .select('id, employee_id, name, agreement_status, is_implemented, upload_batch_id')

        if (insertError) {
            console.error('Employee insert error:', insertError)
            return NextResponse.json({ error: 'Failed to insert employee data' }, { status: 500 })
        }

        console.log('Employee data inserted successfully. Inserted count:', insertedEmployees?.length || 0)
        console.log('Sample inserted employee:', insertedEmployees?.[0])

        const response = {
            success: true,
            uploadBatchId: batch.id,
            message: `${employees.length}명의 데이터가 성공적으로 업로드되었습니다.`
        }
        console.log('Upload completed successfully:', response)
        return NextResponse.json(response)

    } catch (error) {
        console.error('Upload batch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
