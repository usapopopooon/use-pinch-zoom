import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { useImageGesture } from './useImageGesture'

function ImageViewer({
  src,
  alt,
  minScale,
  maxScale,
}: {
  src: string
  alt?: string
  minScale?: number
  maxScale?: number
}) {
  const { containerRef, style, scale, reset } = useImageGesture({
    minScale,
    maxScale,
  })

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <span
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 14,
          }}
        >
          Scale: {scale.toFixed(2)}x
        </span>
        <button
          onClick={reset}
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
          overflow: 'hidden',
          background: '#1a1a1a',
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            ...style,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </div>
    </div>
  )
}

const meta: Meta<typeof ImageViewer> = {
  title: 'Hooks/useImageGesture',
  component: ImageViewer,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    minScale: {
      control: { type: 'range', min: 0.5, max: 2, step: 0.1 },
    },
    maxScale: {
      control: { type: 'range', min: 2, max: 10, step: 0.5 },
    },
  },
}

export default meta
type Story = StoryObj<typeof ImageViewer>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Sample image',
    minScale: 1,
    maxScale: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initial scale should be 1.00x
    const scaleDisplay = canvas.getByText(/Scale: 1\.00x/)
    await expect(scaleDisplay).toBeInTheDocument()

    // Reset button should be visible
    const resetButton = canvas.getByRole('button', { name: 'Reset' })
    await expect(resetButton).toBeInTheDocument()

    // Image should be visible
    const image = canvas.getByRole('img', { name: 'Sample image' })
    await expect(image).toBeInTheDocument()
  },
}

export const CustomScaleRange: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Sample image with custom scale',
    minScale: 0.5,
    maxScale: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initial scale should be 0.50x (minScale)
    const scaleDisplay = canvas.getByText(/Scale: 0\.50x/)
    await expect(scaleDisplay).toBeInTheDocument()
  },
}

export const ResetButtonTest: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Reset test image',
    minScale: 1,
    maxScale: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click reset button
    const resetButton = canvas.getByRole('button', { name: 'Reset' })
    await userEvent.click(resetButton)

    // Scale should remain at 1.00x after reset
    const scaleDisplay = canvas.getByText(/Scale: 1\.00x/)
    await expect(scaleDisplay).toBeInTheDocument()
  },
}

export const WheelZoomTest: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Wheel zoom test image',
    minScale: 1,
    maxScale: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Get the container element
    const container = canvasElement.querySelector('[style*="touch-action: none"]') as HTMLElement

    if (container) {
      // Simulate wheel scroll to zoom in
      await container.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -100,
          bubbles: true,
        })
      )

      // Wait for state update
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Image should still be visible
    const image = canvas.getByRole('img', { name: 'Wheel zoom test image' })
    await expect(image).toBeInTheDocument()
  },
}
