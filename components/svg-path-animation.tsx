"use client"
import { motion } from "framer-motion"

export default function SvgPathAnimation() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">ダンスの流れを感じる</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.svg
            viewBox="0 0 800 300"
            className="w-full h-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Background elements */}
            <motion.rect
              x="0"
              y="0"
              width="800"
              height="300"
              rx="20"
              ry="20"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="2"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1 },
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Decorative circles */}
            {[...Array(5)].map((_, i) => (
              <motion.circle
                key={i}
                cx={100 + i * 150}
                cy={150}
                r="10"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                variants={{
                  hidden: { opacity: 0, scale: 0 },
                  visible: { opacity: 1, scale: 1 },
                }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              />
            ))}

            {/* Main dance flow path */}
            <motion.path
              d="M 50,150 C 100,50 200,250 300,150 S 500,50 600,150 S 700,250 750,150"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1 },
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Dancer silhouette */}
            <motion.path
              d="M400,200 C410,180 420,160 410,140 C405,130 395,125 385,130 C375,135 370,150 375,160 C380,170 390,175 400,170 C410,165 415,150 410,140 M400,200 C390,180 380,160 390,140 C395,130 405,125 415,130 C425,135 430,150 425,160 C420,170 410,175 400,170 C390,165 385,150 390,140"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1 },
              }}
              transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            />

            {/* Text elements */}
            <motion.text
              x="400"
              y="250"
              textAnchor="middle"
              fill="#1e3a8a"
              fontWeight="bold"
              fontSize="24"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              BEYOND DANCE
            </motion.text>
          </motion.svg>
        </div>
      </div>
    </div>
  )
}
