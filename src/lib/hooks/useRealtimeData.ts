import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface RealtimeStatus {
    isConnected: boolean
    lastUpdate: string | null
    error: string | null
}

// 실시간 연결 상태를 관리하는 훅
export function useRealtimeData() {
    const [status, setStatus] = useState<RealtimeStatus>({
        isConnected: false,
        lastUpdate: null,
        error: null,
    })

    useEffect(() => {
        // upload_batches 테이블의 실시간 구독
        const channel = supabase
            .channel('upload_batches_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'upload_batches',
                },
                (payload) => {
                    console.log('실시간 업데이트 감지:', payload)
                    setStatus(prev => ({
                        ...prev,
                        isConnected: true,
                        lastUpdate: new Date().toISOString(),
                        error: null,
                    }))
                }
            )
            .on('presence', { event: 'sync' }, () => {
                console.log('실시간 연결 동기화')
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('실시간 연결 참여:', key, newPresences)
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('실시간 연결 퇴장:', key, leftPresences)
            })
            .subscribe((status) => {
                console.log('실시간 구독 상태:', status)
                setStatus(prev => ({
                    ...prev,
                    isConnected: status === 'SUBSCRIBED',
                    error: status === 'CHANNEL_ERROR' ? '연결 오류' : null,
                }))
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return status
}

// 실시간 데이터 무효화를 위한 유틸리티 훅
export function useRealtimeInvalidation() {
    const { isConnected, lastUpdate } = useRealtimeData()

    // 실시간 연결이 활성화되어 있고 업데이트가 있을 때 쿼리 무효화
    useEffect(() => {
        if (isConnected && lastUpdate) {
            // 여기서 필요한 쿼리들을 무효화할 수 있습니다
            // 예: queryClient.invalidateQueries(['dashboard-summary'])
        }
    }, [isConnected, lastUpdate])

    return { isConnected, lastUpdate }
}
