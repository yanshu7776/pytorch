"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FilterControl {
  name: string
  label: string
  min: number
  max: number
  default: number
  unit: string
  property: string
}

export default function InteractiveFilterShowcase() {
  const [activeImage, setActiveImage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse tracking for light effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Sample images with different moods - 実際のスタジオ写真を使用
  const images = [
    {
      src: "/images/studio-blue-led.jpeg",
      alt: "ブルーLED照明のスタジオ",
      preset: "dynamic",
    },
    {
      src: "/images/studio-red-led.jpeg",
      alt: "レッドLED照明のスタジオ",
      preset: "energetic",
    },
    {
      src: "/images/studio-1.jpeg",
      alt: "明るい自然光のスタジオ",
      preset: "professional",
    },
    {
      src: "/images/studio-4.jpeg",
      alt: "落ち着いた雰囲気のスタジオ",
      preset: "calm",
    },
    {
      src: "/images/studio-8.jpeg",
      alt: "多目的利用のスタジオ",
      preset: "professional",
    },
  ]

  // Filter controls
  const filterControls: FilterControl[] = [
    { name: "brightness", label: "明るさ", min: 50, max: 150, default: 100, unit: "%", property: "brightness" },
    { name: "contrast", label: "コントラスト", min: 50, max: 150, default: 100, unit: "%", property: "contrast" },
    { name: "saturation", label: "彩度", min: 0, max: 200, default: 100, unit: "%", property: "saturate" },
    { name: "hue", label: "色相", min: 0, max: 360, default: 0, unit: "deg", property: "hue-rotate" },
  ]

  // State for filter values
  const [filterValues, setFilterValues] = useState<Record<string, number>>(
    Object.fromEntries(filterControls.map((c) => [c.name, c.default])),
  )

  // Light effect with mouse position
  const springConfig = { damping: 25, stiffness: 100 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Apply preset filter when changing image
  const presetFilters: Record<string, Record<string, number>> = {
    dynamic: { brightness: 110, contrast: 120, saturation: 130, hue: 0 },
    calm: { brightness: 90, contrast: 90, saturation: 80, hue: 180 },
    energetic: { brightness: 120, contrast: 130, saturation: 150, hue: 15 },
    professional: { brightness: 105, contrast: 110, saturation: 90, hue: 0 },
  }

  useEffect(() => {
    const preset = images[activeImage].preset
    if (preset && presetFilters[preset]) {
      setFilterValues(presetFilters[preset])
    }
  }, [activeImage])

  // Combine all filters into one CSS filter string
  const getFilterString = () => {
    return filterControls
      .map((control) => {
        // ぼかし効果を確実に適用するための特別な処理
        if (control.name === "blur") {
          return `${control.property}(${filterValues[control.name]}${control.unit})`
        }
        return `${control.property}(${filterValues[control.name]}${control.unit})`
      })
      .join(" ")
  }

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-blue-600 hover:bg-blue-700">インタラクティブ</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">フィルター効果演出</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            スライダーを動かして、フィルター効果をリアルタイムで体験。
            スタジオでの撮影にどのような効果が得られるかをシミュレーション。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="md:col-span-2">
            <div ref={containerRef} className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl h-[500px]">
              <div className="absolute inset-0 overflow-hidden">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeImage === index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                    style={{
                      filter: activeImage === index ? getFilterString() : undefined,
                      WebkitFilter: activeImage === index ? getFilterString() : undefined,
                    }}
                  >
                    <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                  </motion.div>
                ))}
              </div>

              {/* Light reflection effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-white/20 to-transparent pointer-events-none mix-blend-overlay"
                style={{
                  background: useMotionTemplate`radial-gradient(circle at ${springX}px ${springY}px, rgba(255, 255, 255, 0.15), transparent 35%)`,
                }}
              />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                <h3 className="text-xl font-bold">{images[activeImage].alt}</h3>
                <p className="text-gray-300 text-sm mt-2">現在適用中: {getFilterString()}</p>
              </div>

              {/* Image selectors */}
              <div className="absolute top-4 right-4 flex space-x-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      activeImage === index ? "bg-blue-500 w-8" : "bg-white/50 hover:bg-white/80",
                    )}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Select ${image.alt}`}
                  />
                ))}
              </div>
            </div>

            {/* Image thumbnails */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "relative h-20 rounded-md overflow-hidden cursor-pointer",
                    activeImage === index && "ring-2 ring-blue-500",
                  )}
                  onClick={() => setActiveImage(index)}
                >
                  <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                  <div
                    className={cn(
                      "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
                      activeImage === index ? "opacity-0" : "opacity-60",
                    )}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls panel */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 shadow-lg">
            <h3 className="text-xl font-bold mb-6">フィルター調整</h3>

            <div className="space-y-6">
              {filterControls.map((control) => (
                <div key={control.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">{control.label}</label>
                    <span className="text-xs bg-gray-700 rounded-full px-2 py-1">
                      {filterValues[control.name]}
                      {control.unit}
                    </span>
                  </div>
                  <Slider
                    value={[filterValues[control.name]]}
                    min={control.min}
                    max={control.max}
                    step={1}
                    onValueChange={(value) => {
                      setFilterValues({
                        ...filterValues,
                        [control.name]: value[0],
                      })
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Preset buttons */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-300 mb-3">プリセット効果</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presetFilters).map(([name, values], index) => (
                  <button
                    key={name}
                    className={cn(
                      "text-sm py-2 rounded-md transition-colors",
                      images[activeImage].preset === name
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700/70 text-gray-300 hover:bg-gray-700",
                    )}
                    onClick={() => {
                      setFilterValues(values)
                      // Find and set the matching image
                      const imgIndex = images.findIndex((img) => img.preset === name)
                      if (imgIndex >= 0) {
                        setActiveImage(imgIndex)
                      }
                    }}
                  >
                    {name === "dynamic" && "ダイナミック"}
                    {name === "calm" && "落ち着いた"}
                    {name === "energetic" && "活動的"}
                    {name === "professional" && "プロ仕様"}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset button */}
            <button
              className="w-full mt-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              onClick={() => {
                const defaults = Object.fromEntries(filterControls.map((c) => [c.name, c.default]))
                setFilterValues(defaults)
              }}
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
