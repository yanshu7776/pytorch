"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Custom hook for parallax sections
function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [0, distance])
}

interface ParallaxLayerProps {
  progress: MotionValue<number>
  src: string
  alt: string
  distance: number
  zIndex: number
  opacity?: [number, number, number]
  scale?: [number, number, number]
  className?: string
}

function ParallaxLayer({
  progress,
  src,
  alt,
  distance,
  zIndex,
  opacity = [0, 1, 0],
  scale = [1, 1, 1],
  className,
}: ParallaxLayerProps) {
  const y = useParallax(progress, distance)
  const opacityValue = useTransform(progress, [0.1, 0.4, 0.9], opacity)
  const scaleValue = useTransform(progress, [0.1, 0.4, 0.9], scale)

  return (
    <motion.div
      style={{
        y,
        opacity: opacityValue,
        scale: scaleValue,
        zIndex,
      }}
      className={cn("absolute inset-0", className)}
    >
      <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-cover" />
    </motion.div>
  )
}

// 新しいテキストセクションコンポーネント - 視認性を向上
function ParallaxTextSection({
  progress,
  threshold,
  distance,
  zIndex,
  subtitle,
  title,
  description,
  keywords,
}: {
  progress: MotionValue<number>
  threshold: [number, number, number]
  distance: number
  zIndex: number
  subtitle?: string
  title: string
  description: string
  keywords?: string
}) {
  const y = useTransform(progress, [0, 1], [0, distance])
  const opacity = useTransform(progress, threshold, [0, 1, 0])

  return (
    <motion.div
      style={{
        y,
        opacity,
        zIndex,
      }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      {/* 背景なしでテキストの視認性を向上させる */}
      <div className="text-center px-4 max-w-3xl">
        {/* サブタイトル */}
        {subtitle && <p className="text-sm md:text-base tracking-widest text-blue-300 mb-4 uppercase">{subtitle}</p>}

        {/* タイトルに強いテキスト影を適用 */}
        <h2
          className="text-4xl md:text-5xl font-bold text-white mb-6"
          style={{
            textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.4)",
          }}
        >
          {title}
        </h2>

        {/* 説明文に背景グラデーションを適用して視認性を向上 */}
        <div
          className="inline-block py-3 px-6 rounded-lg backdrop-blur-md"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
            boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
          }}
        >
          <p
            className="text-xl text-white max-w-2xl mx-auto"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {description}
          </p>

          {keywords && <p className="text-sm text-white/80 mt-4 max-w-2xl mx-auto">{keywords}</p>}
        </div>
      </div>
    </motion.div>
  )
}

export default function AdvancedParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [windowHeight, setWindowHeight] = useState(0)

  useEffect(() => {
    setWindowHeight(window.innerHeight)

    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  // Smooth scrolling effect
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 50,
    stiffness: 400,
  })

  // Content sections with SEO keywords
  const sections = [
    {
      subtitle: "LOCATION",
      title: "玉造駅から徒歩2分のダンス練習場",
      description:
        "音楽に身を委ね、自分だけの表現を見つける場所。玉造ダンススタジオBeyondで、あなたのダンスが進化します。",
      keywords: "玉造 ダンススタジオ, 玉造駅 ダンス練習場, 当日予約可能 ダンススタジオ",
      threshold: [0.1, 0.3, 0.5],
      distance: -20,
    },
    {
      subtitle: "PRICE",
      title: "天王寺区の格安レンタルスタジオ",
      description:
        "同じ情熱を持つダンサーたちとの出会いが、あなたのダンスライフをさらに豊かにします。リーズナブルな料金で気軽に利用できます。",
      keywords: "天王寺区 レンタルスタジオ, 格安ダンスレンタル 大阪, 玉造 ダンススタジオ",
      threshold: [0.4, 0.6, 0.8],
      distance: 20,
    },
    {
      subtitle: "EXPERIENCE",
      title: "初心者から上級者まで利用できる空間",
      description:
        "プロ仕様の環境で、あなたのダンスの可能性を最大限に引き出します。初心者の方も安心して利用できる設備とサポートが充実。",
      keywords: "初心者向けダンススタジオ 玉造, 天王寺区 レンタルスタジオ, 当日予約可能 ダンススタジオ",
      threshold: [0.7, 0.9, 1.0],
      distance: -20,
    },
  ]

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background layer - Mountains */}
        <ParallaxLayer
          progress={smoothProgress}
          src="/images/studio-2.jpeg"
          alt="玉造 ダンススタジオ 背景"
          distance={-150}
          zIndex={10}
          opacity={[0.3, 1, 0.3]}
        />

        {/* Middle layer - City silhouette */}
        <ParallaxLayer
          progress={smoothProgress}
          src="/images/studio-3.jpeg"
          alt="天王寺区 レンタルスタジオ 都市風景"
          distance={-80}
          zIndex={20}
          opacity={[0.4, 1, 0.4]}
          className="brightness-50 contrast-125"
        />

        {/* Foreground layer - Dance studio */}
        <ParallaxLayer
          progress={smoothProgress}
          src="/images/studio-4.jpeg"
          alt="玉造駅 ダンス練習場 スタジオ内観"
          distance={-40}
          zIndex={30}
          scale={[0.9, 1, 0.9]}
        />

        {/* Lighting effects */}
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ opacity: useTransform(smoothProgress, [0, 0.5, 1], [0, 1, 0]) }}
        >
          {/* Light rays */}
          <div className="absolute top-0 left-1/4 w-32 h-screen transform -rotate-15 bg-gradient-to-b from-blue-500/30 via-blue-500/10 to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-32 h-screen transform rotate-15 bg-gradient-to-b from-purple-500/30 via-purple-500/10 to-transparent"></div>
          <div className="absolute top-0 left-2/4 w-32 h-screen bg-gradient-to-b from-pink-500/30 via-pink-500/10 to-transparent"></div>

          {/* Particle effects */}
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl mix-blend-screen"></div>
        </motion.div>

        {/* Text sections - each appears at different scroll positions */}
        {sections.map((section, index) => (
          <ParallaxTextSection
            key={index}
            progress={smoothProgress}
            threshold={section.threshold}
            distance={section.distance}
            zIndex={50}
            subtitle={section.subtitle}
            title={section.title}
            description={section.description}
            keywords={section.keywords}
          />
        ))}

        {/* Vignette overlay */}
        <div className="absolute inset-0 pointer-events-none z-60 bg-radial-vignette"></div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-70"
          style={{ opacity: useTransform(smoothProgress, [0, 0.2], [1, 0]) }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-white/70 text-sm mb-2 uppercase tracking-widest">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
