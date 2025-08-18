// 서버 사이드에서만 Winston 로거 사용
let logger: any
let httpLogger: any
let errorLogger: any

// 서버 사이드에서만 Winston 초기화
if (typeof window === 'undefined') {
    const winston = require('winston')
    const path = require('path')

    // 로그 레벨 정의
    const levels = {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    }

    // 로그 레벨별 색상 정의
    const colors = {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    }

    winston.addColors(colors)

    // 로그 포맷 정의
    const format = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(
            (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
    )

    // 파일 로그 포맷 (색상 없음)
    const fileFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
    )

    // 로그 디렉토리 생성
    const logDir = path.join(process.cwd(), 'logs')

    // Winston 로거 설정
    logger = winston.createLogger({
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        levels,
        format: fileFormat,
        transports: [
            // 에러 로그 파일
            new winston.transports.File({
                filename: path.join(logDir, 'error.log'),
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),

            // 모든 로그 파일
            new winston.transports.File({
                filename: path.join(logDir, 'combined.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),

            // HTTP 요청 로그 파일
            new winston.transports.File({
                filename: path.join(logDir, 'http.log'),
                level: 'http',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),
        ],
    })

    // 개발 환경에서는 콘솔에도 출력
    if (process.env.NODE_ENV === 'development') {
        logger.add(new winston.transports.Console({
            format,
        }))
    }

    // HTTP 요청 로거
    httpLogger = winston.createLogger({
        level: 'http',
        format: fileFormat,
        transports: [
            new winston.transports.File({
                filename: path.join(logDir, 'http.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),
        ],
    })

    // 에러 로거
    errorLogger = winston.createLogger({
        level: 'error',
        format: fileFormat,
        transports: [
            new winston.transports.File({
                filename: path.join(logDir, 'error.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),
        ],
    })
} else {
    // 클라이언트 사이드에서는 console 기반 로거 사용
    logger = {
        error: (message: string, error?: Error, context?: any) => {
            console.error(`[ERROR] ${message}`, error, context)
        },
        warn: (message: string, context?: any) => {
            console.warn(`[WARN] ${message}`, context)
        },
        info: (message: string, context?: any) => {
            console.info(`[INFO] ${message}`, context)
        },
        debug: (message: string, context?: any) => {
            console.debug(`[DEBUG] ${message}`, context)
        },
        http: (message: string, context?: any) => {
            console.log(`[HTTP] ${message}`, context)
        }
    }

    httpLogger = logger
    errorLogger = logger
}

// 로깅 유틸리티 함수들
export function logError(message: string, error?: Error, context?: any) {
    if (typeof window === 'undefined') {
        logger.error(message, error, context)
    } else {
        console.error(`[ERROR] ${message}`, error, context)
    }
}

export function logWarn(message: string, context?: any) {
    if (typeof window === 'undefined') {
        logger.warn(message, context)
    } else {
        console.warn(`[WARN] ${message}`, context)
    }
}

export function logInfo(message: string, context?: any) {
    if (typeof window === 'undefined') {
        logger.info(message, context)
    } else {
        console.info(`[INFO] ${message}`, context)
    }
}

export function logDebug(message: string, context?: any) {
    if (typeof window === 'undefined') {
        logger.debug(message, context)
    } else {
        console.debug(`[DEBUG] ${message}`, context)
    }
}

export function logHttp(message: string, context?: any) {
    if (typeof window === 'undefined') {
        logger.http(message, context)
    } else {
        console.log(`[HTTP] ${message}`, context)
    }
}

// API 요청 로깅
export function logApiRequest(req: any, res: any, next?: any) {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
        }

        if (res.statusCode >= 400) {
            logError(`API Request Failed`, undefined, logData)
        } else {
            logInfo(`API Request`, logData)
        }
    })

    if (next) next()
}

// 데이터베이스 쿼리 로깅
export function logDatabaseQuery(query: string, params?: any, duration?: number) {
    logDebug('Database Query', { query, params, duration: duration ? `${duration}ms` : undefined })
}

// 파일 업로드 로깅
export function logFileUpload(fileName: string, fileSize: number, userId?: string) {
    logInfo('File Upload', { fileName, fileSize: `${fileSize} bytes`, userId })
}

// 사용자 활동 로깅
export function logUserActivity(action: string, userId: string, details?: any) {
    logInfo('User Activity', { action, userId, details })
}

// 시스템 이벤트 로깅
export function logSystemEvent(event: string, details?: any) {
    logInfo('System Event', { event, details })
}

// 성능 로깅
export function logPerformance(operation: string, duration: number, details?: any) {
    logInfo('Performance', { operation, duration: `${duration}ms`, details })
}

// 보안 이벤트 로깅
export function logSecurityEvent(event: string, details?: any) {
    logWarn('Security Event', { event, details })
}

// 클라이언트 사이드 로거
export const clientLogger = {
    error: (message: string, error?: Error, context?: any) => {
        console.error('CLIENT ERROR:', {
            message,
            error: error?.message,
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
        })

        // 서버로 에러 로그 전송 (선택적)
        if (typeof window !== 'undefined') {
            fetch('/api/log/client-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    error: error?.message,
                    stack: error?.stack,
                    context,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                }),
            }).catch(() => { })
        }
    },

    warn: (message: string, context?: any) => {
        console.warn('CLIENT WARN:', {
            message,
            context,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
        })
    },

    info: (message: string, context?: any) => {
        console.info('CLIENT INFO:', {
            message,
            context,
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
        })
    },

    debug: (message: string, context?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug('CLIENT DEBUG:', {
                message,
                context,
                timestamp: new Date().toISOString(),
                url: typeof window !== 'undefined' ? window.location.href : undefined,
            })
        }
    }
}

export default logger
