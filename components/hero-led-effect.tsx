"use client"

import { useEffect, useRef } from "react"

export default function HeroLedEffect() {
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

    // LED light parameters
    const ledCount = Math.floor(canvas.width / 15) // Number of LEDs
    const ledSize = 2
    const ledSpacing = canvas.width / ledCount

    // Animation variables
    let time = 0
    const speed = 0.05

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Top LED strip
      for (let i = 0; i < ledCount; i++) {
        const x = i * ledSpacing
        const brightness = Math.sin(time + i * 0.2) * 0.5 + 0.5
        const size = ledSize + brightness * 2

        // LED light
        ctx.beginPath()
        ctx.arc(x, 2, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${brightness})`
        ctx.fill()

        // LED glow
        ctx.beginPath()
        ctx.arc(x, 2, size * 3, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(x, 2, size, x, 2, size * 3)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${brightness * 0.8})`)
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)")
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Bottom LED strip
      for (let i = 0; i < ledCount; i++) {
        const x = i * ledSpacing
        const brightness = Math.sin(time + i * 0.2 + Math.PI) * 0.5 + 0.5
        const size = ledSize + brightness * 2

        // LED light
        ctx.beginPath()
        ctx.arc(x, canvas.height - 2, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${brightness})`
        ctx.fill()

        // LED glow
        ctx.beginPath()
        ctx.arc(x, canvas.height - 2, size * 3, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(x, canvas.height - 2, size, x, canvas.height - 2, size * 3)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${brightness * 0.8})`)
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)")
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Left LED strip
      const leftLedCount = Math.floor(canvas.height / 15)
      const leftLedSpacing = canvas.height / leftLedCount

      for (let i = 0; i < leftLedCount; i++) {
        const y = i * leftLedSpacing
        const brightness = Math.sin(time + i * 0.2 + Math.PI / 2) * 0.5 + 0.5
        const size = ledSize + brightness * 2

        // LED light
        ctx.beginPath()
        ctx.arc(2, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${brightness})`
        ctx.fill()

        // LED glow
        ctx.beginPath()
        ctx.arc(2, y, size * 3, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(2, y, size, 2, y, size * 3)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${brightness * 0.8})`)
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)")
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Right LED strip
      for (let i = 0; i < leftLedCount; i++) {
        const y = i * leftLedSpacing
        const brightness = Math.sin(time + i * 0.2 + Math.PI * 1.5) * 0.5 + 0.5
        const size = ledSize + brightness * 2

        // LED light
        ctx.beginPath()
        ctx.arc(canvas.width - 2, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${brightness})`
        ctx.fill()

        // LED glow
        ctx.beginPath()
        ctx.arc(canvas.width - 2, y, size * 3, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(canvas.width - 2, y, size, canvas.width - 2, y, size * 3)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${brightness * 0.8})`)
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)")
        ctx.fillStyle = gradient
        ctx.fill()
      }

      time += speed
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" style={{ mixBlendMode: "screen" }} />
  )
}
