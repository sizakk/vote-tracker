'use client'

import { Wifi, WifiOff } from 'lucide-react'

interface RealtimeStatusProps {
    isConnected: boolean
}

export default function RealtimeStatus({ isConnected }: RealtimeStatusProps) {
    return (
        <div className="flex items-center space-x-2 text-xs">
            {isConnected ? (
                <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">실시간 연결됨</span>
                </>
            ) : (
                <>
                    <WifiOff className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">연결 중...</span>
                </>
            )}
        </div>
    )
}
