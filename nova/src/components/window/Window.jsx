import React, { useRef, useState, useEffect } from 'react'
import {
  Minus,
  Square,
  Copy,
  X,
  Folder,
  Terminal,
  FileText,
  Calculator,
  Calendar,
  Settings,
  Activity,
  Compass,
  AppWindow,
} from 'lucide-react'
import { useWindowStore } from '../../stores/windowStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { appRegistry } from '../../core/app-registry/appRegistry'

const ICON_MAP = {
  Folder,
  Terminal,
  Calendar,
  FileText,
  Calculator,
  Settings,
  Activity,
  Compass,
}

import { ErrorBoundary } from './ErrorBoundary'

export function Window({ window: win, children }) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    moveWindow,
    resizeWindow,
    snapWindow,
  } = useWindowStore()

  const registeredApp = appRegistry.get(win.appId)
  const AppComponent = registeredApp?.component
  const IconComponent = ICON_MAP[win.iconName] || AppWindow

  const isDragging = useRef(false)
  const isResizing = useRef(false)
  const resizeDirection = useRef('')
  const dragOffset = useRef({ x: 0, y: 0 })
  const initialResizeState = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const [currentPos, setCurrentPos] = useState({ x: win.x, y: win.y })
  const [currentSize, setCurrentSize] = useState({ width: win.width, height: win.height })
  const [snapPreview, setSnapPreview] = useState(null) // null | 'left' | 'right' | 'top' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  useEffect(() => {
    setCurrentPos({ x: win.x, y: win.y })
  }, [win.x, win.y])

  useEffect(() => {
    setCurrentSize({ width: win.width, height: win.height })
  }, [win.width, win.height])

  // Keyboard Window Snap Control (Alt + Arrows or Meta + Arrows)
  useEffect(() => {
    if (!win.focused) return

    const handleKeyDown = (e) => {
      if (e.altKey || e.metaKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          snapWindow(win.id, 'left')
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          snapWindow(win.id, 'right')
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          snapWindow(win.id, 'maximized')
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          if (win.snapState && win.snapState !== 'normal') {
            snapWindow(win.id, 'normal')
          } else {
            minimizeWindow(win.id)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [win.focused, win.id, win.snapState, snapWindow, minimizeWindow])

  // if (win.minimized) return null

  // Titlebar dragging & snap preview calculation
  const handleTitlePointerDown = (e) => {
    if (e.target.closest('button')) return

    focusWindow(win.id)
    isDragging.current = true
    dragOffset.current = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    }

    const handlePointerMove = (moveEvt) => {
      if (!isDragging.current) return

      const clientX = moveEvt.clientX
      const clientY = moveEvt.clientY
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      // Check snap preview regions
      let snapRegion = null
      const threshold = 20

      if (clientX < threshold && clientY < 60) {
        snapRegion = 'top-left'
      } else if (clientX < threshold && clientY > viewportH - 100) {
        snapRegion = 'bottom-left'
      } else if (clientX < threshold) {
        snapRegion = 'left'
      } else if (clientX > viewportW - threshold && clientY < 60) {
        snapRegion = 'top-right'
      } else if (clientX > viewportW - threshold && clientY > viewportH - 100) {
        snapRegion = 'bottom-right'
      } else if (clientX > viewportW - threshold) {
        snapRegion = 'right'
      } else if (clientY < 42) {
        snapRegion = 'maximized'
      }

      setSnapPreview(snapRegion)

      const maxX = viewportW - 100
      const maxY = viewportH - 80
      const newX = Math.max(0, Math.min(moveEvt.clientX - dragOffset.current.x, maxX))
      const newY = Math.max(36, Math.min(moveEvt.clientY - dragOffset.current.y, maxY))

      setCurrentPos({ x: newX, y: newY })
    }

    const handlePointerUp = (upEvt) => {
      if (!isDragging.current) return
      isDragging.current = false
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)

      const clientX = upEvt.clientX
      const clientY = upEvt.clientY
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight
      const threshold = 20

      let finalSnap = null
      if (clientX < threshold && clientY < 60) finalSnap = 'top-left'
      else if (clientX < threshold && clientY > viewportH - 100) finalSnap = 'bottom-left'
      else if (clientX < threshold) finalSnap = 'left'
      else if (clientX > viewportW - threshold && clientY < 60) finalSnap = 'top-right'
      else if (clientX > viewportW - threshold && clientY > viewportH - 100) finalSnap = 'bottom-right'
      else if (clientX > viewportW - threshold) finalSnap = 'right'
      else if (clientY < 42) finalSnap = 'maximized'

      setSnapPreview(null)

      if (finalSnap) {
        snapWindow(win.id, finalSnap)
      } else {
        const maxX = viewportW - 100
        const maxY = viewportH - 80
        const finalX = Math.max(0, Math.min(upEvt.clientX - dragOffset.current.x, maxX))
        const finalY = Math.max(36, Math.min(upEvt.clientY - dragOffset.current.y, maxY))
        moveWindow(win.id, finalX, finalY)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleResizePointerDown = (e, direction) => {
    e.preventDefault()
    e.stopPropagation()
    focusWindow(win.id)

    isResizing.current = true
    resizeDirection.current = direction
    initialResizeState.current = {
      x: currentPos.x,
      y: currentPos.y,
      width: currentSize.width,
      height: currentSize.height,
      startX: e.clientX,
      startY: e.clientY,
    }

    const handlePointerMove = (moveEvt) => {
      if (!isResizing.current) return
      const dx = moveEvt.clientX - initialResizeState.current.startX
      const dy = moveEvt.clientY - initialResizeState.current.startY
      const { x, y, width, height } = initialResizeState.current

      let newW = width
      let newH = height
      let newX = x
      let newY = y

      if (direction.includes('e')) newW = Math.max(win.minWidth, width + dx)
      if (direction.includes('s')) newH = Math.max(win.minHeight, height + dy)
      if (direction.includes('w')) {
        const potentialW = width - dx
        if (potentialW >= win.minWidth) {
          newW = potentialW
          newX = x + dx
        }
      }
      if (direction.includes('n')) {
        const potentialH = height - dy
        if (potentialH >= win.minHeight && y + dy >= 36) {
          newH = potentialH
          newY = y + dy
        }
      }

      setCurrentSize({ width: newW, height: newH })
      setCurrentPos({ x: newX, y: newY })
    }

    const handlePointerUp = () => {
      if (!isResizing.current) return
      isResizing.current = false
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      resizeWindow(win.id, currentSize.width, currentSize.height)
      moveWindow(win.id, currentPos.x, currentPos.y)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleTitleDoubleClick = (e) => {
    if (e.target.closest('button')) return
    toggleMaximizeWindow(win.id)
  }

  // Calculate Snapped Layout Styles
  const getWindowStyle = () => {
    const availH = 'calc(100vh - 36px - 70px)'
    const halfH = 'calc((100vh - 36px - 70px) / 2)'
    const dockAutoHide = useSettingsStore.getState().dockAutoHide
    const dockPosition = useSettingsStore.getState().dockPosition

    let style = {}
    switch (win.snapState) {
      case 'left':
        style = { top: '36px', left: '0px', width: '50vw', height: availH, zIndex: win.zIndex, borderRadius: 0 }
        break
      case 'right':
        style = { top: '36px', left: '50vw', width: '50vw', height: availH, zIndex: win.zIndex, borderRadius: 0 }
        break
      case 'top':
        style = { top: '36px', left: '0px', width: '100vw', height: halfH, zIndex: win.zIndex, borderRadius: 0 }
        break
      case 'top-left':
        style = { top: '36px', left: '0px', width: '50vw', height: halfH, zIndex: win.zIndex, borderRadius: 0 }
        break
      case 'top-right':
        style = { top: '36px', left: '50vw', width: '50vw', height: halfH, zIndex: win.zIndex, borderRadius: 0 }
        break
      case 'bottom-left':
        style = { top: `calc(36px + ${halfH})`, left: '0px', width: '50vw', height: halfH, zIndex: win.zIndex, borderRadius: 0 }
        break
      case 'bottom-right':
        style = { top: `calc(36px + ${halfH})`, left: '50vw', width: '50vw', height: halfH, zIndex: win.zIndex, borderRadius: 0 }
        break
      case 'maximized':
      case 'normal':
      default:
        style = win.maximized
          ? {
              top: '36px',
              left: '0px',
              right: '0px',
              bottom: dockPosition === 'bottom' && !dockAutoHide ? '70px' : 0,
              width: '100vw',
              height: availH,
              zIndex: win.zIndex,
              borderRadius: 0,
            }
          : {
              top: `${currentPos.y}px`,
              left: `${currentPos.x}px`,
              width: `${currentSize.width}px`,
              height: `${currentSize.height}px`,
              zIndex: win.zIndex,
            }
        break
    }

    return {
      ...style,
      display: win.minimized ? 'none' : 'flex'
    }
  }

  // Snap Preview Overlay Style Helper
  const getSnapPreviewStyle = (state) => {
    const availH = 'calc(100vh - 36px - 70px)'
    const halfH = 'calc((100vh - 36px - 70px) / 2)'
    switch (state) {
      case 'maximized':
        return { top: '36px', left: '0px', width: '100vw', height: availH }
      case 'left':
        return { top: '36px', left: '0px', width: '50vw', height: availH }
      case 'right':
        return { top: '36px', left: '50vw', width: '50vw', height: availH }
      case 'top-left':
        return { top: '36px', left: '0px', width: '50vw', height: halfH }
      case 'top-right':
        return { top: '36px', left: '50vw', width: '50vw', height: halfH }
      case 'bottom-left':
        return { top: `calc(36px + ${halfH})`, left: '0px', width: '50vw', height: halfH }
      case 'bottom-right':
        return { top: `calc(36px + ${halfH})`, left: '50vw', width: '50vw', height: halfH }
      default:
        return null
    }
  }

  const previewStyle = getSnapPreviewStyle(snapPreview)

  return (
    <>
      {/* Snap Preview Ghost Outline */}
      {previewStyle && (
        <div
          style={previewStyle}
          className="fixed z-40 bg-[#00F0FF]/15 border-2 border-[#00F0FF]/60 rounded-xl backdrop-blur-sm pointer-events-none transition-all duration-150 animate-pulse"
        />
      )}

      {/* Actual Window Container */}
      <div
        onClick={() => focusWindow(win.id)}
        style={getWindowStyle()}
        className={`nova-window fixed flex flex-col rounded-xl overflow-hidden shadow-2xl transition-all duration-150 select-none ${
          win.focused
            ? 'bg-[#141622] border border-[#00F0FF]/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
            : 'bg-[#141622]/90 border border-white/10 opacity-95'
        }`}
      >
        {/* Title Bar */}
        <div
          onPointerDown={handleTitlePointerDown}
          onDoubleClick={handleTitleDoubleClick}
          className={`h-9 px-3 flex items-center justify-between border-b cursor-grab active:cursor-grabbing text-xs ${
            win.focused
              ? 'bg-white/10 border-white/10 text-white font-medium'
              : 'bg-white/5 border-white/5 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 truncate pointer-events-none">
            <IconComponent size={14} className="text-[#00F0FF] shrink-0" />
            <span className="truncate tracking-wide">{win.title}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => minimizeWindow(win.id)}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              title="Minimize"
              aria-label="Minimize Window"
            >
              <Minus size={12} />
            </button>
            <button
              onClick={() => toggleMaximizeWindow(win.id)}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              title={win.maximized ? 'Restore' : 'Maximize'}
              aria-label="Maximize Window"
            >
              {win.maximized ? <Copy size={11} /> : <Square size={11} />}
            </button>
            <button
              onClick={() => closeWindow(win.id)}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none"
              title="Close"
              aria-label="Close Window"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-hidden bg-[#0E0F17] text-slate-200">
          {children ? (
            children
          ) : AppComponent ? (
            <ErrorBoundary>
              <AppComponent window={win} />
            </ErrorBoundary>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <IconComponent size={40} className="text-[#00F0FF] opacity-80 animate-pulse" />
              <div>
                <h4 className="text-sm font-semibold text-white">{win.title}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Application container initialized. Ready for execution.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Resize Handles */}
        {!win.maximized && win.snapState === 'normal' && (
          <>
            <div
              className="absolute top-0 left-0 w-full h-1 cursor-n-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'n')}
            />
            <div
              className="absolute bottom-0 left-0 w-full h-1 cursor-s-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 's')}
            />
            <div
              className="absolute top-0 left-0 h-full w-1 cursor-w-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            />
            <div
              className="absolute top-0 right-0 h-full w-1 cursor-e-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            />
            <div
              className="absolute top-0 left-0 w-2.5 h-2.5 cursor-nw-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            />
            <div
              className="absolute top-0 right-0 w-2.5 h-2.5 cursor-ne-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            />
            <div
              className="absolute bottom-0 left-0 w-2.5 h-2.5 cursor-sw-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            />
            <div
              className="absolute bottom-0 right-0 w-2.5 h-2.5 cursor-se-resize"
              onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            />
          </>
        )}
      </div>
    </>
  )
}
