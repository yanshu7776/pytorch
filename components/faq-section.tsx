"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
// FormattedTextコンポーネントをインポート
import FormattedText from "@/components/formatted-text"

export default function FaqSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
    }
  }

  const faqs = [
    {
      question: "予約はどのように行えばいいですか？",
      answer: (
        <div>
          <p className="text-sm text-left">はい、可能です。詳細は下記ページの「予約について」をご覧ください。</p>
          <div className="bg-gray-50 p-3 rounded-md mt-3 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start">
              <div className="relative w-full sm:w-24 h-40 sm:h-20 flex-shrink-0 overflow-hidden rounded-md mb-3 sm:mb-0">
                <Image src="/images/studio-1.jpeg" alt="予約フォーム" fill className="object-cover" />
              </div>
              <div className="sm:ml-3">
                <h4 className="font-medium text-gray-900 mb-1 text-sm">ご予約フォーム | レンタルスタジオ Beyond</h4>
                <p className="text-xs text-gray-600 text-left">
                  ご希望の時間帯が空いていましたら、すぐにご予約、利用可能です。下のご予約フォームにてご予約下さい。ポータルサイト経由でもご予約は可能ですが、本サイトからのご予約...
                </p>
                <div className="mt-1 text-xs text-right text-gray-500">レンタルスタジオ Beyond</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      question: "ヒールを使っての利用は可能ですか？",
      answer: (
        <div>
          <p className="text-sm text-left">
            はい、可能です。ただし床が傷つかないよう
            <Link href="#" className="text-[#005BAC] hover:underline">
              ヒールカバー
            </Link>
            を必ず付けてご利用ください。怪我の防止にもつながります。
          </p>
        </div>
      ),
    },
    {
      question: "予約のキャンセルはできますか？",
      answer: (
        <div>
          <p className="text-sm text-left">
            はい、可能です。ただしタイミングによって下記のキャンセル手数料が発生します。
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li>15日前までのキャンセル：利用料金の5%（※回数券の場合無料。回数券が返却されます）</li>
            <li>14〜8日前のキャンセル：利用料金の25%</li>
            <li>7〜3日前のキャンセル：利用料金の50%</li>
            <li>2日前〜当日のキャンセル：利用料金の100%</li>
          </ul>
        </div>
      ),
    },
    {
      question: "領収書は発行できますか？",
      answer: (
        <div>
          <p className="text-sm text-left">
            はい、可能です。ご利用後にメールにてご連絡いただければ、PDFで領収書を発行いたします。
          </p>
        </div>
      ),
    },
    {
      question: "駐車場はありますか？",
      answer: (
        <div>
          <p className="text-sm text-left">
            備え付けの駐車場はないですが、最寄りのパーキングまで徒歩1分です。こちらからご確認いただけます：
            <Link
              href="https://maps.app.goo.gl/QPcDKx3uwEzqtLHz8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#005BAC] hover:underline"
            >
              Google Maps
            </Link>
          </p>
        </div>
      ),
    },
    {
      question: "飲食物の持ち込みは可能ですか？",
      answer: (
        <div>
          <p className="text-sm text-left">
            はい、飲食物の持ち込みはOKです。ただし、ゴミはお持ち帰りいただくようお願いいたします。
          </p>
        </div>
      ),
    },
    {
      question: "更衣室やシャワーはありますか？",
      answer: (
        <div>
          <p className="text-sm text-left">
            更衣室はありますが、シャワーはありません。更衣室は男女共用となっておりますので、譲り合ってご利用ください。
          </p>
        </div>
      ),
    },
    {
      question: "何人から利用できますか？",
      answer: (
        <div>
          <p className="text-sm text-left">
            1名様からご利用いただけます。最大15名様までご利用可能です。大人数でのご利用の場合は、事前にご連絡ください。
          </p>
        </div>
      ),
    },
  ]

  return (
    <section id="faq" className="section-block bg-[#FAFAFA]">
      <div className="container-wrapper">
        <div className="max-w-3xl mx-auto">
          {/* タイトル部分 */}
          <div className="flex items-center justify-center mb-10">
            <div className="h-px bg-[#005BAC]/30 w-20 mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#005BAC]">よくある質問</h2>
            <div className="h-px bg-[#005BAC]/30 w-20 ml-4"></div>
          </div>

          {/* FAQ項目 */}
          <div className="content-card rounded-xl">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-4">
                  {/* 質問 */}
                  <div className="flex cursor-pointer" onClick={() => toggleExpand(index)}>
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-gray-200 rounded-sm">
                      <span className="text-lg font-bold text-[#005BAC]">Q</span>
                    </div>
                    <div className="ml-3 flex-grow">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 pt-2">{faq.question}</h3>
                    </div>
                  </div>

                  {/* 回答 */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: expandedIndex === index ? "auto" : 0,
                      opacity: expandedIndex === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="flex mt-3">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-blue-200 rounded-sm bg-blue-50">
                        <span className="text-lg font-bold text-[#005BAC]">A</span>
                      </div>
                      <div className="ml-3 flex-grow text-base leading-loose space-y-6">
                        {typeof faq.answer === "string" ? (
                          <FormattedText text={faq.answer} className="text-sm text-left" />
                        ) : (
                          faq.answer
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* 追加情報 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              その他ご不明な点がございましたら、お気軽に
              <Link href="#contact" className="text-[#005BAC] hover:underline mx-1">
                お問い合わせ
              </Link>
              ください。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
