"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface WoodWaveBackgroundProps {
  position?: "top" | "bottom"
  color?: string
  opacity?: number
  height?: number
  flip?: boolean
  className?: string
}

export default function WoodWaveBackground({
  position = "bottom",
  color = "#F3EFE9",
  opacity = 0.3,
  height = 120,
  flip = false,
  className = "",
}: WoodWaveBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        svgRef.current.setAttribute("width", window.innerWidth.toString())
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={`absolute ${position}-0 left-0 w-full overflow-hidden pointer-events-none ${className}`}
      style={{ height: `${height}px`, transform: flip ? "rotate(180deg)" : "none" }}
    >
      <motion.svg
        ref={svgRef}
        height={height}
        preserveAspectRatio="none"
        viewBox="0 0 1440 120"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ opacity }}
      >
        <path
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          fill={color}
          fillOpacity="1"
        ></path>
      </motion.svg>
    </div>
  )
}
