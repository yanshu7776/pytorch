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
            <span className="marker block sm:inline-block">初めての方でも安心</span>
            <span className="block sm:inline-block mt-1 sm:mt-0">してご利用いただけます</span>
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#005BAC]">まずは体験予約から</h2>
          <p className="text-sm md:text-base text-gray-700 mb-8">
            <span className="block sm:inline">玉造駅から徒歩2分の好立地、</span>
            <span className="block sm:inline">24時間利用可能なダンススタジオ。</span>
            <span className="block mt-2 sm:mt-0">
              プロ仕様の設備と格安料金で、あなたのダンスライフをサポートします。
            </span>
            <span className="block mt-2 sm:mt-0">当日予約も可能ですので、お気軽にお問い合わせください。</span>
          </p>

          <Link
            href="https://www.spacemarket.com/spaces/beyond_tamatsukuri/?promotion_link=true"
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
