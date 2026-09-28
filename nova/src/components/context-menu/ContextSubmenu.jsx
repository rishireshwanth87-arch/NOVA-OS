import React, { useRef, useLayoutEffect, useState } from 'react'

export function ContextSubmenu({ children, isOpen }) {
  const containerRef = useRef(null)
  const [style, setStyle] = useState({
    left: 'calc(100% + 4px)',
    top: '-4px',
  })

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) return

    const el = containerRef.current
    const rect = el.getBoundingClientRect()
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    const newStyle = {}

    // Horizontal placement: if overflowing right edge, flip to left side of menu
    if (rect.right > viewportW - 8) {
      newStyle.left = 'auto'
      newStyle.right = 'calc(100% + 4px)'
    } else {
      newStyle.left = 'calc(100% + 4px)'
      newStyle.right = 'auto'
    }

    // Vertical placement: adjust if overflowing bottom of screen
    if (rect.bottom > viewportH - 8) {
      const overflow = rect.bottom - (viewportH - 8)
      newStyle.top = `${-4 - overflow}px`
    } else if (rect.top < 8) {
      const underflow = 8 - rect.top
      newStyle.top = `${-4 + underflow}px`
    } else {
      newStyle.top = '-4px'
    }

    setStyle(newStyle)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      style={style}
      className="absolute z-50 min-w-[220px] max-w-[260px] w-56 p-1.5 rounded-xl nova-context-menu-surface nova-context-menu-enter select-none pointer-events-auto"
    >
      {children}
    </div>
  )
}

