"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Clock, MapPin, Users, CreditCard } from "lucide-react"

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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">玉造ダンススタジオBeyond</h2>
            <p className="text-xl text-gray-700 mb-6">ダンスやヨガに最適なレンタルスペース</p>

            <div className="emphasis-box">
              <p className="mobile-text-spacing">
                <strong className="mobile-high-contrast">天王寺区で最も便利なレンタルスタジオ。</strong>
                <br className="md:hidden" />
                <span className="inline-marker">玉造駅から徒歩2分の好立地</span>
                <span className="md:hidden mobile-break"></span>
                で、当日予約も可能なダンス練習場です。
              </p>
            </div>
          </motion.div>

          {/* 基本情報カード */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
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
              <p className="text-gray-600 mobile-text-spacing">当日予約可能なダンススタジオ</p>
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
              <p className="text-gray-600 mobile-text-spacing">玉造駅から徒歩2分の好立地</p>
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
              <p className="text-gray-600 mobile-text-spacing">大阪で格安のダンスレンタル</p>
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
              <h3 className="text-2xl font-bold mx-4 text-gray-800">スタジオ詳細</h3>
              <div className="h-px bg-[#4facfe] w-16"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center mb-4">
                  <Clock className="w-5 h-5 text-[#4facfe] mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">営業時間</h4>
                </div>
                <div className="highlight-box">
                  <p className="text-gray-700 mb-6 pl-8 mobile-text-spacing">
                    <strong>24時間営業</strong>
                    <br />
                    ※年中無休・当日予約可能
                  </p>
                </div>

                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-[#4facfe] mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">アクセス</h4>
                </div>
                <div className="highlight-box">
                  <p className="text-gray-700 mb-6 pl-8 mobile-text-spacing">
                    〒543-0071
                    <br />
                    <strong>大阪府大阪市天王寺区玉造元町６−５</strong>
                    <br />
                    <em className="not-italic font-medium">玉造駅から徒歩2分</em>
                  </p>
                </div>

                <div className="flex items-center mb-4">
                  <CreditCard className="w-5 h-5 text-[#4facfe] mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">料金プラン</h4>
                </div>
                <div className="highlight-box">
                  <p className="text-gray-700 mb-6 pl-8 mobile-text-spacing">
                    平日1時間：<strong>¥1,500〜</strong>
                    <br />
                    土日祝1時間：<strong>¥1,800〜</strong>
                    <br />
                    <span className="text-[#4facfe] font-medium">格安ダンスレンタル・長時間割引あり</span>
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 text-[#4facfe] mr-3" />
                  <h4 className="text-lg font-bold text-gray-800">対象者</h4>
                </div>
                <div className="emphasis-box">
                  <p className="emphasis-box-title">「玉造で始める、自由な表現の場」</p>
                  <p className="text-gray-700 mb-6 mobile-text-spacing">
                    玉造ダンススタジオBeyondは、
                    <strong className="important-text">初心者からプロまで対応</strong>
                    <span className="md:hidden mobile-break"></span>
                    する多目的レンタルスペース。
                    <span className="md:hidden mobile-break"></span>
                    ダンス・ヨガ・動画撮影など、
                    <span className="md:hidden mobile-break"></span>
                    クリエイティブな活動を支える環境を提供します。
                  </p>
                </div>

                <div className="bg-[#f8f9fa] p-5 rounded-lg mb-6">
                  <h5 className="font-bold text-[#4facfe] mb-4 text-center mobile-heading">3つの特徴</h5>
                  <ul className="feature-list">
                    <li className="mobile-list-item">
                      <strong className="mobile-high-contrast">即日予約可能</strong>
                      <p className="text-xs text-gray-600 mt-1">当日の空室状況をリアルタイム表示</p>
                    </li>

                    <li className="mobile-list-item">
                      <strong className="mobile-high-contrast">完全防音設計</strong>
                      <p className="text-xs text-gray-600 mt-1">深夜練習も近隣への配慮</p>
                    </li>

                    <li className="mobile-list-item">
                      <strong className="mobile-high-contrast">プロ仕様設備</strong>
                      <p className="text-xs text-gray-600 mt-1">全面ミラー（W720cm×H200cm）・Bluetoothスピーカー</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 利用用途 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#f8f9fa] rounded-xl p-8 mb-12"
          >
            <h4 className="text-xl font-bold mb-6 text-center text-gray-800">利用用途</h4>
            <p className="text-gray-700 text-center mb-4 mobile-text-spacing">
              ダンス・ヨガ・ピラティス・トレーニング・ライブ配信・ダンス動画撮影など様々な用途でご利用いただけます。
            </p>
            <p className="text-gray-700 text-center mobile-text-spacing">
              <span className="inline-marker">定期利用をご利用いただくと</span>
              <span className="mobile-break"></span>
              <strong>更にお得にご利用可能です。</strong>
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
            <h4 className="text-lg font-bold mb-6 text-center text-gray-800 mobile-heading">
              玉造ダンススタジオBeyondの特徴
            </h4>
            <div className="emphasis-box">
              <p className="text-gray-700 mb-4 text-center mobile-text-spacing">
                <strong className="mobile-high-contrast">玉造駅から徒歩2分</strong>
                のアクセス抜群の立地に位置する当スタジオは、
                <strong className="mobile-high-contrast">天王寺区で人気のレンタルスタジオ</strong>です。
                <span className="mobile-break"></span>
                <strong className="mobile-high-contrast">当日予約可能なダンススタジオ</strong>として、急な練習にも対応。
                <span className="mobile-break"></span>
                <strong className="mobile-high-contrast">格安ダンスレンタル</strong>
                料金で、長時間の利用もリーズナブルにご利用いただけます。
              </p>
              <p className="text-gray-700 text-center mobile-text-spacing">
                <strong className="mobile-high-contrast">初心者向けダンススタジオ</strong>としての設備も充実しており、
                初めての方でも安心して利用できる環境を整えています。
                <span className="mobile-break"></span>
                <strong className="mobile-high-contrast">玉造のダンス練習場</strong>をお探しなら、
                ぜひBeyondをご利用ください。
              </p>
            </div>
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
