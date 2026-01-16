# 画像ビューアダイアログ実装仕様

## 概要
モバイルアプリのような直感的なジェスチャー操作で画像を拡大・縮小・移動できるダイアログコンポーネント。

## 必要なライブラリ
- `@use-gesture/react` - ジェスチャー処理
- `@radix-ui/react-dialog` - ダイアログUI（または任意のダイアログライブラリ）

## 機能要件

### 1. ピンチズーム（モバイル）
- 2本指のピンチイン/アウトで画像を拡大・縮小
- スケール範囲: 1倍（等倍）〜 5倍
- 等倍以下には縮小不可

### 2. ホイールズーム（PC）
- マウスホイールで拡大・縮小
- 上スクロール: 拡大
- 下スクロール: 縮小
- スケール範囲: 1倍 〜 5倍

### 3. ドラッグ移動
- 拡大時（scale > 1）のみドラッグで画像を移動可能
- 等倍時はドラッグ無効

### 4. 自動リセット
- ダイアログを開いた時: スケール1倍、位置を中央にリセット
- ピンチ終了時にスケールが1倍以下の場合: 位置を中央にリセット

### 5. トランジション
- 等倍時: 滑らかなトランジション（0.2秒）
- 拡大中: トランジションなし（即時反映）

---

## 実装パターン

### パターン1: カスタムフック（useImageGesture）

再利用性を重視する場合は、カスタムフックとして切り出す。

```typescript
import { useState, useRef, RefObject } from 'react'
import { useGesture } from '@use-gesture/react'

type UseImageGestureOptions = {
  minScale?: number
  maxScale?: number
  wheelSensitivity?: number
}

type UseImageGestureReturn = {
  containerRef: RefObject<HTMLDivElement>
  scale: number
  position: { x: number; y: number }
  reset: () => void
  style: {
    transform: string
    transition: string
  }
}

export function useImageGesture(
  options: UseImageGestureOptions = {}
): UseImageGestureReturn {
  const { minScale = 1, maxScale = 5, wheelSensitivity = 0.01 } = options

  const [scale, setScale] = useState(minScale)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const reset = () => {
    setScale(minScale)
    setPosition({ x: 0, y: 0 })
  }

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
```

#### フックの使用例

```tsx
function ImageViewer({ src, alt }: { src: string; alt?: string }) {
  const { containerRef, style, reset } = useImageGesture()

  useEffect(() => {
    // 画像が変わったらリセット
    reset()
  }, [src])

  return (
    <div ref={containerRef} className="size-full touch-none overflow-hidden">
      <img
        src={src}
        alt={alt}
        style={style}
        draggable={false}
        className="size-full object-contain"
      />
    </div>
  )
}
```

---

### パターン2: コンポーネント直接実装

シンプルに1つのコンポーネントとして実装する場合。

```typescript
'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useGesture } from '@use-gesture/react'

type ImageViewerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt?: string
}

export function ImageViewerDialog({
  open,
  onOpenChange,
  src,
  alt = '',
}: ImageViewerDialogProps) {
  const [scale, setScale] = React.useState(1)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = React.useState(true)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)

  // ダイアログを開いた時にリセット
  React.useEffect(() => {
    if (open) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setIsLoading(true)
    }
  }, [open])

  useGesture(
    {
      onPinch: ({ offset: [s] }) => {
        setScale(Math.min(Math.max(s, 1), 5))
      },
      onDrag: ({ offset: [x, y] }) => {
        if (scale > 1) {
          setPosition({ x, y })
        }
      },
      onPinchEnd: () => {
        if (scale <= 1) {
          setPosition({ x: 0, y: 0 })
        }
      },
      onWheel: ({ delta: [, dy] }) => {
        setScale((prev) => {
          const newScale = prev - dy * 0.01
          return Math.min(Math.max(newScale, 1), 5)
        })
      },
    },
    {
      target: containerRef,
      pinch: { scaleBounds: { min: 1, max: 5 } },
      drag: { enabled: scale > 1 },
      eventOptions: { passive: false },
    }
  )

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            closeButtonRef.current?.focus()
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            画像ビューア
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            ピンチで拡大・縮小できます
          </DialogPrimitive.Description>

          {/* 閉じるボタン */}
          <DialogPrimitive.Close
            ref={closeButtonRef}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white"
          >
            ✕
            <span className="sr-only">閉じる</span>
          </DialogPrimitive.Close>

          {/* ローディング */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white">読み込み中...</span>
            </div>
          )}

          {/* 画像 */}
          <div
            ref={containerRef}
            className="size-full touch-none overflow-hidden"
          >
            <img
              src={src}
              alt={alt}
              className="size-full object-contain"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: scale === 1 ? 'transform 0.2s ease-out' : 'none',
                visibility: isLoading ? 'hidden' : 'visible',
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
```

---

## useGesture の設定詳細

```typescript
useGesture(
  {
    onPinch: ({ offset: [s] }) => {
      // offset[0] はピンチのスケール値
      // 1〜5の範囲に制限
      setScale(Math.min(Math.max(s, 1), 5))
    },
    onDrag: ({ offset: [x, y] }) => {
      // 拡大時のみ移動を許可
      if (scale > 1) {
        setPosition({ x, y })
      }
    },
    onPinchEnd: () => {
      // 等倍以下なら位置をリセット
      if (scale <= 1) {
        setPosition({ x: 0, y: 0 })
      }
    },
    onWheel: ({ delta: [, dy] }) => {
      // delta[1] はY方向のスクロール量（下方向が正）
      setScale((prev) => {
        const newScale = prev - dy * 0.01
        return Math.min(Math.max(newScale, 1), 5)
      })
    },
  },
  {
    target: containerRef,                        // ジェスチャーを検知するDOM要素
    pinch: { scaleBounds: { min: 1, max: 5 } }, // ピンチのスケール制限
    drag: { enabled: scale > 1 },               // 拡大時のみドラッグ有効
    eventOptions: { passive: false },           // preventDefault を使用可能に
  }
)
```

---

## CSS の重要な設定

```css
/* コンテナ - 必須設定 */
.container {
  width: 100%;
  height: 100%;
  touch-action: none;  /* ブラウザのデフォルトタッチ動作を無効化（必須） */
  overflow: hidden;
}

/* 画像 */
.image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;   /* テキスト選択を防止 */
}
```

### Tailwind CSS の場合

```html
<div class="size-full touch-none overflow-hidden">
  <img class="size-full object-contain select-none" />
</div>
```

---

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| open | boolean | Yes | ダイアログの開閉状態 |
| onOpenChange | (open: boolean) => void | Yes | 開閉状態変更時のコールバック |
| src | string | Yes | 画像のURL |
| alt | string | No | 画像の代替テキスト |

---

## アクセシビリティ

- 閉じるボタンにフォーカス可能
- `sr-only`クラスでスクリーンリーダー用の説明を追加
- `aria-label`で閉じるボタンの説明
- `DialogPrimitive.Title` と `Description` を sr-only で設定

---

## 注意事項

1. **`touch-action: none` は必須** - これがないとブラウザのスクロールやズームと競合する
2. **`eventOptions: { passive: false }`** - これを設定しないと `preventDefault()` が効かない
3. **`draggable={false}`** - img に設定し、ブラウザのデフォルトドラッグを無効化
4. **ダイアログを開くたびに state をリセットする** - 前回の状態が残らないように

---

## npm パッケージ化する場合

### package.json

```json
{
  "name": "use-image-gesture",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": ">=18.0.0",
    "@use-gesture/react": ">=10.0.0"
  }
}
```

### エクスポート

```typescript
// index.ts
export { useImageGesture } from './useImageGesture'
export type { UseImageGestureOptions, UseImageGestureReturn } from './useImageGesture'
```
