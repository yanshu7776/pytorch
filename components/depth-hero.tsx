"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

export default function DepthHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // スライドの内容 - 一行に収まる短い説明文
  const slides = [
    {
      image: "/images/studio-blue-led.jpeg",
      title: "玉造駅から徒歩2分のダンス練習場",
      subtitle: "DANCE STUDIO",
      description: "音楽に身を委ね、自分だけの表現を見つける場所。",
    },
    {
      image: "/images/studio-red-led.jpeg",
      title: "天王寺区の格安レンタルスタジオ",
      subtitle: "AFFORDABLE PRICE",
      description: "リーズナブルな料金で気軽に利用できるダンススタジオ。",
    },
    {
      image: "/images/studio-5.jpeg",
      title: "初心者から上級者まで利用できる空間",
      subtitle: "FOR EVERYONE",
      description: "プロ仕様の環境で、あなたのダンスの可能性を広げる。",
    },
  ]

  // 自動スライド切り替え
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 8000) // 8秒ごとに切り替え

    return () => clearInterval(interval)
  }, [slides.length])

  // ロード完了時のアニメーション
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // 前のスライドに移動
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // 次のスライドに移動
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" ref={containerRef}>
      {/* スライドショー背景 - 写真をメインに */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {slides.map(
            (slide, index) =>
              currentSlide === index && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.05 }}
                    transition={{ duration: 20, ease: "easeOut" }}
                    className="w-full h-full"
                  >
                    <Image
                      src={slide.image || "/placeholder.svg"}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority
                      quality={100}
                    />
                  </motion.div>

                  {/* グラデーションオーバーレイ - 下部のみ暗くして写真を鮮明に */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      {/* 左右の矢印ナビゲーション */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300"
        aria-label="前のスライド"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300"
        aria-label="次のスライド"
      >
        <ChevronRight size={24} />
      </button>

      {/* コンテンツオーバーレイ - 下部に配置 */}
      <div className="relative z-10 h-full flex flex-col justify-end items-start">
        <div className="container mx-auto px-6 pb-16 md:pb-20">
          <div className="max-w-xs sm:max-w-sm md:max-w-md md:ml-12 lg:ml-24">
            {/* スライドコンテンツ */}
            <AnimatePresence mode="wait">
              {slides.map(
                (slide, index) =>
                  currentSlide === index && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="text-left backdrop-blur-md bg-black/30 p-3 md:p-4 rounded-xl border border-white/10"
                    >
                      <div className="flex flex-col">
                        {/* サブタイトル */}
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                          className="font-serif text-xs tracking-widest text-blue-200 uppercase mb-1"
                        >
                          {slide.subtitle}
                        </motion.p>

                        {/* タイトル */}
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.8 }}
                          className="font-serif text-lg md:text-2xl font-bold text-white tracking-tight leading-tight mb-1"
                          style={{
                            fontFamily: "'Noto Serif JP', serif",
                            textShadow: "0 2px 10px rgba(0,0,0,0.8)", // シャドウを強くして視認性アップ
                            wordBreak: "keep-all", // 不自然な改行を防止
                            overflow: "hidden", // はみ出し防止
                          }}
                        >
                          {/* モバイルで長いタイトルを適切に表示 */}
                          {slide.title.length > 15 && window.innerWidth < 640 ? (
                            <>
                              {slide.title.slice(0, 15)}
                              <br />
                              {slide.title.slice(15)}
                            </>
                          ) : (
                            slide.title
                          )}
                        </motion.h1>

                        {/* 説明文 - タイトルの下に配置 */}
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                          className="text-xs md:text-sm text-white/90 leading-snug mb-2"
                          style={{
                            textShadow: "0 1px 3px rgba(0,0,0,0.7)", // テキストシャドウを追加して視認性アップ
                            maxWidth: "100%", // はみ出し防止
                          }}
                        >
                          {/* モバイルで長い説明文を適切に表示 */}
                          {window.innerWidth < 640 && slide.description.length > 25 ? (
                            <>
                              {slide.description.slice(0, 25)}
                              <br />
                              {slide.description.slice(25)}
                            </>
                          ) : (
                            slide.description
                          )}
                        </motion.p>

                        {/* CTAボタン */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          className="mt-1"
                        >
                          <Link
                            href="https://spacemarket.com/p/HDNuvkO2oN95p2Dp"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              className="bg-white/90 hover:bg-transparent text-blue-900 hover:text-white border border-transparent hover:border-white/80 transition-all duration-300 rounded-md text-xs font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              予約をする
                            </Button>
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* スライドインジケーター */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              currentSlide === index ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`スライド ${index + 1}`}
          />
        ))}
      </div>

      {/* スクロールインジケーター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-white/70 text-sm mb-2 font-light tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="text-white/80"
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
