"use client"
import PageTransition from "@/components/page-transition"
import LoadingAnimation from "@/components/loading-animation"
import DepthHero from "@/components/depth-hero"
import LocationSection from "@/components/location-section"
import StudioInfo from "@/components/studio-info"
import StudioFeatures from "@/components/studio-features"
import ServiceSection from "@/components/service-section"
import AccessMap from "@/components/access-map"
import FaqSection from "@/components/faq-section"
import PriceTable from "@/components/price-table"
import SectionDivider from "@/components/section-divider"
import Studio3DShowcase from "@/components/studio-3d-showcase"
import DynamicClipPathGallery from "@/components/dynamic-clip-path-gallery"
import InteractiveFilterShowcase from "@/components/interactive-filter-showcase"
import { Calendar, Clock, CreditCard, CheckCircle2, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        {/* Loading Animation */}
        <LoadingAnimation />

        {/* Enhanced Hero Section with Depth */}
        <DepthHero />

        {/* Studio Info Section - 順番を変更して最初に表示 */}
        <div className="relative" id="info">
          <StudioInfo />
          <SectionDivider position="bottom" />
        </div>

        {/* Service Section */}
        <ServiceSection />

        {/* Location Section */}
        <div className="relative">
          <LocationSection />
          <SectionDivider position="bottom" />
        </div>

        {/* Studio Features */}
        <div className="relative" id="features">
          <StudioFeatures />
          <SectionDivider position="bottom" />
        </div>

        {/* 3D Showcase Section - 追加 */}
        <Studio3DShowcase />

        {/* スタジオの表情セクション - 追加 */}
        <section id="gallery">
          <DynamicClipPathGallery />
        </section>

        {/* フィルター効果演出セクション - 追加 */}
        <InteractiveFilterShowcase />

        {/* Price Table */}
        <section id="price" className="section-block bg-[#FAFAFA] relative">
          <SectionDivider position="top" flip={true} />
          <div className="relative">
            <SectionDivider position="top" flip={true} />
            <div className="container-wrapper relative z-10">
              <div className="text-center mb-10">
                <h2 className="section-heading">料金プラン</h2>
                <p className="studio-description">リーズナブルな料金で、ダンスの練習に最適な環境をご提供します。</p>
              </div>
              <div className="content-card rounded-xl">
                <PriceTable />
              </div>
            </div>
            <SectionDivider position="bottom" />
          </div>
        </section>

        {/* Access Map */}
        <section id="access">
          <AccessMap />
        </section>

        {/* FAQ Section */}
        <div className="relative" id="faq">
          <FaqSection />
          <SectionDivider position="bottom" />
        </div>

        {/* Reservation Section - スペースマーケットへのリンクに変更 - デザイン改善 */}
        <section id="reservation" className="section-block relative overflow-hidden">
          {/* 背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3a7bd5] to-[#00d2ff] opacity-90 z-0"></div>

          {/* 装飾要素 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

          {/* パーティクル効果 */}
          <div className="absolute inset-0 z-0 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 10 + 2}px`,
                  height: `${Math.random() * 10 + 2}px`,
                  opacity: Math.random() * 0.5 + 0.3,
                  animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                }}
              />
            ))}
          </div>

          <div className="container-wrapper relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* ヘッダーセクション */}
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-4">
                  簡単3ステップ
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">スペースマーケットで予約する</h2>
                <div className="w-24 h-1 bg-white/50 mx-auto mb-6"></div>
                <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                  玉造ダンススタジオBeyondは、スペースマーケットでの予約に対応しています。
                  24時間いつでも簡単に予約可能で、当日予約もOK！
                </p>
              </div>

              {/* 予約ステップ */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    icon: <Calendar className="w-8 h-8" />,
                    title: "日時を選択",
                    description: "カレンダーから希望の日時を選んで、利用時間を設定します。",
                  },
                  {
                    icon: <CreditCard className="w-8 h-8" />,
                    title: "簡単決済",
                    description: "クレジットカードやコンビニ決済など、多様な支払い方法に対応。",
                  },
                  {
                    icon: <CheckCircle2 className="w-8 h-8" />,
                    title: "予約完了",
                    description: "予約確認メールが届き、当日はパスワードでスムーズに入室。",
                  },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white text-center">{step.title}</h3>
                    <p className="text-white/80 text-center">{step.description}</p>
                  </div>
                ))}
              </div>

              {/* 予約カード */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                <div className="md:flex">
                  {/* 左側：画像 */}
                  <div className="md:w-2/5 relative">
                    <div className="relative h-64 md:h-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#3a7bd5]/80 to-transparent z-10"></div>
                      <div
                        className="absolute inset-0 bg-cover bg-center z-0"
                        style={{ backgroundImage: "url('/images/studio-blue-led.jpeg')" }}
                      ></div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center z-20 p-8">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Beyond Dance Studio</h3>
                        <p className="text-white/90 mb-4">玉造駅から徒歩2分・24時間利用可能</p>
                        <div className="flex items-center text-white/80 text-sm mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>24時間営業・年中無休</span>
                        </div>
                        <div className="flex items-center text-white/80 text-sm">
                          <CreditCard className="w-4 h-4 mr-2" />
                          <span>オンライン決済対応</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右側：予約情報 */}
                  <div className="md:w-3/5 p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">スペースマーケットで予約</h4>
                        <p className="text-white/80">簡単3ステップで即時予約完了</p>
                      </div>
                      <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                        当日予約OK
                      </span>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-white/90">
                        <CheckCircle2 className="w-5 h-5 mr-3 text-green-400" />
                        <span>リアルタイムの空き状況確認</span>
                      </div>
                      <div className="flex items-center text-white/90">
                        <CheckCircle2 className="w-5 h-5 mr-3 text-green-400" />
                        <span>スマホから24時間いつでも予約可能</span>
                      </div>
                      <div className="flex items-center text-white/90">
                        <CheckCircle2 className="w-5 h-5 mr-3 text-green-400" />
                        <span>安心のキャンセルポリシー</span>
                      </div>
                      <div className="flex items-center text-white/90">
                        <CheckCircle2 className="w-5 h-5 mr-3 text-green-400" />
                        <span>レビュー・口コミ確認可能</span>
                      </div>
                    </div>

                    <a
                      href="https://spacemarket.com/p/HDNuvkO2oN95p2Dp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-8 py-4 rounded-xl bg-white text-[#3a7bd5] font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                    >
                      予約をする
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </a>

                    <p className="mt-4 text-sm text-white/70 text-center">※スペースマーケットの予約ページが開きます</p>
                  </div>
                </div>
              </div>

              {/* 追加情報 */}
              <div className="mt-12 text-center">
                <p className="text-white/80 text-sm">
                  ご不明な点がございましたら、お気軽にお問い合わせください。
                  <br />
                  <a
                    href="mailto:info@beyond-dance.jp"
                    className="text-white underline hover:text-white/90 transition-colors"
                  >
                    info@beyond-dance.jp
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* 下部の装飾 */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </section>
      </div>
    </PageTransition>
  )
}
