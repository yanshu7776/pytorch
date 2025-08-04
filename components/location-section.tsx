"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Train, ExternalLink } from "lucide-react"
import { motion, useInView } from "framer-motion"
import FormattedText from "@/components/formatted-text"

export default function LocationSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section ref={sectionRef} className="py-12 md:py-20 relative overflow-hidden bg-[#f8f9fa]" id="location">
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* ヘッダーセクション */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="mb-10 md:mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-[#4facfe] w-10 md:w-16"></div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mx-3 md:mx-4">アクセス情報</h2>
              <div className="h-px bg-[#4facfe] w-10 md:w-16"></div>
            </div>

            <FormattedText
              text="大阪メトロ玉造駅から徒歩2分、天王寺区の便利なロケーションに位置する当スタジオは、アクセス抜群の立地で、忙しい方でも気軽に通えます。"
              className="text-sm sm:text-base md:text-lg leading-loose max-w-2xl mx-auto px-2"
            />
          </motion.div>

          {/* 地図と情報 - 中央揃えのカード */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 md:mb-12"
          >
            {/* 地図 */}
            <div className="w-full h-[300px] md:h-[400px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0668007446396!2d135.52577692935894!3d34.67286110000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e0d25b40a7e7%3A0x3fe8b1f0eaec7a04!2z5aSn6Ziq5bqc5aSn6Ziq5biC5aSp546L5a-65Y2X546J6YCg5YWD55S677yW4oiS77yV!5e0!3m2!1sja!2sjp!4v1713273606815!5m2!1sja!2sjp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="玉造ダンススタジオBeyond 地図"
              ></iframe>
              <div className="absolute bottom-4 right-4">
                {/* Googleマップへのリンクも更新します */}
                <Link href="https://maps.app.goo.gl/Ld5Eo1Eo1Eo1Eo1E6" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-[#4facfe] hover:bg-white/90 border border-[#4facfe] shadow-md group h-auto py-1.5 px-3 text-xs">
                    拡大地図を表示
                    <ExternalLink className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* 情報カード */}
            <div className="p-5 md:p-8">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6 text-gray-800">
                  玉造駅徒歩2分の好立地！
                </h3>

                {/* 住所情報 */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-lg mb-6 md:mb-8 border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-2 md:mb-3 text-center">住所</h4>
                  <p className="text-center text-gray-700 text-sm md:text-base">
                    〒543-0071
                    <br />
                    大阪府大阪市天王寺区玉造元町６−５
                  </p>
                  <div className="mt-3 md:mt-4 flex justify-center">
                    <Link href="https://maps.app.goo.gl/Ld5Eo1Eo1Eo1Eo1E6" target="_blank" rel="noopener noreferrer">
                      <Button className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:from-[#4facfe] hover:to-[#00f2fe] hover:opacity-90 text-white border-none shadow-md group h-auto py-2 px-4 md:py-2.5 md:px-5 text-sm">
                        Googleマップで見る
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <FormattedText
                  text="大阪市天王寺区玉造元町６−５にある当スタジオは、玉造駅（大阪環状線）北口から徒歩2分の至便なロケーション。商店街に隣接し、セブンイレブンまで徒歩2分と利便性抜群です。"
                  className="text-center text-gray-700 text-sm md:text-base mb-5 md:mb-6"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-10">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3 md:mb-4">
                      <div className="w-9 h-9 md:w-10 md:h-10 bg-[#4facfe]/10 rounded-full flex items-center justify-center">
                        <Train className="w-4 h-4 md:w-5 md:h-5 text-[#4facfe]" />
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">交通手段</h4>
                    <p className="text-gray-700 text-xs md:text-sm">
                      大阪メトロ 長堀鶴見緑地線・中央線「玉造駅」から徒歩2分
                      <br />
                      JR環状線「玉造駅」から徒歩5分
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3 md:mb-4">
                      <div className="w-9 h-9 md:w-10 md:h-10 bg-[#4facfe]/10 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-[#4facfe]" />
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">営業時間</h4>
                    <p className="text-gray-700 text-xs md:text-sm">
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
            className="bg-white rounded-xl shadow-md p-5 md:p-8 mb-6 md:mb-10"
          >
            <h4 className="font-bold text-gray-800 text-center mb-4 md:mb-6 text-sm md:text-base">
              主要駅からのアクセス
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4 bg-[#f8f9fa] rounded-lg">
                <div className="font-bold text-[#4facfe] mb-1 md:mb-2 text-sm md:text-base">鶴橋駅</div>
                <p className="text-xs md:text-sm text-gray-700">
                  徒歩9分
                  <br />
                  (近鉄線アクセスに便利)
                </p>
              </div>
              <div className="text-center p-3 md:p-4 bg-[#f8f9fa] rounded-lg">
                <div className="font-bold text-[#4facfe] mb-1 md:mb-2 text-sm md:text-base">森ノ宮駅</div>
                <p className="text-xs md:text-sm text-gray-700">
                  徒歩15分
                  <br />
                  (ビジネス街からの利用に最適)
                </p>
              </div>
              <div className="text-center p-3 md:p-4 bg-[#f8f9fa] rounded-lg">
                <div className="font-bold text-[#4facfe] mb-1 md:mb-2 text-sm md:text-base">大阪上本町駅</div>
                <p className="text-xs md:text-sm text-gray-700">
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
            className="bg-white rounded-xl shadow-md p-5 md:p-8"
          >
            <h4 className="font-bold text-gray-800 text-center mb-4 md:mb-6 text-sm md:text-base">道案内のポイント</h4>
            <div className="max-w-md mx-auto">
              <ol className="space-y-3 md:space-y-4">
                <li className="flex items-center">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-[#4facfe] rounded-full flex items-center justify-center text-white font-bold mr-3 md:mr-4 flex-shrink-0 text-xs md:text-sm">
                    1
                  </div>
                  <span className="text-sm md:text-base">JR玉造駅北口を出て西へ進む</span>
                </li>
                <li className="flex items-center">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-[#4facfe] rounded-full flex items-center justify-center text-white font-bold mr-3 md:mr-4 flex-shrink-0 text-xs md:text-sm">
                    2
                  </div>
                  <span className="text-sm md:text-base">パチンコ屋の駐輪場を右折</span>
                </li>
                <li className="flex items-center">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-[#4facfe] rounded-full flex items-center justify-center text-white font-bold mr-3 md:mr-4 flex-shrink-0 text-xs md:text-sm">
                    3
                  </div>
                  <span className="text-sm md:text-base">2階建てビルの2階がスタジオ</span>
                </li>
              </ol>
            </div>

            <div className="mt-6 md:mt-8 text-center">
              {/* 下部のGoogleマップへのリンクも更新します */}
              <Link href="https://maps.app.goo.gl/Ld5Eo1Eo1Eo1Eo1E6" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:from-[#4facfe] hover:to-[#00f2fe] hover:opacity-90 text-white border-none shadow-md group h-auto py-2 px-4 md:py-2.5 md:px-5 text-sm">
                  Googleマップで見る
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"></div>
    </section>
  )
}
