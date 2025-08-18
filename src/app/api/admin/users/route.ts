import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { withErrorHandler, createApiResponse, createApiErrorResponse } from '@/lib/api-error-handler'
import {
    AppError,
    ERROR_CODES,
    validateRequiredFields,
    logUserActivity,
    logSecurityEvent
} from '@/lib/errors'

// 관리자 권한 확인 함수
async function checkAdminPermission(request: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session) {
        throw new AppError('로그인이 필요합니다.', 401, ERROR_CODES.AUTH_INVALID_CREDENTIALS)
    }

    if (session.user?.role !== 'admin') {
        logSecurityEvent('Unauthorized access attempt to admin API', {
            userId: session.user?.id,
            userRole: session.user?.role,
            endpoint: request.url,
            method: request.method
        })
        throw new AppError('관리자 권한이 필요합니다.', 403, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS)
    }

    return session
}

// GET: 사용자 목록 조회
export const GET = withErrorHandler(async (request: NextRequest) => {
    const session = await checkAdminPermission(request)

    try {
        // URL 파라미터에서 검색 및 필터 옵션 추출
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const role = searchParams.get('role') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        // 기본 쿼리 구성
        let query = supabase
            .from('allowed_users')
            .select('*', { count: 'exact' })

        // 검색 필터 적용
        if (search) {
            query = query.or(`employee_id.ilike.%${search}%,name.ilike.%${search}%`)
        }

        // 역할 필터 적용
        if (role && role !== 'all') {
            query = query.eq('role', role)
        }

        // 페이지네이션 적용
        query = query.range(offset, offset + limit - 1)
        query = query.order('created_at', { ascending: false })

        const { data: users, error, count } = await query

        if (error) {
            console.error('사용자 목록 조회 오류:', error)
            throw new AppError('사용자 목록을 불러오는데 실패했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        // 사용자 활동 로깅
        logUserActivity('View user list', session.user?.id || '', {
            search,
            role,
            page,
            limit,
            totalCount: count
        })

        return createApiResponse({
            users: users || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        })

    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }
        throw new AppError('사용자 목록 조회 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
    }
})

// POST: 새 사용자 추가
export const POST = withErrorHandler(async (request: NextRequest) => {
    const session = await checkAdminPermission(request)

    try {
        const body = await request.json()

        // 필수 필드 검증
        validateRequiredFields(body, ['employee_id', 'name', 'role'])

        const { employee_id, name, role } = body

        // 입력 데이터 검증
        if (!employee_id.trim()) {
            throw new AppError('사번은 필수입니다.', 400, ERROR_CODES.DATA_VALIDATION_FAILED)
        }

        if (!name.trim()) {
            throw new AppError('이름은 필수입니다.', 400, ERROR_CODES.DATA_VALIDATION_FAILED)
        }

        if (!['admin', 'user'].includes(role)) {
            throw new AppError('유효하지 않은 역할입니다.', 400, ERROR_CODES.DATA_VALIDATION_FAILED)
        }

        // 중복 사번 확인
        const { data: existingUser, error: checkError } = await supabase
            .from('allowed_users')
            .select('id')
            .eq('employee_id', employee_id.trim())
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('사용자 중복 확인 오류:', checkError)
            throw new AppError('사용자 확인 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        if (existingUser) {
            throw new AppError('이미 존재하는 사번입니다.', 409, ERROR_CODES.DATA_ALREADY_EXISTS)
        }

        // 새 사용자 추가
        const { data: newUser, error: insertError } = await supabase
            .from('allowed_users')
            .insert({
                employee_id: employee_id.trim(),
                name: name.trim(),
                role: role
            })
            .select()
            .single()

        if (insertError) {
            console.error('사용자 추가 오류:', insertError)
            throw new AppError('사용자 추가에 실패했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        // 사용자 활동 로깅
        logUserActivity('Add new user', session.user?.id || '', {
            newUserId: newUser.id,
            newUserEmployeeId: newUser.employee_id,
            newUserRole: newUser.role
        })

        return createApiResponse(newUser, 201)

    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }
        throw new AppError('사용자 추가 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
    }
})
