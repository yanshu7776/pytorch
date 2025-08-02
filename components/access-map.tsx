"use client"

import { motion } from "framer-motion"
import { MapPin, Train } from "lucide-react"
import SectionDivider from "./section-divider"

export default function AccessMap() {
  return (
    <section id="access" className="py-12 md:py-16 relative bg-[#FAFAFA]">
      {/* Top wave divider */}
      <SectionDivider position="top" flip={true} />

      <div className="container-wrapper relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#005BAC]">アクセス</h2>
          <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto">
            大阪メトロ玉造駅から徒歩2分、便利なロケーションです。
          </p>
        </motion.div>

        <div className="content-card rounded-xl overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full md:w-1/2 h-[300px] relative"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.0668128053256!2d135.52416109999998!3d34.6728611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000e0d25b40a7e7%3A0x3fe8b1f0eaec7a04!2z5qCq5byP5Lya56S-44OA44Oz44K544K544K_44K444KqQmV5b25k!5e0!3m2!1sja!2sjp!4v1713264508967!5m2!1sja!2sjp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="玉造ダンススタジオBeyond 地図"
                className="rounded-lg"
              ></iframe>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full md:w-1/2 p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-[#005BAC] border-b border-gray-100 pb-2">アクセス情報</h3>

              <div className="space-y-4 mt-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-[#005BAC] mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">住所</h4>
                    <p className="text-gray-700 text-sm">
                      〒543-0071
                      <br />
                      大阪府大阪市天王寺区玉造元町６−５
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Train className="w-5 h-5 text-[#005BAC] mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">交通手段</h4>
                    <p className="text-gray-700 text-sm">玉造駅から徒歩2分</p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <a
                    href="https://maps.app.goo.gl/eXRH74xcqFWgR6sA8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button text-sm"
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
