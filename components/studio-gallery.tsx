"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export default function StudioGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // 実際のスタジオ写真
  const galleryImages = [
    { src: "/images/studio-1.jpeg", alt: "玉造ダンススタジオ - 全面鏡張りの広々としたスタジオ" },
    { src: "/images/studio-2.jpeg", alt: "玉造ダンススタジオ - 木目調の壁と白い床の清潔な空間" },
    { src: "/images/studio-3.jpeg", alt: "玉造ダンススタジオ - 窓からの自然光が入るスタジオ" },
    { src: "/images/studio-4.jpeg", alt: "玉造ダンススタジオ - 更衣スペース付きの多目的スタジオ" },
    { src: "/images/studio-5.jpeg", alt: "玉造ダンススタジオ - LEDライト演出が可能な空間" },
    { src: "/images/studio-6.jpeg", alt: "玉造ダンススタジオ - 明るい照明のプロフェッショナル環境" },
    { src: "/images/studio-7.jpeg", alt: "玉造ダンススタジオ - プライバシーに配慮したカーテン付き" },
    { src: "/images/studio-8.jpeg", alt: "玉造ダンススタジオ - ヨガやピラティスにも最適な空間" },
    { src: "/images/studio-blue-led.jpeg", alt: "玉造ダンススタジオ - ブルーLED照明の幻想的な空間" },
    { src: "/images/studio-red-led.jpeg", alt: "玉造ダンススタジオ - レッドLED照明の情熱的な空間" },
    { src: "/images/studio-kitchen.jpeg", alt: "玉造ダンススタジオ - 給水・休憩用キッチンエリア" },
    { src: "/images/studio-speaker.jpeg", alt: "玉造ダンススタジオ - 高品質BOSE製スピーカー" },
    { src: "/images/studio-stools.jpeg", alt: "玉造ダンススタジオ - 休憩・観覧用木製スツール" },
  ]

  const nextImage = () => {
    if (selectedImage === null) return
    setSelectedImage((selectedImage + 1) % galleryImages.length)
  }

  const prevImage = () => {
    if (selectedImage === null) return
    setSelectedImage((selectedImage - 1 + galleryImages.length) % galleryImages.length)
  }

  return (
    <section id="gallery" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">スタジオ写真</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            玉造駅から徒歩2分・天王寺区の当日予約可能なダンススタジオの様子をご覧ください。
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
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
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
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
                src={galleryImages[selectedImage].src || "/placeholder.svg"}
                alt={galleryImages[selectedImage].alt}
                fill
                className="object-contain"
              />

              <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                {selectedImage + 1} / {galleryImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
