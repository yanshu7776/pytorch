"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export default function DynamicClipPathGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height })
    }

    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [mouseX, mouseY])

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Mouse-based dynamic clip paths
  const springConfig = { damping: 25, stiffness: 100 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Gallery images - 実際のスタジオ写真を使用
  const images = [
    {
      src: "/images/studio-blue-led.jpeg",
      alt: "ブルーLED照明のスタジオ",
      title: "幻想的なブルーライト演出",
      description: "SNS映えする動画撮影に最適な青色LEDライト照明",
    },
    {
      src: "/images/studio-red-led.jpeg",
      alt: "レッドLED照明のスタジオ",
      title: "情熱的なレッドライト演出",
      description: "ダンスパフォーマンスを引き立てる赤色LEDライト照明",
    },
    {
      src: "/images/studio-5.jpeg",
      alt: "カラフルLED照明のスタジオ",
      title: "カラフルなLED照明",
      description: "様々な色に変化するLEDライトで雰囲気を自由に演出",
    },
    {
      src: "/images/studio-1.jpeg",
      alt: "明るい自然光のスタジオ",
      title: "クリアな自然光環境",
      description: "レッスンや練習に最適な明るく清潔な空間",
    },
    {
      src: "/images/studio-7.jpeg",
      alt: "カーテン付きスタジオ",
      title: "プライバシー配慮の空間",
      description: "カーテンで仕切れる多目的な利用が可能なスタジオ",
    },
  ]

  // Dynamic clip path functions
  const getClipPath = (index: number) => {
    if (dimensions.width === 0) return ""

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2

    const x = springX.get()
    const y = springY.get()

    // Calculate clip path parameters based on mouse position
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
    const normalizedDistance = Math.min(distanceFromCenter / (dimensions.width / 2), 1)

    // Angle from center to mouse
    const angle = Math.atan2(y - centerY, x - centerX)

    // Different clip path patterns for different indices
    if (index === activeIndex) {
      return getActiveClipPath(x, y, dimensions.width, dimensions.height, angle, normalizedDistance)
    } else {
      return getInactiveClipPath(index, activeIndex, images.length)
    }
  }

  // クリップパス関数を修正して通常の長方形に変更
  const getActiveClipPath = (x: number, y: number, width: number, height: number, angle: number, distance: number) => {
    // 通常の長方形のクリップパスを返す
    return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`
  }

  const getInactiveClipPath = (index: number, activeIndex: number, total: number) => {
    // 非アクティブな画像も通常の長方形に
    return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`
  }

  // 画像切り替え時のアニメーションを調整
  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">スタジオの表情</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            スタジオの様々な表情をご覧ください。
            LEDライトの色を変えることで、撮影やパフォーマンスの雰囲気を自由に演出できます。
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="max-w-5xl mx-auto relative h-[500px] mb-8 rounded-lg overflow-hidden bg-black"
        >
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 overflow-hidden transition-all duration-300"
              initial={false}
              animate={{
                opacity: activeIndex === index ? 1 : 0,
                zIndex: activeIndex === index ? 20 : 10 - Math.abs(index - activeIndex),
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />

                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
                  >
                    <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                    <p className="text-gray-300">{image.description}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Interactive cue */}
          <motion.div
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/80 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7] }}
            transition={{ delay: 1, duration: 2, repeat: 3, repeatType: "reverse" }}
          >
            マウスを動かしてみてください
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {images.map((image, index) => (
            <motion.div
              key={index}
              className={`relative h-24 cursor-pointer overflow-hidden rounded-md ${
                activeIndex === index ? "ring-2 ring-blue-500" : ""
              }`}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveIndex(index)}
            >
              <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-pink-500/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: activeIndex === index ? 0.7 : 0 }}
                whileHover={{ opacity: 0.4 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
