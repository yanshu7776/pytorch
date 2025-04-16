"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ParallaxSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Transform values for parallax effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300])
  const opacity1 = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, 1, 0])
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0])
  const opacity3 = useTransform(scrollYProgress, [0.4, 0.7, 1], [0, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])

  return (
    <section ref={ref} className="relative h-[150vh] overflow-hidden">
      {/* Background layers */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-indigo-900 opacity-80" />
        <Image src="/placeholder.svg?height=1200&width=1920" alt="Parallax Background" fill className="object-cover" />
      </motion.div>

      {/* Content container */}
      <div className="relative z-10 h-full">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-4">
          <div className="max-w-6xl mx-auto w-full">
            {/* First parallax layer */}
            <motion.div
              style={{ y: y1, opacity: opacity1, scale }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-6">リズムを感じる</h2>
              <p className="text-xl text-white/90 text-center max-w-2xl mb-8">
                音楽に身を委ね、自分だけの表現を見つける場所。 玉造ダンススタジオBeyondで、あなたのダンスが進化します。
              </p>
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                <Link href="#reservation">体験予約する</Link>
              </Button>
            </motion.div>

            {/* Second parallax layer */}
            <motion.div
              style={{ y: y2, opacity: opacity2, scale }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-6">仲間と踊る</h2>
              <p className="text-xl text-white/90 text-center max-w-2xl mb-8">
                同じ情熱を持つダンサーたちとの出会いが、 あなたのダンスライフをさらに豊かにします。
              </p>
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                <Link href="#events">イベント情報</Link>
              </Button>
            </motion.div>

            {/* Third parallax layer */}
            <motion.div
              style={{ y: y3, opacity: opacity3, scale }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white text-center mb-6">限界を超える</h2>
              <p className="text-xl text-white/90 text-center max-w-2xl mb-8">
                プロ仕様の環境で、あなたのダンスの可能性を最大限に引き出します。 さあ、次のレベルへ。
              </p>
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                <Link href="#price">料金プランを見る</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]) }}
        className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-20"
      />
    </section>
  )
}
