import { useState, useCallback } from 'react'
import { ERROR_CODES } from '@/lib/errors'

interface ErrorState {
    error: Error | string | null
    errorCode: string | null
    isVisible: boolean
}

export function useErrorMessage() {
    const [errorState, setErrorState] = useState<ErrorState>({
        error: null,
        errorCode: null,
        isVisible: false,
    })

    const showError = useCallback((error: Error | string, errorCode?: string) => {
        setErrorState({
            error,
            errorCode: errorCode || null,
            isVisible: true,
        })
    }, [])

    const hideError = useCallback(() => {
        setErrorState(prev => ({
            ...prev,
            isVisible: false,
        }))
    }, [])

    const clearError = useCallback(() => {
        setErrorState({
            error: null,
            errorCode: null,
            isVisible: false,
        })
    }, [])

    const showAuthError = useCallback((error: Error | string) => {
        showError(error, ERROR_CODES.AUTH_INVALID_CREDENTIALS)
    }, [showError])

    const showFileError = useCallback((error: Error | string) => {
        showError(error, ERROR_CODES.FILE_UPLOAD_FAILED)
    }, [showError])

    const showDataError = useCallback((error: Error | string) => {
        showError(error, ERROR_CODES.DATA_VALIDATION_FAILED)
    }, [showError])

    const showNetworkError = useCallback((error: Error | string) => {
        showError(error, ERROR_CODES.API_SERVICE_UNAVAILABLE)
    }, [showError])

    const showPermissionError = useCallback((error: Error | string) => {
        showError(error, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS)
    }, [showError])

    return {
        error: errorState.error,
        errorCode: errorState.errorCode,
        isVisible: errorState.isVisible,
        showError,
        hideError,
        clearError,
        showAuthError,
        showFileError,
        showDataError,
        showNetworkError,
        showPermissionError,
    }
}

// 특정 에러 타입별 훅들
export function useAuthError() {
    const { showError, hideError, clearError } = useErrorMessage()

    const showAuthError = useCallback((error: Error | string) => {
        showError(error, ERROR_CODES.AUTH_INVALID_CREDENTIALS)
    }, [showError])

    return {
        showAuthError,
        hideError,
        clearError,
    }
}

export function useFileError() {
    const { showError, hideError, clearError } = useErrorMessage()

    const showFileError = useCallback((error: Error | string) => {
        showError(error, ERROR_CODES.FILE_UPLOAD_FAILED)
    }, [showError])

    return {
        showFileError,
        hideError,
        clearError,
    }
}

export function useNetworkError() {
    const { showError, hideError, clearError } = useErrorMessage()

    const showNetworkError = useCallback((error: Error | string) => {
        showError(error, ERROR_CODES.API_SERVICE_UNAVAILABLE)
    }, [showError])

    return {
        showNetworkError,
        hideError,
        clearError,
    }
}
