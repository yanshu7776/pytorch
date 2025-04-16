// Navbarコンポーネントを修正して、ホームリンクをクリックしたときにLoadingAnimationを表示する
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import LoadingAnimation from "./loading-animation"

// ナビゲーションリンクを現在のコンテンツ構造に合わせて更新
const navLinks = [
  { name: "ホーム", href: "/" },
  { name: "スタジオ紹介", href: "#info" },
  { name: "スタジオ設備", href: "#features" },
  { name: "ギャラリー", href: "#gallery" },
  { name: "アクセス", href: "#access" },
  { name: "よくある質問", href: "#faq" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // スクロール処理を改善
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // 外部リンクの場合はデフォルトの動作を許可（新しいタブで開く）
    if (href.startsWith("https://")) {
      return
    }

    e.preventDefault()
    setIsOpen(false)

    // ホームへのリンクの場合はトップにスクロールしてローディングアニメーションを表示
    if (href === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      // LoadingAnimationを表示
      setShowLoading(true)

      return
    }

    // ハッシュリンクの場合は対応する要素にスクロール
    const targetId = href.replace("#", "")
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      // ヘッダーの高さを考慮したオフセットを計算
      const headerHeight = 80 // ヘッダーの高さを適宜調整
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  }

  // アニメーションバリアント
  const menuVariants = {
    closed: {
      opacity: 0,
      clipPath: "circle(0% at calc(100% - 40px) 40px)",
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      clipPath: "circle(150% at calc(100% - 40px) 40px)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.07,
        delayChildren: 0.2,
      },
    },
  }

  const linkVariants = {
    closed: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  // スタイルを画像のデザインに合わせてシンプルに変更
  return (
    <>
      {/* ローディングアニメーション */}
      {showLoading && (
        <LoadingAnimation
          forceShow={true}
          onAnimationComplete={() => setShowLoading(false)}
          customMessage="Just space, nothing else."
        />
      )}

      <header
        className={cn(
          "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500",
          scrolled ? "bg-white shadow-lg py-3" : "bg-gray-100 py-5",
        )}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center z-10" onClick={(e) => handleLinkClick(e, "/")}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-12 w-40 md:h-14 md:w-48"
              >
                <Image
                  src="/images/logo-new.jpeg"
                  alt="Beyond Dance Studio Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </a>

            {/* Desktop Navigation - シンプルな横並びメニュー */}
            <nav className="hidden md:flex items-center space-x-8 z-10">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <a
                    href={link.href}
                    className={cn(
                      "text-base font-medium transition-all duration-300 hover:text-[#4facfe]",
                      scrolled ? "text-gray-800" : "text-gray-800",
                    )}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.name}
                  </a>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <a
                  href="https://spacemarket.com/p/HDNuvkO2oN95p2Dp"
                  className="inline-flex items-center px-6 py-2.5 rounded-md bg-[#4facfe] text-white hover:bg-[#4facfe]/90 transition-all duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  予約をする
                </a>
              </motion.div>
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden z-10 w-10 h-10 flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="text-gray-900" size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="text-gray-900" size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation - Full Screen */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden fixed inset-0 bg-white z-40 flex items-center justify-center"
            >
              <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center h-full">
                {navLinks.map((link, index) => (
                  <motion.div key={link.name} variants={linkVariants} className="my-3">
                    <a
                      href={link.href}
                      className="text-gray-800 hover:text-[#4facfe] py-3 text-2xl font-medium tracking-wide block text-center"
                      onClick={(e) => handleLinkClick(e, link.href)}
                    >
                      {link.name}
                    </a>
                  </motion.div>
                ))}
                <motion.div variants={linkVariants} className="mt-8">
                  <a
                    href="https://spacemarket.com/p/HDNuvkO2oN95p2Dp"
                    onClick={(e) => handleLinkClick(e, "#reservation")}
                    className="inline-flex items-center px-8 py-3 rounded-md bg-[#4facfe] text-white hover:bg-[#4facfe]/90 transition-all duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    予約をする
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
