"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LineRegistration() {
  return (
    <section id="line" className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-amber-400 text-amber-950 hover:bg-amber-500">限定特典</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">LINE登録特典</h2>
          <div className="w-20 h-1 bg-white mx-auto mb-6"></div>
          <p className="text-lg max-w-3xl mx-auto">公式LINEに登録して、お得な特典をゲットしましょう！</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-6">今すぐ登録で特典をゲット！</h3>
            <div className="space-y-6">
              <Card className="border-none bg-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-bold text-xl mb-2">特典1: 初回利用30%OFF</h4>
                  <p>LINE登録後、初めてのスタジオ利用が30%OFFになります。 お友達と一緒に利用すれば、さらにお得に！</p>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-bold text-xl mb-2">特典2: 会員限定イベント招待</h4>
                  <p>プロダンサーによるワークショップや交流会など、 LINE会員限定のイベントにご招待します。</p>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="font-bold text-xl mb-2">特典3: 予約優先権</h4>
                  <p>人気の時間帯も、LINE会員なら優先的に予約が可能。 満室になる前に確実に押さえられます。</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white p-8 rounded-lg shadow-lg mb-8 w-64 h-64 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="LINE QRコード"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <p className="text-center mb-6">
              QRコードをスキャンするか、
              <br />
              下のボタンからLINE友達追加
            </p>

            <Button className="bg-[#06C755] hover:bg-[#05a748] text-white border-none w-full max-w-xs">
              LINE友達追加
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
