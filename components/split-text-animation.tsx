"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

type SplitTextAnimationProps = {
  text: string
  className?: string
  delay?: number
  duration?: number
  staggerChildren?: number
  once?: boolean
}

export default function SplitTextAnimation({
  text,
  className = "",
  delay = 0,
  duration = 0.05,
  staggerChildren = 0.03,
  once = true,
}: SplitTextAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    } else if (!once) {
      controls.start("hidden")
    }
  }, [isInView, controls, once])

  // Split text into words and characters
  const words = text.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren, delayChildren: delay * i },
    }),
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      animate={controls}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-1">
          {Array.from(word).map((char, charIndex) => (
            <motion.span key={charIndex} className="inline-block" variants={child}>
              {char}
            </motion.span>
          ))}
          {wordIndex !== words.length - 1 && " "}
        </span>
      ))}
    </motion.div>
  )
}
