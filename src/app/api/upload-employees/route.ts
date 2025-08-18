import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Employee } from '@/lib/types'

export async function POST(request: NextRequest) {
    try {
        // 인증 확인
        const session = await getServerSession(authOptions)
        if (!session?.user?.employeeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 관리자만 직원 데이터 업로드 가능
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const { employees, batchId }: { employees: Employee[], batchId: string } = await request.json()

        // 데이터 변환
        const transformedEmployees = employees.map(emp => ({
            employee_id: emp.employeeId,
            category: emp.category,
            major_org: emp.majorOrg,
            organization: emp.organization,
            name: emp.name,
            grade: emp.grade,
            grade_year: emp.gradeYear,
            position: emp.position,
            years_of_service: emp.yearsOfService,
            hiring_type: emp.hiringType,
            gender: emp.gender,
            age: emp.age,
            is_implemented: emp.isImplemented === 'Y',
            implemented_date: emp.implementedDate,
            agreement_status: emp.agreementStatus,
            is_confirmed: emp.isConfirmed === 'Y',
            confirmed_date: emp.confirmedDate,
            final_agreement: emp.finalAgreement,
            upload_batch_id: batchId
        }))

        // 배치로 데이터 삽입
        const { error } = await supabase
            .from('employees')
            .insert(transformedEmployees)

        if (error) {
            console.error('Error uploading employees:', error)
            return NextResponse.json({ error: 'Failed to upload employees' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            uploadedCount: employees.length
        })
    } catch (error) {
        console.error('Upload employees error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
