"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function ScrollAnimations() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  // Smooth progress for progress bar
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Transform values for various elements
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  const benefits = [
    {
      title: "プロ仕様の設備",
      description: "高品質な音響システム、全面鏡張り、最高級の床材を完備。プロのダンサーも満足できる環境です。",
      icon: "🎵",
    },
    {
      title: "24時間利用可能",
      description: "早朝から深夜まで、あなたの都合に合わせていつでも利用できます。仕事帰りの練習も可能です。",
      icon: "🕒",
    },
    {
      title: "アクセス抜群",
      description: "駅から徒歩3分の好立地。交通の便が良く、通いやすい場所にあります。",
      icon: "🚶",
    },
    {
      title: "リーズナブルな料金",
      description: "1時間単位の利用が可能で、長時間利用ほどお得になる料金体系。グループでの利用もリーズナブルです。",
      icon: "💰",
    },
    {
      title: "清潔な環境",
      description: "毎日清掃を行い、常に清潔な状態を維持。気持ちよく練習できる空間を提供します。",
      icon: "✨",
    },
    {
      title: "コミュニティ形成",
      description: "定期的なイベントやワークショップを開催。ダンス仲間との出会いの場を提供します。",
      icon: "👥",
    },
  ]

  return (
    <section ref={containerRef} className="py-20 bg-gray-50 relative">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX: progressWidth }}
      />

      <div className="container mx-auto px-4">
        <motion.div style={{ opacity, scale }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">スクロールで体験する特徴</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            スクロールしながら、玉造ダンススタジオBeyondの特徴をご覧ください。
          </p>
        </motion.div>

        {/* Rotating element */}
        <motion.div
          style={{ rotate }}
          className="w-20 h-20 mx-auto mb-12 flex items-center justify-center bg-blue-100 rounded-full"
        >
          <span className="text-3xl">💃</span>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Scroll-triggered checklist */}
        <div className="mt-20 max-w-3xl mx-auto">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8 text-center"
          >
            選ばれる理由
          </motion.h3>

          <div className="space-y-4">
            {[
              "最高級の防音性能で、周囲を気にせず練習できます",
              "プロ仕様の照明で、SNS映えする動画撮影が可能です",
              "清潔な更衣室とシャワールームを完備しています",
              "無料Wi-Fiで、オンラインレッスンの受講も可能です",
              "予約システムで、簡単に空き状況を確認できます",
              "初心者から上級者まで、あらゆるレベルのダンサーに対応しています",
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start bg-white p-4 rounded-lg shadow"
              >
                <Check className="mr-3 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
