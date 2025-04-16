"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingAnimationProps {
  forceShow?: boolean
  onAnimationComplete?: () => void
  customMessage?: string
}

export default function LoadingAnimation({
  forceShow = false,
  onAnimationComplete,
  customMessage,
}: LoadingAnimationProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初回ロード時または強制表示時
    if (forceShow) {
      setIsLoading(true)

      // 強制表示の場合は短めの時間で非表示にする
      const timer = setTimeout(() => {
        setIsLoading(false)
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }, 2000)

      return () => clearTimeout(timer)
    } else {
      // 通常の初回ロード時
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [forceShow, onAnimationComplete])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <LogoAnimation />
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full w-64 mx-auto"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-4 text-white text-lg"
            >
              {customMessage || "Just space, nothing else."}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LogoAnimation() {
  return (
    <motion.div className="relative w-32 h-32 mx-auto">
      {/* Outer circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 360 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-4 border-blue-400"
      />

      {/* Inner circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-white font-bold text-2xl"
        >
          BD
        </motion.span>
      </motion.div>

      {/* Animated dots around the circle */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 1, 0], x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{
            delay: 0.1 * i,
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute w-3 h-3 rounded-full bg-blue-300"
          style={{
            top: `${50 - 40 * Math.sin(i * (Math.PI / 4))}%`,
            left: `${50 - 40 * Math.cos(i * (Math.PI / 4))}%`,
          }}
        />
      ))}
    </motion.div>
  )
}
