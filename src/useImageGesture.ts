import { useState, useRef, useCallback, RefObject } from 'react'
import { useGesture } from '@use-gesture/react'

export type UseImageGestureOptions = {
  /** Minimum scale value (default: 1) */
  minScale?: number
  /** Maximum scale value (default: 5) */
  maxScale?: number
  /** Wheel sensitivity for zoom (default: 0.01) */
  wheelSensitivity?: number
}

export type UseImageGestureReturn = {
  /** Ref to attach to the container element */
  containerRef: RefObject<HTMLDivElement>
  /** Current scale value */
  scale: number
  /** Current position { x, y } */
  position: { x: number; y: number }
  /** Reset scale and position to initial values */
  reset: () => void
  /** Style object to apply to the target element */
  style: {
    transform: string
    transition: string
  }
}

/**
 * A hook for handling pinch-to-zoom and drag gestures on images.
 *
 * @example
 * ```tsx
 * function ImageViewer({ src }: { src: string }) {
 *   const { containerRef, style, reset } = useImageGesture()
 *
 *   return (
 *     <div ref={containerRef} className="size-full touch-none overflow-hidden">
 *       <img src={src} style={style} draggable={false} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useImageGesture(options: UseImageGestureOptions = {}): UseImageGestureReturn {
  const { minScale = 1, maxScale = 5, wheelSensitivity = 0.01 } = options

  const [scale, setScale] = useState(minScale)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const reset = useCallback(() => {
    setScale(minScale)
    setPosition({ x: 0, y: 0 })
  }, [minScale])

  useGesture(
    {
      onPinch: ({ offset: [s] }) => {
        setScale(Math.min(Math.max(s, minScale), maxScale))
      },
      onDrag: ({ offset: [x, y] }) => {
        if (scale > minScale) {
          setPosition({ x, y })
        }
      },
      onPinchEnd: () => {
        if (scale <= minScale) {
          setPosition({ x: 0, y: 0 })
        }
      },
      onWheel: ({ delta: [, dy] }) => {
        setScale((prev) => {
          const newScale = prev - dy * wheelSensitivity
          return Math.min(Math.max(newScale, minScale), maxScale)
        })
      },
    },
    {
      target: containerRef,
      pinch: { scaleBounds: { min: minScale, max: maxScale } },
      drag: { enabled: scale > minScale },
      eventOptions: { passive: false },
    }
  )

  return {
    containerRef,
    scale,
    position,
    reset,
    style: {
      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
      transition: scale === minScale ? 'transform 0.2s ease-out' : 'none',
    },
  }
}
