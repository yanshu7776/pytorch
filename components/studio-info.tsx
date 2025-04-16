"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Clock, MapPin, Users, CreditCard } from "lucide-react"
import FormattedText from "@/components/formatted-text"

export default function StudioInfo() {
  return (
    <section id="info" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* タイトルとサブタイトル */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">玉造ダンススタジオBeyond</h2>
            <p className="text-base sm:text-lg leading-loose mb-6 max-w-2xl mx-auto">
              ダンスやヨガに最適なレンタルスペース
            </p>

            <FormattedText
              text="天王寺区で最も便利なレンタルスタジオ。玉造駅から徒歩2分の好立地で、当日予約も可能なダンス練習場です。"
              className="text-gray-700 mb-6"
            />
          </motion.div>

          {/* 基本情報カード */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 space-y-6 md:space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">24時間営業</h3>
              <p className="text-gray-600">当日予約可能なダンススタジオ</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">駅近アクセス</h3>
              <p className="text-gray-600">玉造駅から徒歩2分の好立地</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">格安料金</h3>
              <p className="text-gray-600">大阪で格安のダンスレンタル</p>
            </motion.div>
          </div>

          {/* スタジオ詳細情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-md p-8 mb-12"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="h-px bg-[#4facfe] w-16"></div>
              <h3 className="text-2xl font-bold mx-4 text-gray-800 whitespace-nowrap">スタジオ詳細</h3>
              <div className="h-px bg-[#4facfe] w-16"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-[#4facfe] mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">営業時間</h4>
                </div>
                <p className="text-gray-700 mb-6 pl-8">
                  24時間営業
                  <br />
                  ※年中無休・当日予約可能
                </p>

                <div className="flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-[#4facfe] mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">アクセス</h4>
                </div>
                <p className="text-gray-700 mb-6 pl-8">
                  〒543-0071
                  <br />
                  大阪府大阪市天王寺区玉造元町６−５
                  <br />
                  玉造駅から徒歩2分
                </p>

                <div className="flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5 text-[#4facfe] mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">料金プラン</h4>
                </div>
                <p className="text-gray-700 mb-6 pl-8">
                  平日1時間：¥1,500〜
                  <br />
                  土日祝1時間：¥1,800〜
                  <br />
                  <span className="text-[#4facfe] font-medium">格安ダンスレンタル・長時間割引あり</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-[#4facfe] mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">対象者</h4>
                </div>
                <div className="text-gray-700 mb-6 pl-8">
                  <span className="relative inline-block mb-2 sm:mb-0">
                    <span className="relative z-10 font-bold text-[#4facfe]">「玉造で始める、自由な表現の場」</span>
                    <span className="absolute bottom-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#4facfe]/20 to-[#00f2fe]/20 rounded-full"></span>
                  </span>
                  <br className="hidden sm:inline" />
                  <br className="hidden sm:inline" />
                  <FormattedText text="玉造ダンススタジオBeyondは、初心者からプロまで対応する多目的レンタルスペース。ダンス・ヨガ・動画撮影など、クリエイティブな活動を支える環境を提供します。" />
                </div>

                <div className="bg-[#f8f9fa] p-5 rounded-lg mb-6">
                  <h5 className="font-bold text-[#4facfe] mb-4 text-center">3つの特徴</h5>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-[#4facfe] text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                        1
                      </div>
                      <div className="flex-1">
                        <h6 className="font-bold text-gray-800 text-sm">即日予約可能</h6>
                        <p className="text-xs text-gray-600">当日の空室状況をリアルタイム表示</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-[#4facfe] text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                        2
                      </div>
                      <div className="flex-1">
                        <h6 className="font-bold text-gray-800 text-sm">完全防音設計</h6>
                        <p className="text-xs text-gray-600">深夜練習も近隣への配慮</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-[#4facfe] text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                        3
                      </div>
                      <div className="flex-1">
                        <h6 className="font-bold text-gray-800 text-sm">プロ仕様設備</h6>
                        <p className="text-xs text-gray-600">全面ミラー・Bluetoothスピーカー</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 利用用途 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#f8f9fa] rounded-xl p-8 mb-12"
          >
            <h4 className="text-xl font-bold mb-6 text-center text-gray-800">利用用途</h4>
            <p className="text-gray-700 text-center mb-4">
              ダンス・ヨガ・ピラティス・トレーニング・ライブ配信・ダンス動画撮影など様々な用途でご利用いただけます。
            </p>
            <p className="text-gray-700 text-center">
              <span>天王寺区で最も多目的に使えるレンタルスタジオです。</span>
            </p>
          </motion.div>

          {/* SEOキーワードを含むテキストブロック */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-md p-8 mb-12"
          >
            <h4 className="text-lg font-bold mb-6 text-center text-gray-800">玉造ダンススタジオBeyondの特徴</h4>
            <FormattedText
              text="玉造駅から徒歩2分のアクセス抜群の立地に位置する当スタジオは、天王寺区で人気のレンタルスタジオです。当日予約可能なダンススタジオとして、急な練習にも対応。格安ダンスレンタル料金で、長時間の利用もリーズナブルにご利用いただけます。"
              className="text-gray-700 mb-4 text-center"
            />
            <FormattedText
              text="初心者向けダンススタジオとしての設備も充実しており、初めての方でも安心して利用できる環境を整えています。玉造のダンス練習場をお探しなら、ぜひBeyondをご利用ください。"
              className="text-gray-700 text-center"
            />
          </motion.div>

          {/* 予約ボタン */}
          <div className="text-center">
            <p className="text-base font-medium mb-4">＼ スペースマーケットで簡単予約！30秒でサクッと予約完了 ／</p>
            <Link
              href="https://spacemarket.com/p/HDNuvkO2oN95p2Dp"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              予約をする
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
