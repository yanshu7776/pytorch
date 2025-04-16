"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

export default function FilterBlendShowcase() {
  const [activeFilter, setActiveFilter] = useState("normal")

  const filters = [
    { name: "normal", label: "ノーマル" },
    { name: "grayscale", label: "モノクロ" },
    { name: "sepia", label: "セピア" },
    { name: "saturate", label: "鮮やか" },
    { name: "hue-rotate", label: "色相回転" },
    { name: "invert", label: "反転" },
  ]

  const blendModes = [
    { name: "normal", label: "通常" },
    { name: "multiply", label: "乗算" },
    { name: "screen", label: "スクリーン" },
    { name: "overlay", label: "オーバーレイ" },
    { name: "darken", label: "比較（暗）" },
    { name: "lighten", label: "比較（明）" },
  ]

  const getFilterStyle = (filter: string) => {
    switch (filter) {
      case "grayscale":
        return "grayscale(100%)"
      case "sepia":
        return "sepia(100%)"
      case "saturate":
        return "saturate(200%)"
      case "hue-rotate":
        return "hue-rotate(180deg)"
      case "invert":
        return "invert(80%)"
      default:
        return "none"
    }
  }

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">スタジオの表情</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">様々な表現で見るスタジオの魅力</p>
        </motion.div>

        {/* フィルターコントロール */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.name}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.name
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveFilter(filter.name)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* イメージグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {blendModes.map((blend, index) => (
            <motion.div
              key={blend.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-lg shadow-lg bg-white"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    backgroundImage: "linear-gradient(to right, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5))",
                    mixBlendMode: blend.name as any,
                  }}
                />
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt={`スタジオ - ${blend.label}ブレンド`}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  style={{
                    filter: getFilterStyle(activeFilter),
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{blend.label}ブレンド</h3>
                <p className="text-sm text-gray-600">
                  {activeFilter !== "normal"
                    ? `${filters.find((f) => f.name === activeFilter)?.label}フィルター適用`
                    : "フィルターなし"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
