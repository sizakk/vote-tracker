import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Employee } from '@/lib/types'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.employeeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 관리자만 파일 업로드 가능
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const { employees, fileName, baseDate, baseTime } = await request.json()

        if (!employees || !Array.isArray(employees) || employees.length === 0) {
            return NextResponse.json({ error: 'No employee data provided' }, { status: 400 })
        }

        // 기존 데이터 삭제
        const { error: deleteError } = await supabase
            .from('employees')
            .delete()
            .neq('id', 0) // 모든 데이터 삭제

        if (deleteError) {
            console.error('Delete existing data error:', deleteError)
            return NextResponse.json({ error: 'Failed to clear existing data' }, { status: 500 })
        }

        // 새로운 업로드 배치 생성
        const { data: batch, error: batchError } = await supabase
            .from('upload_batches')
            .insert({
                uploaded_by: session.user.employeeId,
                file_name: fileName,
                total_employees: employees.length,
                base_date: baseDate,
                base_time: baseTime
            })
            .select()
            .single()

        if (batchError) {
            console.error('Create batch error:', batchError)
            return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
        }

        // 직원 데이터 삽입
        const employeeData = employees.map((emp: Employee) => ({
            upload_batch_id: batch.id,
            employee_id: emp.employeeId,
            name: emp.name,
            category: emp.category,
            major_org: emp.majorOrg,
            grade: emp.grade,
            grade_year: emp.gradeYear,
            hiring_type: emp.hiringType,
            position: emp.position,
            age: emp.age,
            years_of_service: emp.yearsOfService,
            gender: emp.gender,
            is_implemented: emp.isImplemented,
            agreement_status: emp.agreementStatus
        }))

        const { error: insertError } = await supabase
            .from('employees')
            .insert(employeeData)

        if (insertError) {
            console.error('Insert employees error:', insertError)
            return NextResponse.json({ error: 'Failed to insert employee data' }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true,
            uploadBatchId: batch.id,
            message: `${employees.length}명의 데이터가 성공적으로 업로드되었습니다.`
        })
    } catch (error) {
        console.error('Upload batch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
