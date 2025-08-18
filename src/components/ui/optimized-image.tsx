'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    priority?: boolean
    loading?: 'lazy' | 'eager'
    placeholder?: 'blur' | 'empty'
    blurDataURL?: string
    sizes?: string
    quality?: number
    onLoad?: () => void
    onError?: () => void
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    loading = 'lazy',
    placeholder = 'empty',
    blurDataURL,
    sizes = '100vw',
    quality = 75,
    onLoad,
    onError,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const handleLoad = () => {
        setIsLoading(false)
        onLoad?.()
    }

    const handleError = () => {
        setIsLoading(false)
        setHasError(true)
        onError?.()
    }

    if (hasError) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center bg-gray-100 text-gray-500',
                    className
                )}
                style={{ width, height }}
            >
                <span className="text-sm">이미지를 불러올 수 없습니다</span>
            </div>
        )
    }

    return (
        <div className={cn('relative overflow-hidden', className)}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                priority={priority}
                loading={loading}
                placeholder={placeholder}
                blurDataURL={blurDataURL}
                sizes={sizes}
                quality={quality}
                onLoad={handleLoad}
                onError={handleError}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    )
}

// 아바타 이미지용 최적화된 컴포넌트
export function AvatarImage({
    src,
    alt,
    size = 40,
    className,
}: {
    src: string
    alt: string
    size?: number
    className?: string
}) {
    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={cn('rounded-full object-cover', className)}
            sizes={`${size}px`}
            priority={true}
        />
    )
}

// 썸네일 이미지용 최적화된 컴포넌트
export function ThumbnailImage({
    src,
    alt,
    width = 200,
    height = 150,
    className,
}: {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
}) {
    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn('object-cover', className)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
    )
}
