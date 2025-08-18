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

// PUT: 사용자 정보 수정
export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await checkAdminPermission(request)
    const { id } = await params

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

        // 사용자 존재 확인
        const { data: existingUser, error: checkError } = await supabase
            .from('allowed_users')
            .select('*')
            .eq('id', id)
            .single()

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                throw new AppError('사용자를 찾을 수 없습니다.', 404, ERROR_CODES.DATA_NOT_FOUND)
            }
            console.error('사용자 확인 오류:', checkError)
            throw new AppError('사용자 확인 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        // 중복 사번 확인 (자신 제외)
        const { data: duplicateUser, error: duplicateError } = await supabase
            .from('allowed_users')
            .select('id')
            .eq('employee_id', employee_id.trim())
            .neq('id', id)
            .single()

        if (duplicateError && duplicateError.code !== 'PGRST116') {
            console.error('사용자 중복 확인 오류:', duplicateError)
            throw new AppError('사용자 확인 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        if (duplicateUser) {
            throw new AppError('이미 존재하는 사번입니다.', 409, ERROR_CODES.DATA_ALREADY_EXISTS)
        }

        // 사용자 정보 수정
        const { data: updatedUser, error: updateError } = await supabase
            .from('allowed_users')
            .update({
                employee_id: employee_id.trim(),
                name: name.trim(),
                role: role,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            console.error('사용자 수정 오류:', updateError)
            throw new AppError('사용자 수정에 실패했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        // 사용자 활동 로깅
        logUserActivity('Update user', session.user?.id || '', {
            targetUserId: id,
            oldData: existingUser,
            newData: updatedUser,
            changes: {
                employee_id: existingUser.employee_id !== updatedUser.employee_id,
                name: existingUser.name !== updatedUser.name,
                role: existingUser.role !== updatedUser.role
            }
        })

        return createApiResponse(updatedUser)

    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }
        throw new AppError('사용자 수정 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
    }
})

// DELETE: 사용자 삭제
export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await checkAdminPermission(request)
    const { id } = await params

    try {
        // 사용자 존재 확인
        const { data: existingUser, error: checkError } = await supabase
            .from('allowed_users')
            .select('*')
            .eq('id', id)
            .single()

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                throw new AppError('사용자를 찾을 수 없습니다.', 404, ERROR_CODES.DATA_NOT_FOUND)
            }
            console.error('사용자 확인 오류:', checkError)
            throw new AppError('사용자 확인 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        // 자신을 삭제하려는 경우 방지
        if (existingUser.employee_id === session.user?.employee_id) {
            throw new AppError('자신의 계정은 삭제할 수 없습니다.', 400, ERROR_CODES.DATA_VALIDATION_FAILED)
        }

        // 사용자 삭제
        const { error: deleteError } = await supabase
            .from('allowed_users')
            .delete()
            .eq('id', id)

        if (deleteError) {
            console.error('사용자 삭제 오류:', deleteError)
            throw new AppError('사용자 삭제에 실패했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        // 사용자 활동 로깅
        logUserActivity('Delete user', session.user?.id || '', {
            deletedUserId: id,
            deletedUserData: existingUser
        })

        return createApiResponse({
            message: '사용자가 성공적으로 삭제되었습니다.',
            deletedUser: {
                id: existingUser.id,
                employee_id: existingUser.employee_id,
                name: existingUser.name,
                role: existingUser.role
            }
        })

    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }
        throw new AppError('사용자 삭제 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
    }
})

// GET: 특정 사용자 정보 조회
export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await checkAdminPermission(request)
    const { id } = await params

    try {
        const { data: user, error } = await supabase
            .from('allowed_users')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                throw new AppError('사용자를 찾을 수 없습니다.', 404, ERROR_CODES.DATA_NOT_FOUND)
            }
            console.error('사용자 조회 오류:', error)
            throw new AppError('사용자 조회에 실패했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
        }

        // 사용자 활동 로깅
        logUserActivity('View user details', session.user?.id || '', {
            targetUserId: id,
            targetUserEmployeeId: user.employee_id
        })

        return createApiResponse(user)

    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }
        throw new AppError('사용자 조회 중 오류가 발생했습니다.', 500, ERROR_CODES.SYSTEM_INTERNAL_ERROR)
    }
})
