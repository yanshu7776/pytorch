"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import SectionDivider from "./section-divider"

export default function CTASection() {
  return (
    <section className="relative py-12 md:py-16 bg-white/90">
      {/* Top wave divider */}
      <SectionDivider position="top" flip={true} />

      <div className="container-wrapper relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="cta-lead mb-4">
            <span className="marker">初めての方でも安心</span>してご利用いただけます
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#005BAC]">まずは体験予約から</h2>
          <p className="text-sm md:text-base text-gray-700 mb-8">
            玉造駅から徒歩2分の好立地、24時間利用可能なダンススタジオ。
            プロ仕様の設備と格安料金で、あなたのダンスライフをサポートします。
            当日予約も可能ですので、お気軽にお問い合わせください。
          </p>

          <Link
            href="https://spacemarket.com/p/HDNuvkO2oN95p2Dp"
            className="cta-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            予約をする
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Bottom wave divider */}
      <SectionDivider position="bottom" />
    </section>
  )
}
