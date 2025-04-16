"use client"

import { motion } from "framer-motion"
import { MapPin, Train, Clock, Phone } from "lucide-react"
import SectionDivider from "./section-divider"

export default function AccessMap() {
  return (
    <section id="access" className="py-10 md:py-20 relative bg-[#FAFAFA]">
      {/* Top wave divider */}
      <SectionDivider position="top" flip={true} />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-[#005BAC]">アクセス</h2>
          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto px-2">
            大阪メトロ玉造駅から徒歩2分、便利なロケーションです。
          </p>
        </motion.div>

        <div className="content-card rounded-xl overflow-hidden shadow-lg bg-white">
          <div className="flex flex-col lg:flex-row">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-3/5 h-[300px] md:h-[400px] relative"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0668007446396!2d135.52577692935894!3d34.67286110000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e0d25b40a7e7%3A0x3fe8b1f0eaec7a04!2z5aSn6Ziq5bqc5aSn6Ziq5biC5aSp546L5a-65Y2X546J6YCg5YWD55S677yW4oiS77yV!5e0!3m2!1sja!2sjp!4v1713273606815!5m2!1sja!2sjp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="玉造ダンススタジオBeyond 地図"
                className="rounded-lg"
              ></iframe>
              <div className="absolute bottom-4 right-4">
                <a
                  href="https://maps.app.goo.gl/Ld5Eo1Eo1Eo1Eo1E6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#005BAC] text-xs px-3 py-2 rounded-full shadow-md hover:bg-[#005BAC] hover:text-white transition-colors duration-300 flex items-center"
                >
                  <span>拡大地図を表示</span>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full lg:w-2/5 p-5 md:p-8"
            >
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-[#005BAC] border-b border-gray-100 pb-2">
                アクセス情報
              </h3>

              <div className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-[#005BAC] mr-3 md:mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1 md:mb-2 text-gray-800">住所</h4>
                    <p className="text-gray-700 text-sm md:text-base">
                      〒543-0071
                      <br />
                      大阪府大阪市天王寺区玉造元町６−５
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Train className="w-5 h-5 text-[#005BAC] mr-3 md:mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1 md:mb-2 text-gray-800">交通手段</h4>
                    <p className="text-gray-700 text-sm md:text-base">
                      大阪メトロ 玉造駅から徒歩2分
                      <br />
                      JR環状線 玉造駅から徒歩5分
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-[#005BAC] mr-3 md:mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1 md:mb-2 text-gray-800">営業時間</h4>
                    <p className="text-gray-700 text-sm md:text-base">
                      24時間営業
                      <br />
                      ※予約状況によります
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-[#005BAC] mr-3 md:mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1 md:mb-2 text-gray-800">お問い合わせ</h4>
                    <p className="text-gray-700 text-sm md:text-base">LINE予約のみ</p>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 text-center">
                  <a
                    href="https://maps.app.goo.gl/Ld5Eo1Eo1Eo1Eo1E6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button text-sm inline-block px-5 py-2.5 md:px-6 md:py-3 rounded-lg bg-[#005BAC] text-white hover:bg-[#004a8c] transition-colors duration-300 touch-manipulation"
                  >
                    Googleマップで見る
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <SectionDivider position="bottom" />
    </section>
  )
}
