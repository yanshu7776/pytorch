"use client"

import React from "react"

interface FormattedTextProps {
  text: string
  className?: string
}

export default function FormattedText({ text, className = "" }: FormattedTextProps) {
  // テキストを句読点で分割
  const segments = text.split(/([。、])/).filter(Boolean)

  // 分割したテキストを結合して表示用の配列を作成
  const displaySegments: string[] = []
  let currentSegment = ""

  for (let i = 0; i < segments.length; i++) {
    const current = segments[i]

    // 句読点の場合、前のセグメントに追加
    if (current === "。" || current === "、") {
      currentSegment += current
      displaySegments.push(currentSegment)
      currentSegment = ""
    } else {
      currentSegment = current
    }
  }

  // 最後のセグメントが残っていれば追加
  if (currentSegment) {
    displaySegments.push(currentSegment)
  }

  return (
    <div className={className}>
      {displaySegments.map((segment, index) => (
        <React.Fragment key={index}>
          <span>{segment}</span>
          {/* 句読点で終わる場合のみ改行と余白を追加 */}
          {segment.endsWith("。") || segment.endsWith("、") ? (
            <>
              <br />
              <br />
            </>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  )
}
