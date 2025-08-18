// 커스텀 에러 클래스들
export class AppError extends Error {
    public readonly statusCode: number
    public readonly isOperational: boolean
    public readonly code?: string

    constructor(
        message: string,
        statusCode: number = 500,
        code?: string,
        isOperational: boolean = true
    ) {
        super(message)
        this.statusCode = statusCode
        this.code = code
        this.isOperational = isOperational

        Error.captureStackTrace(this, this.constructor)
    }
}

export class ValidationError extends AppError {
    constructor(message: string, code?: string) {
        super(message, 400, code)
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = '인증이 필요합니다', code?: string) {
        super(message, 401, code)
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = '권한이 없습니다', code?: string) {
        super(message, 403, code)
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = '리소스를 찾을 수 없습니다', code?: string) {
        super(message, 404, code)
    }
}

export class ConflictError extends AppError {
    constructor(message: string = '리소스 충돌이 발생했습니다', code?: string) {
        super(message, 409, code)
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = '데이터베이스 오류가 발생했습니다', code?: string) {
        super(message, 500, code)
    }
}

export class ExternalServiceError extends AppError {
    constructor(message: string = '외부 서비스 오류가 발생했습니다', code?: string) {
        super(message, 502, code)
    }
}

// 에러 타입 정의
export interface ErrorResponse {
    error: {
        message: string
        code?: string
        statusCode: number
        timestamp: string
        path?: string
        requestId?: string
    }
}

export interface ClientError {
    message: string
    code?: string
    statusCode: number
    timestamp: string
    path?: string
}

// 에러 코드 상수
export const ERROR_CODES = {
    // 인증 관련
    AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
    AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

    // 데이터 관련
    DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    DATA_ALREADY_EXISTS: 'DATA_ALREADY_EXISTS',
    DATA_INVALID_FORMAT: 'DATA_INVALID_FORMAT',

    // 파일 관련
    FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
    FILE_INVALID_FORMAT: 'FILE_INVALID_FORMAT',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',

    // API 관련
    API_RATE_LIMIT_EXCEEDED: 'API_RATE_LIMIT_EXCEEDED',
    API_SERVICE_UNAVAILABLE: 'API_SERVICE_UNAVAILABLE',
    API_TIMEOUT: 'API_TIMEOUT',

    // 시스템 관련
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
    SYSTEM_INTERNAL_ERROR: 'SYSTEM_INTERNAL_ERROR',
    SYSTEM_CONFIGURATION_ERROR: 'SYSTEM_CONFIGURATION_ERROR',
} as const

// 사용자 친화적인 에러 메시지
export const USER_FRIENDLY_MESSAGES = {
    [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: '사번 또는 비밀번호가 올바르지 않습니다.',
    [ERROR_CODES.AUTH_SESSION_EXPIRED]: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
    [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: '이 기능을 사용할 권한이 없습니다.',

    [ERROR_CODES.DATA_VALIDATION_FAILED]: '입력한 정보가 올바르지 않습니다.',
    [ERROR_CODES.DATA_NOT_FOUND]: '요청한 정보를 찾을 수 없습니다.',
    [ERROR_CODES.DATA_ALREADY_EXISTS]: '이미 존재하는 정보입니다.',
    [ERROR_CODES.DATA_INVALID_FORMAT]: '데이터 형식이 올바르지 않습니다.',

    [ERROR_CODES.FILE_UPLOAD_FAILED]: '파일 업로드에 실패했습니다.',
    [ERROR_CODES.FILE_INVALID_FORMAT]: '지원하지 않는 파일 형식입니다.',
    [ERROR_CODES.FILE_TOO_LARGE]: '파일 크기가 너무 큽니다.',

    [ERROR_CODES.API_RATE_LIMIT_EXCEEDED]: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    [ERROR_CODES.API_SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다.',
    [ERROR_CODES.API_TIMEOUT]: '요청 시간이 초과되었습니다.',

    [ERROR_CODES.SYSTEM_MAINTENANCE]: '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.',
    [ERROR_CODES.SYSTEM_INTERNAL_ERROR]: '시스템 오류가 발생했습니다. 관리자에게 문의해주세요.',
    [ERROR_CODES.SYSTEM_CONFIGURATION_ERROR]: '시스템 설정 오류가 발생했습니다.',
} as const

// 에러 유틸리티 함수들
export function createErrorResponse(
    error: AppError | Error,
    path?: string,
    requestId?: string
): ErrorResponse {
    const appError = error instanceof AppError ? error : new AppError(error.message)

    return {
        error: {
            message: getUserFriendlyMessage(appError.code) || appError.message,
            code: appError.code,
            statusCode: appError.statusCode,
            timestamp: new Date().toISOString(),
            path,
            requestId,
        }
    }
}

export function getUserFriendlyMessage(code?: string): string | undefined {
    if (!code) return undefined
    return USER_FRIENDLY_MESSAGES[code as keyof typeof USER_FRIENDLY_MESSAGES]
}

export function isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
        return error.isOperational
    }
    return false
}

export function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

// 사용자 활동 로깅 (서버 사이드에서만 Winston 로거 사용)
export function logUserActivity(action: string, userId: string, details?: any) {
    if (typeof window === 'undefined') {
        // 서버 사이드에서만 Winston 로거 사용
        logger.info('User Activity', {
            action,
            userId,
            details,
            timestamp: new Date().toISOString(),
        })
    } else {
        // 클라이언트 사이드에서는 console.log 사용
        console.log('User Activity:', { action, userId, details, timestamp: new Date().toISOString() })
    }
}

// 보안 이벤트 로깅 (서버 사이드에서만 Winston 로거 사용)
export function logSecurityEvent(event: string, details?: any) {
    if (typeof window === 'undefined') {
        // 서버 사이드에서만 Winston 로거 사용
        logger.warn('Security Event', {
            event,
            details,
            timestamp: new Date().toISOString(),
        })
    } else {
        // 클라이언트 사이드에서는 console.warn 사용
        console.warn('Security Event:', { event, details, timestamp: new Date().toISOString() })
    }
}

// 에러 로깅 인터페이스
export interface ErrorLogger {
    error(error: Error, context?: Record<string, any>): void
    warn(message: string, context?: Record<string, any>): void
    info(message: string, context?: Record<string, any>): void
    debug(message: string, context?: Record<string, any>): void
}

// Winston 로거와 통합
import { logError, logWarn, logInfo, logDebug } from './logger'

// Winston 기반 로거 (서버 사이드에서만 Winston 사용)
export class WinstonLogger implements ErrorLogger {
    error(error: Error, context?: Record<string, any>): void {
        if (typeof window === 'undefined') {
            logError('Application Error', error, context)
        } else {
            console.error('Application Error:', error, context)
        }
    }

    warn(message: string, context?: Record<string, any>): void {
        if (typeof window === 'undefined') {
            logWarn(message, context)
        } else {
            console.warn(message, context)
        }
    }

    info(message: string, context?: Record<string, any>): void {
        if (typeof window === 'undefined') {
            logInfo(message, context)
        } else {
            console.info(message, context)
        }
    }

    debug(message: string, context?: Record<string, any>): void {
        if (typeof window === 'undefined') {
            logDebug(message, context)
        } else {
            console.debug(message, context)
        }
    }
}

// 전역 로거 인스턴스
export const logger = new WinstonLogger()
