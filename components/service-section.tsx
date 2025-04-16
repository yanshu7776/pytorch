"use client"
import { motion } from "framer-motion"
import SectionDivider from "./section-divider"

export default function ServiceSection() {
  const services = [
    {
      title: "ヨガ・ダンス",
      description: "広々とした空間で、ヨガやダンスの練習に最適。全面鏡張りで自分の動きを確認しながら練習できます。",
      icon: "🧘‍♀️",
    },
    {
      title: "動画撮影",
      description: "SNS用の動画撮影に最適な環境。LED照明で様々な雰囲気を演出できます。",
      icon: "📹",
    },
    {
      title: "ワークショップ",
      description: "少人数のワークショップやレッスンに最適。プライベート空間で集中して取り組めます。",
      icon: "👥",
    },
  ]

  return (
    <section className="relative py-12 md:py-16 bg-white/90">
      {/* Top wave divider */}
      <SectionDivider position="top" flip={true} />

      <div className="container-wrapper relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#005BAC]">ご利用用途</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-[#F3EFE9] rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-[#005BAC]">{service.title}</h3>
              <p className="text-gray-700 text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom wave divider */}
      <SectionDivider position="bottom" />
    </section>
  )
}
