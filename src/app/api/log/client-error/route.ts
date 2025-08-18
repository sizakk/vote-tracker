import { NextRequest, NextResponse } from 'next/server'
import { logError } from '@/lib/logger'
import { withErrorHandler } from '@/lib/api-error-handler'

export const POST = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json()

    const {
        message,
        error,
        stack,
        context,
        url,
        userAgent,
    } = body

    // 클라이언트 에러 로깅
    logError('Client Error', new Error(error || message), {
        message,
        stack,
        context,
        url,
        userAgent,
        source: 'client',
        timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
})
