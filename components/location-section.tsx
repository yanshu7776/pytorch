"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Train, ExternalLink } from "lucide-react"
import { motion, useInView } from "framer-motion"

export default function LocationSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden bg-[#f8f9fa]" id="location">
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* ヘッダーセクション */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-[#4facfe] w-16"></div>
              <h2 className="text-3xl font-bold mx-4 text-gray-800">アクセス情報</h2>
              <div className="h-px bg-[#4facfe] w-16"></div>
            </div>

            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              大阪メトロ玉造駅から徒歩2分、
              <span className="md:hidden mobile-break"></span>
              天王寺区の便利なロケーションに位置する当スタジオは、
              <span className="md:hidden mobile-break"></span>
              <span className="inline-marker">アクセス抜群の立地</span>
              <span className="md:hidden mobile-break"></span>
              で、忙しい方でも気軽に通えます。
            </p>
          </motion.div>

          {/* 地図と情報 - 中央揃えのカード */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-12"
          >
            {/* 地図 */}
            <div className="w-full h-[400px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0668128053256!2d135.5241611!3d34.6728611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e0d25b40a7e7%3A0x3fe8b1f0eaec7a04!2z546J6YCg6aeF!5e0!3m2!1sja!2sjp!4v1650000000000!5m2!1sja!2sjp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="玉造ダンススタジオBeyond 地図"
              ></iframe>
            </div>

            {/* 情報カード */}
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-center mb-6 text-gray-800">玉造駅徒歩2分の好立地！</h3>

                <p className="text-center text-gray-700 mb-6">
                  大阪市天王寺区玉造元町６−５にある当スタジオは、
                  <span className="md:hidden mobile-break"></span>
                  <span className="inline-marker font-bold">玉造駅（大阪環状線）北口から徒歩2分</span>
                  <span className="md:hidden mobile-break"></span>
                  の至便なロケーション。
                  <span className="md:hidden mobile-break"></span>
                  商店街に隣接し、セブンイレブンまで徒歩2分と利便性抜群です。
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-10">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-10 h-10 bg-[#4facfe]/10 rounded-full flex items-center justify-center">
                        <Train className="w-5 h-5 text-[#4facfe]" />
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-3">交通手段</h4>
                    <p className="text-gray-700 text-sm">
                      大阪メトロ 長堀鶴見緑地線・中央線「玉造駅」から徒歩2分
                      <br />
                      JR環状線「玉造駅」から徒歩5分
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-10 h-10 bg-[#4facfe]/10 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#4facfe]" />
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-3">営業時間</h4>
                    <p className="text-gray-700 text-sm">
                      24時間営業
                      <br />
                      年中無休・当日予約可能
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 主要駅からのアクセス */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-8 mb-10"
          >
            <h4 className="font-bold text-gray-800 text-center mb-6">主要駅からのアクセス</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
                <div className="font-bold text-[#4facfe] mb-2">鶴橋駅</div>
                <p className="text-sm text-gray-700">
                  徒歩9分
                  <br />
                  (近鉄線アクセスに便利)
                </p>
              </div>
              <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
                <div className="font-bold text-[#4facfe] mb-2">森ノ宮駅</div>
                <p className="text-sm text-gray-700">
                  徒歩15分
                  <br />
                  (ビジネス街からの利用に最適)
                </p>
              </div>
              <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
                <div className="font-bold text-[#4facfe] mb-2">大阪上本町駅</div>
                <p className="text-sm text-gray-700">
                  徒歩20分
                  <br />
                  (近鉄難波線利用者向け)
                </p>
              </div>
            </div>
          </motion.div>

          {/* 道案内 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h4 className="font-bold text-gray-800 text-center mb-6">道案内のポイント</h4>
            <div className="max-w-md mx-auto">
              <ol className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 bg-[#4facfe] rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                    1
                  </div>
                  <span>JR玉造駅北口を出て西へ進む</span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 bg-[#4facfe] rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                    2
                  </div>
                  <span>パチンコ屋の駐輪場を右折</span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 bg-[#4facfe] rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">
                    3
                  </div>
                  <span>2階建てビルの2階がスタジオ</span>
                </li>
              </ol>
            </div>

            <div className="mt-8 text-center">
              <Link href="https://maps.app.goo.gl/eXRH74xcqFWgR6sA8" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:from-[#4facfe] hover:to-[#00f2fe] hover:opacity-90 text-white border-none shadow-md group">
                  Googleマップで見る
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 下部の装飾 */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"></div>
    </section>
  )
}
