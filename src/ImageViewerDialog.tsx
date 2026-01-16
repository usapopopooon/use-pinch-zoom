'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useGesture } from '@use-gesture/react'

export type ImageViewerDialogProps = {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void
  /** The image source URL */
  src: string
  /** Alt text for the image */
  alt?: string
  /** Minimum scale value (default: 1) */
  minScale?: number
  /** Maximum scale value (default: 5) */
  maxScale?: number
  /** Loading text to display while image is loading */
  loadingText?: string
  /** Title for screen readers */
  title?: string
  /** Description for screen readers */
  description?: string
  /** Close button label for screen readers */
  closeLabel?: string
}

/**
 * A dialog component for viewing images with pinch-to-zoom and drag gestures.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [open, setOpen] = useState(false)
 *
 *   return (
 *     <>
 *       <button onClick={() => setOpen(true)}>Open Image</button>
 *       <ImageViewerDialog
 *         open={open}
 *         onOpenChange={setOpen}
 *         src="/path/to/image.jpg"
 *         alt="Sample image"
 *       />
 *     </>
 *   )
 * }
 * ```
 */
export function ImageViewerDialog({
  open,
  onOpenChange,
  src,
  alt = '',
  minScale = 1,
  maxScale = 5,
  loadingText = '読み込み中...',
  title = '画像ビューア',
  description = 'ピンチで拡大・縮小できます',
  closeLabel = '閉じる',
}: ImageViewerDialogProps) {
  const [scale, setScale] = React.useState(minScale)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = React.useState(true)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setScale(minScale)
      setPosition({ x: 0, y: 0 })
      setIsLoading(true)
    }
  }, [open, minScale])

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
          const newScale = prev - dy * 0.01
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

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'black',
          }}
        />
        <DialogPrimitive.Content
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            closeButtonRef.current?.focus()
          }}
        >
          <DialogPrimitive.Title
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              borderWidth: 0,
            }}
          >
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              borderWidth: 0,
            }}
          >
            {description}
          </DialogPrimitive.Description>

          {/* Close button */}
          <DialogPrimitive.Close
            ref={closeButtonRef}
            style={{
              position: 'absolute',
              right: 16,
              top: 16,
              zIndex: 10,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: 8,
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
            <span
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: 0,
              }}
            >
              {closeLabel}
            </span>
          </DialogPrimitive.Close>

          {/* Loading indicator */}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white' }}>{loadingText}</span>
            </div>
          )}

          {/* Image container */}
          <div
            ref={containerRef}
            style={{
              width: '100%',
              height: '100%',
              touchAction: 'none',
              overflow: 'hidden',
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: scale === minScale ? 'transform 0.2s ease-out' : 'none',
                visibility: isLoading ? 'hidden' : 'visible',
                userSelect: 'none',
              }}
              draggable={false}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
