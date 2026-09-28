import React, { useEffect, useRef } from 'react'

export function LiveWallpaper({ enabled = true }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 })

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX
      mouseRef.current.targetY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    let tick = 0

    const render = () => {
      tick += 0.015
      const m = mouseRef.current
      m.x += (m.targetX - m.x) * 0.05
      m.y += (m.targetY - m.y) * 0.05

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 1. Mouse-reactive specular spotlight
      const spotGrad = ctx.createRadialGradient(
        m.x,
        m.y,
        10,
        m.x,
        m.y,
        380
      )
      spotGrad.addColorStop(0, 'rgba(0, 240, 255, 0.06)')
      spotGrad.addColorStop(0.5, 'rgba(224, 26, 34, 0.03)')
      spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = spotGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. Subtle ambient breathing pulse in top corners
      const breath = (Math.sin(tick) + 1) / 2
      const cornerGrad = ctx.createRadialGradient(
        canvas.width * 0.85,
        canvas.height * 0.2,
        0,
        canvas.width * 0.85,
        canvas.height * 0.2,
        450
      )
      cornerGrad.addColorStop(0, `rgba(224, 26, 34, ${0.02 + breath * 0.02})`)
      cornerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = cornerGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 mix-blend-screen"
    />
  )
}
