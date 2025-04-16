"use client"

import { useEffect, useRef } from "react"

type MirrorReflectionProps = {
  opacity?: number
}

export default function MirrorReflection({ opacity = 0.3 }: MirrorReflectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Create reflection effect
    const drawReflection = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create gradient for mirror reflection
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.05})`)
      gradient.addColorStop(0.2, `rgba(255, 255, 255, ${opacity * 0.02})`)
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.01})`)
      gradient.addColorStop(0.8, `rgba(255, 255, 255, ${opacity * 0.02})`)
      gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.05})`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add some random reflective spots
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 100 + 50

        const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
        spotGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * opacity * 0.1})`)
        spotGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.fillStyle = spotGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Initial draw
    drawReflection()

    // Redraw on resize
    window.addEventListener("resize", drawReflection)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("resize", drawReflection)
    }
  }, [opacity])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 z-5 pointer-events-none" style={{ mixBlendMode: "overlay" }} />
  )
}
