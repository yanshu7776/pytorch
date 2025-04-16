"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Calendar, DoorOpen, Sparkles, LogOut, ArrowRight } from "lucide-react"

export default function UsageFlow() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  // アニメーション用のバリアント
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  // 利用の流れステップ
  const steps = [
    {
      number: "Step1",
      title: "予約",
      icon: <Calendar className="w-6 h-6" />,
      image: "/images/reservation.jpg",
      alt: "スマートフォンで予約する様子",
      description: (
        <>
          <p className="mb-3">
            <Link href="#reservation" className="text-blue-700 hover:underline">
              予約フォーム
            </Link>
            からご予約ください。最短1分で簡単にご予約できます。
          </p>
          <p className="mb-3">希望する日時と時間帯を選び、必要な情報を入力して予約を完了します。</p>
          <p>予約が完了したら、予約内容とパスワード等が記載されているご利用案内、利用規約が通知されます。</p>
        </>
      ),
    },
    {
      number: "Step2",
      title: "入室",
      icon: <DoorOpen className="w-6 h-6" />,
      image: "/images/studio-entrance.jpg",
      alt: "スタジオ内部の様子",
      description: (
        <>
          <p className="mb-3">
            利用当日は、スタジオに到着したらキーボックスを開け、中の鍵で扉を開けて入室してください。
          </p>
          <p>
            スタジオに入室したら、予約した時間内で自由に利用できます。ダンス・ヨガ・演劇の練習、リハーサル、撮影、ワークショップなど、用途に合わせてスペースを活用してください。
          </p>
        </>
      ),
    },
    {
      number: "Step3",
      title: "清掃・片付け",
      icon: <Sparkles className="w-6 h-6" />,
      image: "/images/cleaning.jpg",
      alt: "清掃の様子",
      description: (
        <>
          <p className="mb-3">利用時間終了の10分前を目安に、片付けと清掃を行ってください。</p>
          <p className="mb-3">
            当スタジオは裸足のお客様もご利用になられます。お客様全員に快適にご利用頂けるよう、スタジオ利用後は必ずフロアワイパーを使っての床の拭き掃除をお願いします。
          </p>
        </>
      ),
    },
    {
      number: "Step4",
      title: "退室",
      icon: <LogOut className="w-6 h-6" />,
      image: "/images/exit.jpg",
      alt: "スタジオのドア",
      description: (
        <>
          <p className="mb-3">利用時間が終了しましたら、退室してください。</p>
          <p className="mb-3">トラブルの原因にもなりますので、次の利用者のために必ず利用時間内に退室をお願いします。</p>
          <p>ドアの施錠だけでなく、キーボックスの施錠も忘れずにお願いします。</p>
        </>
      ),
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden bg-blue-900/90" id="usage-flow">
      {/* 木目調の背景 */}
      <div className="absolute inset-0 bg-wood-texture opacity-10 z-0"></div>

      {/* 装飾的な背景要素 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full -ml-48 -mb-48"></div>
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          {/* ヘッダーセクション */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-blue-300 text-sm font-medium tracking-widest uppercase mb-2">
              How to Use
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">スタジオご利用の流れ</h2>

            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-300 mx-auto mb-6"></div>

            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              初めての方でも安心してご利用いただけるよう、ご利用の流れをご説明します。
            </p>
          </motion.div>

          {/* ステップカード */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-amber-100 flex flex-col h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* 画像部分 */}
                <div className="relative h-48 overflow-hidden">
                  <Image src={step.image || "/placeholder.svg"} alt={step.alt} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>

                  {/* ステップ番号 */}
                  <div className="absolute top-4 left-4 bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {step.number}
                  </div>
                </div>

                {/* コンテンツ部分 */}
                <div className="p-6 flex-grow bg-white relative">
                  {/* 木目調の微妙な背景 */}
                  <div className="absolute inset-0 bg-wood-texture-light opacity-5 z-0"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 border border-amber-100">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-bold text-blue-900">{step.title}</h3>
                    </div>

                    <div className="text-blue-800 text-sm space-y-2">{step.description}</div>
                  </div>
                </div>

                {/* 矢印（最後のカード以外） */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-30">
                    <div className="bg-blue-700 rounded-full p-2 shadow-lg">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* 注意事項 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-blue-200/20 text-blue-100"
          >
            <h3 className="text-lg font-bold mb-3 text-white">ご利用にあたっての注意事項</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>予約時間を厳守してください。前後の利用者様のご迷惑となります。</li>
              <li>スタジオ内は禁煙です。喫煙は指定の場所でお願いします。</li>
              <li>大音量での音楽再生はご遠慮ください。近隣へのご配慮をお願いします。</li>
              <li>貴重品の管理は各自でお願いします。盗難・紛失について当スタジオは責任を負いかねます。</li>
              <li>施設・設備を破損された場合は、修繕費用をご負担いただく場合があります。</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
