"use client"

import type { ReactNode } from "react"

interface FormattedTextAdvancedProps {
  children: ReactNode
  className?: string
}

export default function FormattedTextAdvanced({ children, className = "" }: FormattedTextAdvancedProps) {
  // 子要素をそのまま表示するシンプルな実装
  // 複雑な処理は避けてエラーを防止
  return <div className={className}>{children}</div>
}
