import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { Employee } from '@/lib/types'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.role || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // 샘플 파일 경로
        const sampleFilePath = path.join(process.cwd(), 'public', 'sample', '2025_08_14_1430.xlsx')

        // 파일 존재 확인
        if (!fs.existsSync(sampleFilePath)) {
            return NextResponse.json({ error: 'Sample file not found' }, { status: 404 })
        }

        // Excel 파일 읽기
        const fileBuffer = fs.readFileSync(sampleFilePath)
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

        // 첫 번째 시트 사용
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // JSON으로 변환
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

        // 헤더 제거 (첫 번째 행)
        const dataRows = jsonData.slice(1)

        // Employee 객체로 변환
        const employees: Employee[] = dataRows.map((row) => {
            const rowData = row as unknown[]

            return {
                no: Number(rowData[0]) || 0,
                employeeId: String(rowData[1] || ''),
                category: String(rowData[2] || ''),
                majorOrg: String(rowData[3] || ''),
                organization: String(rowData[4] || ''),
                name: String(rowData[5] || ''),
                grade: String(rowData[6] || ''),
                gradeYear: Number(rowData[7]) || 0,
                position: String(rowData[8] || ''),
                yearsOfService: Number(rowData[9]) || 0,
                hiringType: String(rowData[10] || ''),
                gender: String(rowData[11] || ''),
                age: Number(rowData[12]) || 0,
                isImplemented: String(rowData[13] || ''),
                implementationDate: String(rowData[14] || ''),
                agreementStatus: String(rowData[15] || ''),
                confirmationStatus: String(rowData[16] || ''),
                confirmationDate: String(rowData[17] || ''),
                agreementType: String(rowData[18] || '')
            }
        }).filter(emp => emp.employeeId && emp.name) // 유효한 데이터만 필터링

        // 기존 데이터 삭제 (선택사항)
        const { error: deleteError } = await supabase
            .from('employees')
            .delete()
            .neq('id', 0) // 모든 데이터 삭제

        if (deleteError) {
            console.error('Error deleting existing data:', deleteError)
        }

        // 업로드 배치 생성
        const { data: batch, error: batchError } = await supabase
            .from('upload_batches')
            .insert({
                uploaded_by: session.user.employeeId || 'admin',
                file_name: '2025_08_14_1430.xlsx',
                total_employees: employees.length,
                base_date: '2025-08-14',
                base_time: '14:30'
            })
            .select()
            .single()

        if (batchError) {
            console.error('Error creating upload batch:', batchError)
            return NextResponse.json({ error: 'Failed to create upload batch' }, { status: 500 })
        }

        // 직원 데이터 삽입
        const employeesWithBatch = employees.map(emp => ({
            ...emp,
            upload_batch_id: batch.id
        }))

        const { error: insertError } = await supabase
            .from('employees')
            .insert(employeesWithBatch)

        if (insertError) {
            console.error('Error inserting employees:', insertError)
            return NextResponse.json({ error: 'Failed to insert employee data' }, { status: 500 })
        }

        return NextResponse.json({
            message: 'Sample data setup completed successfully',
            totalEmployees: employees.length,
            batchId: batch.id,
            fileName: '2025_08_14_1430.xlsx',
            baseDate: '2025-08-14',
            baseTime: '14:30'
        })

    } catch (error) {
        console.error('Error setting up sample data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
