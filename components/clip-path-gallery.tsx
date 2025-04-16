"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function ClipPathGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // プレースホルダー画像 - 後で実際の写真に置き換え
  const images = [
    { src: "/placeholder.svg?height=800&width=1200", alt: "ダンススタジオ1" },
    { src: "/placeholder.svg?height=800&width=1200", alt: "ダンススタジオ2" },
    { src: "/placeholder.svg?height=800&width=1200", alt: "ダンススタジオ3" },
    { src: "/placeholder.svg?height=800&width=1200", alt: "ダンススタジオ4" },
  ]

  // 自動スライド
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  // クリップパスの形状
  const clipPaths = [
    "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    "circle(50% at 50% 50%)",
  ]

  return (
    <section className="py-16 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">スタジオの魅力</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">様々な角度から見るスタジオの魅力をご紹介します</p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* メインイメージ */}
          <div className="relative h-[500px] mb-8 overflow-hidden rounded-lg">
            {images.map((image, index) => (
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  clipPath:
                    activeIndex === index ? clipPaths[index % clipPaths.length] : "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                  clipPath: { duration: 1.5, ease: "easeInOut" },
                }}
              >
                <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
              </motion.div>
            ))}
          </div>

          {/* サムネイル */}
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={index}
                className={`relative h-24 cursor-pointer overflow-hidden rounded-md ${
                  activeIndex === index ? "ring-2 ring-blue-500" : ""
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/70 via-purple-500/70 to-pink-500/70"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: hoveredIndex === index || activeIndex === index ? 0.7 : 0,
                    clipPath:
                      hoveredIndex === index
                        ? clipPaths[index % clipPaths.length]
                        : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
