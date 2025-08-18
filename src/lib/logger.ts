// 서버 사이드에서만 Winston 로거 사용
interface Logger {
    error: (message: string, error?: Error, context?: unknown) => void
    warn: (message: string, context?: unknown) => void
    info: (message: string, context?: unknown) => void
    debug: (message: string, context?: unknown) => void
    http: (message: string, context?: unknown) => void
}

let logger: Logger
let httpLogger: Logger
let errorLogger: Logger

// 서버 사이드에서만 Winston 초기화
if (typeof window === 'undefined') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const winston = require('winston')
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require('path')

        // 로그 레벨 정의
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            http: 3,
            debug: 4,
        }

        // 로그 색상 정의
        const colors = {
            error: 'red',
            warn: 'yellow',
            info: 'green',
            http: 'magenta',
            debug: 'white',
        }

        winston.addColors(colors)

        // 로그 포맷 정의
        const logFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(
                (info: { timestamp: string; level: string; message: string }) =>
                    `${info.timestamp} ${info.level}: ${info.message}`
            )
        )

        // 파일 로그 포맷 (색상 제거)
        const fileLogFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            winston.format.printf(
                (info: { timestamp: string; level: string; message: string }) =>
                    `${info.timestamp} ${info.level}: ${info.message}`
            )
        )

        // 로그 디렉토리 생성
        const logDir = path.join(process.cwd(), 'logs')

        // 메인 로거
        logger = winston.createLogger({
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
            levels,
            format: logFormat,
            transports: [
                // 에러 로그 파일
                new winston.transports.File({
                    filename: path.join(logDir, 'error.log'),
                    level: 'error',
                    format: fileLogFormat,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                // 전체 로그 파일
                new winston.transports.File({
                    filename: path.join(logDir, 'combined.log'),
                    format: fileLogFormat,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                // 개발 환경에서만 콘솔 출력
                ...(process.env.NODE_ENV === 'development'
                    ? [
                        new winston.transports.Console({
                            format: logFormat,
                        }),
                    ]
                    : []),
            ],
        })

        // HTTP 로거
        httpLogger = winston.createLogger({
            level: 'http',
            levels,
            format: fileLogFormat,
            transports: [
                new winston.transports.File({
                    filename: path.join(logDir, 'http.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
        })

        // 에러 전용 로거
        errorLogger = winston.createLogger({
            level: 'error',
            levels,
            format: fileLogFormat,
            transports: [
                new winston.transports.File({
                    filename: path.join(logDir, 'error.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
        })

    } catch (error) {
        // Winston 로드 실패 시 기본 콘솔 로거 사용
        console.warn('Winston 로거 초기화 실패, 기본 콘솔 로거 사용:', error)

        const consoleLogger: Logger = {
            error: (message: string, error?: Error, context?: unknown) => {
                console.error(`[ERROR] ${message}`, error, context)
            },
            warn: (message: string, context?: unknown) => {
                console.warn(`[WARN] ${message}`, context)
            },
            info: (message: string, context?: unknown) => {
                console.info(`[INFO] ${message}`, context)
            },
            debug: (message: string, context?: unknown) => {
                console.debug(`[DEBUG] ${message}`, context)
            },
            http: (message: string, context?: unknown) => {
                console.log(`[HTTP] ${message}`, context)
            }
        }

        logger = consoleLogger
        httpLogger = consoleLogger
        errorLogger = consoleLogger
    }
} else {
    // 클라이언트 사이드에서는 console 기반 로거 사용
    const consoleLogger: Logger = {
        error: (message: string, error?: Error, context?: unknown) => {
            console.error(`[ERROR] ${message}`, error, context)
        },
        warn: (message: string, context?: unknown) => {
            console.warn(`[WARN] ${message}`, context)
        },
        info: (message: string, context?: unknown) => {
            console.info(`[INFO] ${message}`, context)
        },
        debug: (message: string, context?: unknown) => {
            console.debug(`[DEBUG] ${message}`, context)
        },
        http: (message: string, context?: unknown) => {
            console.log(`[HTTP] ${message}`, context)
        }
    }

    logger = consoleLogger
    httpLogger = consoleLogger
    errorLogger = consoleLogger
}

// 로깅 유틸리티 함수들
export function logError(message: string, error?: Error, context?: unknown) {
    if (typeof window === 'undefined') {
        logger.error(message, error, context)
    } else {
        console.error(`[ERROR] ${message}`, error, context)
    }
}

export function logWarn(message: string, context?: unknown) {
    if (typeof window === 'undefined') {
        logger.warn(message, context)
    } else {
        console.warn(`[WARN] ${message}`, context)
    }
}

export function logInfo(message: string, context?: unknown) {
    if (typeof window === 'undefined') {
        logger.info(message, context)
    } else {
        console.info(`[INFO] ${message}`, context)
    }
}

export function logDebug(message: string, context?: unknown) {
    if (typeof window === 'undefined') {
        logger.debug(message, context)
    } else {
        console.debug(`[DEBUG] ${message}`, context)
    }
}

export function logHttp(message: string, context?: unknown) {
    if (typeof window === 'undefined') {
        httpLogger.http(message, context)
    } else {
        console.log(`[HTTP] ${message}`, context)
    }
}

export function logSecurityEvent(event: string, userId?: string, details?: unknown) {
    const securityMessage = `SECURITY: ${event}${userId ? ` | User: ${userId}` : ''}`
    if (typeof window === 'undefined') {
        logger.warn(securityMessage, details)
    } else {
        console.warn(`[SECURITY] ${securityMessage}`, details)
    }
}

export function logUserActivity(activity: string, userId?: string, details?: unknown) {
    const activityMessage = `USER_ACTIVITY: ${activity}${userId ? ` | User: ${userId}` : ''}`
    if (typeof window === 'undefined') {
        logger.info(activityMessage, details)
    } else {
        console.info(`[USER_ACTIVITY] ${activityMessage}`, details)
    }
}

export function logDatabaseQuery(query: string, params?: unknown, duration?: number) {
    const queryMessage = `DB_QUERY: ${query}${duration ? ` | Duration: ${duration}ms` : ''}`
    if (typeof window === 'undefined') {
        logger.debug(queryMessage, params)
    } else {
        console.debug(`[DB_QUERY] ${queryMessage}`, params)
    }
}

export function logApiRequest(method: string, url: string, statusCode?: number, duration?: number) {
    const requestMessage = `API_REQUEST: ${method} ${url}${statusCode ? ` | Status: ${statusCode}` : ''}${duration ? ` | Duration: ${duration}ms` : ''}`
    if (typeof window === 'undefined') {
        httpLogger.http(requestMessage)
    } else {
        console.log(`[API_REQUEST] ${requestMessage}`)
    }
}

export function logFileOperation(operation: string, filename: string, details?: unknown) {
    const fileMessage = `FILE_OPERATION: ${operation} | File: ${filename}`
    if (typeof window === 'undefined') {
        logger.info(fileMessage, details)
    } else {
        console.info(`[FILE_OPERATION] ${fileMessage}`, details)
    }
}

// 기본 로거 인스턴스들 export
export { logger, httpLogger, errorLogger }
