"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"

export default function EnhancedParallax() {
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
    offset: ["start end", "end start"],
  })

  // パララックス効果のための変換値
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300])
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 100])
  const y5 = useTransform(scrollYProgress, [0, 1], [0, 200])

  const scale1 = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])
  const scale2 = useTransform(scrollYProgress, [0, 0.5], [1, 1.2])

  const opacity1 = useTransform(scrollYProgress, [0.1, 0.3, 0.5], [0, 1, 0])
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0])
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.7, 0.9], [0, 1, 0])

  return (
    <section ref={containerRef} className="relative h-[200vh] overflow-hidden bg-black">
      {/* 背景レイヤー */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ y: y1, scale: scale1 }} className="absolute inset-0 z-0">
          <Image src="/placeholder.svg?height=1200&width=1920" alt="パララックス背景1" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent" />
        </motion.div>

        {/* 中間レイヤー - ダンサーのシルエット */}
        <motion.div style={{ y: y2, scale: scale2 }} className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src="/placeholder.svg?height=1000&width=1000"
              alt="ダンサーシルエット"
              fill
              className="object-contain mix-blend-screen"
            />
          </div>
        </motion.div>

        {/* 前景レイヤー - 装飾要素 */}
        <motion.div style={{ y: y3 }} className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/30 blur-xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-purple-500/30 blur-xl" />
          <div className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-pink-500/30 blur-xl" />
        </motion.div>

        {/* テキストレイヤー */}
        <div className="relative z-30 h-full flex flex-col items-center justify-center px-4">
          <motion.div style={{ opacity: opacity1, y: y4 }} className="text-center mb-32">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">動きを感じる</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">リズムに身を委ね、自由に表現する喜びを</p>
          </motion.div>

          <motion.div style={{ opacity: opacity2 }} className="text-center mb-32">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">空間を共有する</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">同じ情熱を持つ仲間と、創造性を高め合う</p>
          </motion.div>

          <motion.div style={{ opacity: opacity3, y: y5 }} className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">限界を超える</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">あなたの可能性は、ここから広がる</p>
          </motion.div>
        </div>

        {/* グラデーションオーバーレイ */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-40" />
      </div>
    </section>
  )
}
