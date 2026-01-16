import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useImageGesture } from './useImageGesture'

describe('useImageGesture', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useImageGesture())

    expect(result.current.scale).toBe(1)
    expect(result.current.position).toEqual({ x: 0, y: 0 })
  })

  it('should initialize with custom minScale', () => {
    const { result } = renderHook(() => useImageGesture({ minScale: 0.5 }))

    expect(result.current.scale).toBe(0.5)
  })

  it('should reset scale and position', () => {
    const { result } = renderHook(() => useImageGesture())

    act(() => {
      result.current.reset()
    })

    expect(result.current.scale).toBe(1)
    expect(result.current.position).toEqual({ x: 0, y: 0 })
  })

  it('should return correct transform style', () => {
    const { result } = renderHook(() => useImageGesture())

    expect(result.current.style.transform).toBe('translate(0px, 0px) scale(1)')
  })

  it('should have transition when at minScale', () => {
    const { result } = renderHook(() => useImageGesture())

    expect(result.current.style.transition).toBe('transform 0.2s ease-out')
  })

  it('should provide a containerRef', () => {
    const { result } = renderHook(() => useImageGesture())

    expect(result.current.containerRef).toBeDefined()
    expect(result.current.containerRef.current).toBeNull()
  })
})
