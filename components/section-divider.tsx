import WoodWaveBackground from "./wood-wave-background"

interface SectionDividerProps {
  position?: "top" | "bottom"
  flip?: boolean
  color?: string
  height?: number
  opacity?: number
}

export default function SectionDivider({
  position = "bottom",
  flip = false,
  color = "#F3EFE9",
  height = 70,
  opacity = 0.3,
}: SectionDividerProps) {
  return <WoodWaveBackground position={position} flip={flip} color={color} height={height} opacity={opacity} />
}
