"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export default function PhotoShowcase() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")

  // 実際のスタジオ写真を使用
  const photos = [
    {
      src: "/images/studio-1.jpeg",
      alt: "スタジオ全体",
      category: "studio",
      description: "全面鏡張りの広々としたスタジオ",
    },
    {
      src: "/images/studio-blue-led.jpeg",
      alt: "ブルーLED照明",
      category: "lighting",
      description: "幻想的な青色LED照明効果",
    },
    {
      src: "/images/studio-red-led.jpeg",
      alt: "レッドLED照明",
      category: "lighting",
      description: "情熱的な赤色LED照明効果",
    },
    {
      src: "/images/studio-2.jpeg",
      alt: "鏡",
      category: "equipment",
      description: "木目調の壁と全面鏡張り",
    },
    {
      src: "/images/studio-3.jpeg",
      alt: "窓",
      category: "studio",
      description: "自然光が入る明るい空間",
    },
    {
      src: "/images/studio-4.jpeg",
      alt: "更衣スペース",
      category: "facilities",
      description: "プライバシーに配慮した更衣スペース",
    },
    {
      src: "/images/studio-5.jpeg",
      alt: "LEDライト演出",
      category: "lighting",
      description: "カラフルなLED照明効果",
    },
    {
      src: "/images/studio-6.jpeg",
      alt: "明るい照明",
      category: "studio",
      description: "明るく清潔なスタジオ空間",
    },
    {
      src: "/images/studio-7.jpeg",
      alt: "カーテン付きスタジオ",
      category: "studio",
      description: "プライバシーに配慮したカーテン付き",
    },
    {
      src: "/images/studio-8.jpeg",
      alt: "多目的スペース",
      category: "studio",
      description: "ヨガやピラティスにも最適な空間",
    },
    {
      src: "/images/studio-speaker.jpeg",
      alt: "BOSE製スピーカー",
      category: "equipment",
      description: "高品質な音響システム",
    },
    {
      src: "/images/studio-kitchen.jpeg",
      alt: "キッチンエリア",
      category: "facilities",
      description: "給水・休憩スペース",
    },
    {
      src: "/images/studio-stools.jpeg",
      alt: "木製スツール",
      category: "facilities",
      description: "休憩や観覧用の座席",
    },
  ]

  const filteredPhotos = activeCategory === "all" ? photos : photos.filter((photo) => photo.category === activeCategory)

  const nextImage = () => {
    if (selectedImage === null) return
    setSelectedImage((selectedImage + 1) % filteredPhotos.length)
  }

  const prevImage = () => {
    if (selectedImage === null) return
    setSelectedImage((selectedImage - 1 + filteredPhotos.length) % filteredPhotos.length)
  }

  return (
    <section id="photo-showcase" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">レンタルスペース写真</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            玉造駅から徒歩2分・天王寺区の当日予約可能なダンススタジオの様子をご覧ください。
          </p>
        </motion.div>

        {/* カテゴリーフィルター */}
        <div className="flex justify-center mb-8 flex-wrap">
          <div className="inline-flex bg-white rounded-lg shadow-md p-1">
            <button
              className={`px-4 py-2 rounded-md ${activeCategory === "all" ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveCategory("all")}
            >
              すべて
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeCategory === "studio" ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveCategory("studio")}
            >
              スタジオ
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeCategory === "lighting" ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveCategory("lighting")}
            >
              照明
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeCategory === "equipment" ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveCategory("equipment")}
            >
              設備
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeCategory === "facilities" ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setActiveCategory("facilities")}
            >
              施設
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
                onClick={() => setSelectedImage(index)}
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={photo.src || "/placeholder.svg"}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{photo.alt}</h3>
                  <p className="text-sm text-gray-600">{photo.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black/30"
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
            >
              <ChevronLeft size={32} />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black/30"
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
            >
              <ChevronRight size={32} />
            </button>

            <div className="relative w-full max-w-4xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={filteredPhotos[selectedImage].src || "/placeholder.svg"}
                alt={filteredPhotos[selectedImage].alt}
                fill
                className="object-contain"
              />

              <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center">
                <div className="bg-black/70 text-white px-4 py-2 rounded-lg mb-2">
                  <h4 className="font-medium">{filteredPhotos[selectedImage].alt}</h4>
                  <p className="text-sm text-gray-300">{filteredPhotos[selectedImage].description}</p>
                </div>
                <div className="text-white">
                  {selectedImage + 1} / {filteredPhotos.length}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
