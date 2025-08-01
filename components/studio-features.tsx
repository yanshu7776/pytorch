"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"

export default function StudioFeatures() {
  return (
    <section id="features" className="py-20 bg-[#f8f9fa]">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-[#4facfe] w-16"></div>
              <h2 className="text-3xl font-bold mx-4 text-gray-800">当スタジオが選ばれる理由</h2>
              <div className="h-px bg-[#4facfe] w-16"></div>
            </div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              プロ仕様の設備を完備した、ダンス練習に最適な環境をご提供します
            </p>
          </motion.div>

          {/* 3カラムの特徴紹介 */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* 特徴1: 清潔できれい */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-64 w-full">
                <Image src="/images/studio-1.jpeg" alt="清潔できれいなスタジオ" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center text-gray-800">清潔できれい</h3>
                <p className="text-gray-700 text-center mb-4">
                  最新のリフォームで生まれ変わった、清潔感あふれるスタジオです。
                </p>
                <p className="text-gray-700 text-center">
                  スタッフによる定期的な清掃、ロボット掃除機による毎日清掃によって、常に清潔を保っています。
                </p>
              </div>
            </motion.div>

            {/* 特徴2: 充実した設備 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-64 w-full">
                <Image src="/images/studio-blue-led.jpeg" alt="充実した設備" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center text-gray-800">充実した設備</h3>
                <p className="text-gray-700 text-center mb-4">3.6mの大型鏡に、気分を盛り上げるLEDライト完備</p>
                <p className="text-gray-700 text-center">
                  ヨガマット4個、ヨガブロック8個、その他備品を誰でも自由にお使いいただけます。
                </p>
                <p className="text-gray-700 text-center mt-4">更衣室・トイレもあり快適にご利用頂けます。</p>
              </div>
            </motion.div>

            {/* 特徴3: リーズナブル */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-64 w-full">
                <Image src="/images/studio-2.jpeg" alt="リーズナブルな料金" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center text-gray-800">リーズナブル</h3>
                <p className="text-gray-700 text-center mb-4">
                  245円〜/30分というお手頃価格から、高品質なスタジオを利用できます。
                </p>
                <p className="text-gray-700 text-center">
                  <span className="relative inline-block">
                    <span className="relative z-10">定期利用をご利用いただくと</span>
                    <span className="absolute bottom-0 left-0 w-full h-[10px] bg-[#4facfe]/20"></span>
                  </span>
                  <br />
                  更にお得にご利用可能です。
                </p>
              </div>
            </motion.div>
          </div>

          {/* スタジオ設備詳細 */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="photos">写真ギャラリー</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-md p-8 mb-8"
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src="/images/studio-1.jpeg"
                      alt="玉造ダンススタジオ - 全面鏡張りの広々としたスタジオ"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-800">充実の設備</h3>
                    <p className="text-gray-700 mb-6">
                      天王寺区で格安のレンタルスタジオをお探しなら、玉造駅から徒歩2分の当スタジオがおすすめです。
                      35㎡の広々とした空間で、グループレッスンやチーム練習に最適。24時間いつでも利用可能で当日予約もOKです。
                    </p>
                    <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-[#4facfe] mb-6">
                      <p className="text-gray-700 mb-2">
                        <span className="font-bold text-blue-800">初心者向けの広いミラー</span>（W810cm×H180cm）と、
                        <span className="font-bold text-blue-800">SNS配信用の高輝度LED照明</span>を完備しています。
                      </p>
                      <p className="text-gray-700">
                        ダンス練習はもちろん、ライブ前のリハーサルや動画撮影にも
                        <span className="relative inline-block">
                          <span className="relative z-10 font-bold">最適な環境</span>
                          <span className="absolute bottom-0 left-0 w-full h-[8px] bg-yellow-200/60"></span>
                        </span>
                        を整えています。
                      </p>
                    </div>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-[#4facfe] flex-shrink-0 mt-0.5" />
                        <span>全面鏡張りの壁（W810cm×H180cm）- プロ仕様の広々ミラー</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-[#4facfe] flex-shrink-0 mt-0.5" />
                        <span>Bluetooth®搭載スピーカー - 高音質で音楽練習に最適</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-[#4facfe] flex-shrink-0 mt-0.5" />
                        <span>高輝度LED照明4台 - SNS映えする動画撮影が可能</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="photos">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { src: "/images/studio-1.jpeg", title: "広々としたスタジオ", desc: "全面鏡張りの空間" },
                  { src: "/images/studio-2.jpeg", title: "木目調の壁と鏡", desc: "清潔感のある空間" },
                  { src: "/images/studio-3.jpeg", title: "自然光が入る窓", desc: "明るく開放的な空間" },
                  { src: "/images/studio-4.jpeg", title: "スタジオ全景", desc: "充実した設備が整った練習環境" },
                  { src: "/images/studio-5.jpeg", title: "カラフルLED照明", desc: "様々な色に変化する照明" },
                  { src: "/images/studio-6.jpeg", title: "明るい照明", desc: "プロフェッショナルな環境" },
                  { src: "/images/studio-7.jpeg", title: "更衣スペース", desc: "プライバシーに配慮した空間" },
                  { src: "/images/studio-8.jpeg", title: "マットレス", desc: "ヨガやピラティスにも最適" },
                  { src: "/images/studio-blue-led.jpeg", title: "ブルーLED照明", desc: "幻想的な雰囲気の演出" },
                  { src: "/images/studio-red-led.jpeg", title: "レッドLED照明", desc: "情熱的な雰囲気の演出" },
                  { src: "/images/studio-kitchen.jpeg", title: "テレビ", desc: "映像確認や参考動画の視聴に便利" },
                  { src: "/images/studio-speaker.jpeg", title: "BOSE製スピーカー", desc: "高品質な音響システム" },
                  { src: "/images/studio-stools.jpeg", title: "椅子", desc: "休憩や観覧用の座席" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.src || "/placeholder.svg"}
                        alt={`スタジオ設備 - ${item.title}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* 設備スペック表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <h3 className="text-lg font-bold text-center text-white bg-[#4facfe] py-3">スタジオ設備スペック</h3>

              {/* フロアマップ画像を追加 */}
              <div className="p-6">
                <div className="relative w-full h-[500px] mb-6">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/E1FAE731-EC5D-440F-A036-6E2085994AA4-WvRffGjeEgx0YqlYd1lKN9xKYUvGaH.png"
                    alt="スタジオフロアマップ"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                  />
                </div>
                <p className="text-gray-700 text-center mb-6">
                  スタジオのフロアマップです。広々とした練習スペースと充実した設備をご確認いただけます。
                </p>
              </div>

              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 font-medium text-center w-1/3">面積</td>
                        <td className="py-3 px-4">35㎡</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 font-medium text-center">天井高</td>
                        <td className="py-3 px-4">2.25m</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 font-medium text-center">床</td>
                        <td className="py-3 px-4">リノリウム</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 font-medium text-center">鏡</td>
                        <td className="py-3 px-4">W810cm×H180cm</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 font-medium text-center">照明</td>
                        <td className="py-3 px-4">高輝度LED４台</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 font-medium text-center">音響</td>
                        <td className="py-3 px-4">Bluetooth®搭載スピーカー</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 font-medium text-center">更衣スペース</td>
                        <td className="py-3 px-4">あり</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 bg-gray-50 font-medium text-center">無料備品</td>
                        <td className="py-3 px-4">
                          Bluetooth®搭載スピーカー
                          <br />
                          椅子（10脚）
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 予約ボタン */}
          <div className="mt-12 text-center">
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
