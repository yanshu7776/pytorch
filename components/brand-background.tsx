"use client"

import { useEffect, useRef } from "react"

export default function BrandBackground() {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bgRef.current) return

    // Add subtle movement to the background on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return

      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      bgRef.current.style.backgroundPosition = `${50 + x * 5}% ${50 + y * 5}%`
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      {/* Blue gradient base */}
      <div
        ref={bgRef}
        className="fixed inset-0 z-[-3] bg-gradient-to-br from-[#C8E0F7] to-[#E0F3FF] bg-fixed"
        style={{ transition: "background-position 0.5s ease" }}
      />

      {/* Wood texture overlay */}
      <div
        className="fixed inset-0 z-[-2] bg-[url('/images/wood-texture.jpg')] bg-center bg-repeat opacity-10"
        style={{ mixBlendMode: "overlay", pointerEvents: "none" }}
      />
    </>
  )
}
