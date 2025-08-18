import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

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

        const { fileName, totalEmployees, baseDate, baseTime } = await request.json()

        const { data: batch, error } = await supabase
            .from('upload_batches')
            .insert({
                uploaded_by: session.user.employeeId,
                file_name: fileName,
                total_employees: totalEmployees,
                base_date: baseDate,
                base_time: baseTime
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
        }

        return NextResponse.json({ batchId: batch.id })
    } catch (error) {
        console.error('Upload batch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
