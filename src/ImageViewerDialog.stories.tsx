import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { useState } from 'react'
import { ImageViewerDialog } from './ImageViewerDialog'

function ImageViewerDialogDemo(
  props: Omit<React.ComponentProps<typeof ImageViewerDialog>, 'open' | 'onOpenChange'>
) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 24px',
          fontSize: 16,
          cursor: 'pointer',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: 8,
        }}
      >
        Open Image Viewer
      </button>
      <ImageViewerDialog {...props} open={open} onOpenChange={setOpen} />
    </div>
  )
}

const meta: Meta<typeof ImageViewerDialogDemo> = {
  title: 'Components/ImageViewerDialog',
  component: ImageViewerDialogDemo,
  parameters: {
    layout: 'centered',
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
type Story = StoryObj<typeof ImageViewerDialogDemo>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/1200/800',
    alt: 'Sample image',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open button should be visible
    const openButton = canvas.getByRole('button', { name: 'Open Image Viewer' })
    await expect(openButton).toBeInTheDocument()

    // Click to open dialog
    await userEvent.click(openButton)

    // Wait for dialog to open and check for close button
    await waitFor(async () => {
      const body = within(document.body)
      const closeButton = body.getByRole('button', { name: /閉じる/ })
      await expect(closeButton).toBeInTheDocument()
    })

    // Close the dialog
    const body = within(document.body)
    const closeButton = body.getByRole('button', { name: /閉じる/ })
    await userEvent.click(closeButton)
  },
}

export const WithCustomScale: Story = {
  args: {
    src: 'https://picsum.photos/1200/800',
    alt: 'Sample image with custom scale',
    minScale: 0.5,
    maxScale: 10,
  },
}

export const WithCustomLabels: Story = {
  args: {
    src: 'https://picsum.photos/1200/800',
    alt: 'Sample image',
    title: 'Image Preview',
    description: 'Use pinch or scroll to zoom in/out',
    loadingText: 'Loading...',
    closeLabel: 'Close',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click to open dialog
    const openButton = canvas.getByRole('button', { name: 'Open Image Viewer' })
    await userEvent.click(openButton)

    // Wait for dialog to open
    await waitFor(async () => {
      const body = within(document.body)
      // Custom close label should be used
      const closeButton = body.getByRole('button', { name: /Close/ })
      await expect(closeButton).toBeInTheDocument()
    })

    // Close the dialog
    const body = within(document.body)
    const closeButton = body.getByRole('button', { name: /Close/ })
    await userEvent.click(closeButton)
  },
}
