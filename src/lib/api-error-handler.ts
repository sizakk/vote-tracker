import { NextRequest, NextResponse } from 'next/server'
import {
    AppError,
    createErrorResponse,
    logger,
    generateRequestId,
    ERROR_CODES
} from './errors'

// API 에러 처리 미들웨어
export function withErrorHandler<T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
        const requestId = generateRequestId()
        const startTime = Date.now()

        try {
            // 요청 로깅
            logger.info('API Request', {
                method: request.method,
                url: request.url,
                requestId,
                userAgent: request.headers.get('user-agent'),
            })

            const response = await handler(request, ...args)

            // 응답 로깅
            const duration = Date.now() - startTime
            logger.info('API Response', {
                method: request.method,
                url: request.url,
                statusCode: response.status,
                duration: `${duration}ms`,
                requestId,
            })

            // 요청 ID를 헤더에 추가
            response.headers.set('X-Request-ID', requestId)

            return response

        } catch (error) {
            const duration = Date.now() - startTime

            // 에러 로깅
            logger.error(error as Error, {
                method: request.method,
                url: request.url,
                duration: `${duration}ms`,
                requestId,
                userAgent: request.headers.get('user-agent'),
            })

            // 에러 응답 생성
            const errorResponse = createErrorResponse(
                error as Error,
                request.url,
                requestId
            )

            // 에러 응답 로깅
            logger.error(new Error('API Error Response'), {
                ...errorResponse.error,
                requestId,
            })

            return NextResponse.json(
                errorResponse,
                { status: errorResponse.error.statusCode }
            )
        }
    }
}

// 특정 에러 타입에 대한 처리 함수
export function handleDatabaseError(error: any): AppError {
    if (error?.code === 'PGRST116') {
        return new AppError(
            '데이터베이스 쿼리 오류가 발생했습니다.',
            500,
            ERROR_CODES.DATA_INVALID_FORMAT
        )
    }

    if (error?.code === '23505') { // Unique constraint violation
        return new AppError(
            '이미 존재하는 데이터입니다.',
            409,
            ERROR_CODES.DATA_ALREADY_EXISTS
        )
    }

    if (error?.code === '23503') { // Foreign key constraint violation
        return new AppError(
            '관련 데이터가 존재하지 않습니다.',
            400,
            ERROR_CODES.DATA_NOT_FOUND
        )
    }

    return new AppError(
        '데이터베이스 오류가 발생했습니다.',
        500,
        ERROR_CODES.SYSTEM_INTERNAL_ERROR
    )
}

export function handleValidationError(error: any): AppError {
    if (error?.message?.includes('validation')) {
        return new AppError(
            '입력 데이터가 올바르지 않습니다.',
            400,
            ERROR_CODES.DATA_VALIDATION_FAILED
        )
    }

    return new AppError(
        '데이터 검증 오류가 발생했습니다.',
        400,
        ERROR_CODES.DATA_VALIDATION_FAILED
    )
}

export function handleFileError(error: any): AppError {
    if (error?.code === 'LIMIT_FILE_SIZE') {
        return new AppError(
            '파일 크기가 너무 큽니다.',
            400,
            ERROR_CODES.FILE_TOO_LARGE
        )
    }

    if (error?.code === 'INVALID_FILE_TYPE') {
        return new AppError(
            '지원하지 않는 파일 형식입니다.',
            400,
            ERROR_CODES.FILE_INVALID_FORMAT
        )
    }

    return new AppError(
        '파일 처리 중 오류가 발생했습니다.',
        500,
        ERROR_CODES.FILE_UPLOAD_FAILED
    )
}

// API 응답 래퍼
export function createApiResponse<T>(
    data: T,
    statusCode: number = 200,
    requestId?: string
): NextResponse {
    const response = NextResponse.json({
        data,
        success: true,
        timestamp: new Date().toISOString(),
        requestId,
    }, { status: statusCode })

    if (requestId) {
        response.headers.set('X-Request-ID', requestId)
    }

    return response
}

// 에러 응답 래퍼
export function createApiErrorResponse(
    error: AppError | Error,
    requestId?: string
): NextResponse {
    const errorResponse = createErrorResponse(error, undefined, requestId)

    const response = NextResponse.json(
        errorResponse,
        { status: errorResponse.error.statusCode }
    )

    if (requestId) {
        response.headers.set('X-Request-ID', requestId)
    }

    return response
}

// 요청 검증 유틸리티
export function validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[]
): void {
    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
        throw new AppError(
            `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
            400,
            ERROR_CODES.DATA_VALIDATION_FAILED
        )
    }
}

export function validateFileType(
    fileName: string,
    allowedTypes: string[]
): void {
    const fileExtension = fileName.split('.').pop()?.toLowerCase()

    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        throw new AppError(
            `지원하지 않는 파일 형식입니다. 허용된 형식: ${allowedTypes.join(', ')}`,
            400,
            ERROR_CODES.FILE_INVALID_FORMAT
        )
    }
}

export function validateFileSize(
    fileSize: number,
    maxSizeInBytes: number
): void {
    if (fileSize > maxSizeInBytes) {
        const maxSizeInMB = Math.round(maxSizeInBytes / (1024 * 1024))
        throw new AppError(
            `파일 크기가 너무 큽니다. 최대 크기: ${maxSizeInMB}MB`,
            400,
            ERROR_CODES.FILE_TOO_LARGE
        )
    }
}
