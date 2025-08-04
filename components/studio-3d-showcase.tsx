"use client"

import { useRef, useState, Suspense, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, OrbitControls, PerspectiveCamera, ContactShadows } from "@react-three/drei"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, ZoomIn } from "lucide-react"
import type * as THREE from "three"

// 間取り図に基づいた3Dモデルコンポーネント
function StudioFloorPlan({ onHover }: { onHover: (feature: string | null) => void }) {
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState("")

  // 壁のマテリアル参照
  const leftWallRef = useRef<THREE.MeshStandardMaterial>(null)
  const rightWallRef = useRef<THREE.MeshStandardMaterial>(null)
  const backWallRef = useRef<THREE.MeshStandardMaterial>(null)
  const frontWallRef = useRef<THREE.MeshStandardMaterial>(null)

  // カメラ情報を取得
  const { camera } = useThree()

  // アニメーション - スタジオモデルをゆっくり回転 & 壁の透明度を調整
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.1
    }

    // カメラの位置を取得
    const cameraPosition = camera.position.clone()

    // カメラとモデルの距離を計算
    const distance = cameraPosition.length()

    // 距離に応じて壁の透明度を調整
    const opacity = Math.min(Math.max(distance - 6, 0) / 4, 1)

    // 各壁のマテリアルの透明度を更新
    if (leftWallRef.current) leftWallRef.current.opacity = opacity
    if (rightWallRef.current) rightWallRef.current.opacity = opacity
    if (backWallRef.current) backWallRef.current.opacity = opacity
    if (frontWallRef.current) frontWallRef.current.opacity = opacity
  })

  return (
    <group ref={group} position={[0, -1, 0]}>
      {/* 床 - メインスタジオエリア */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerOver={() => {
          setHovered("floor")
          onHover("floor")
        }}
        onPointerOut={() => {
          setHovered("")
          onHover(null)
        }}
      >
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={hovered === "floor" ? "#3b82f6" : "#e5e7eb"} roughness={0.8} />
      </mesh>

      {/* 壁 - 外枠 - 透明度を調整可能に */}
      <group>
        {/* 左壁 */}
        <mesh position={[-5, 1, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.1, 2, 5]} />
          <meshStandardMaterial ref={leftWallRef} color="#e2e8f0" transparent={true} opacity={1} />
        </mesh>

        {/* 右壁 */}
        <mesh position={[5, 1, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.1, 2, 5]} />
          <meshStandardMaterial ref={rightWallRef} color="#e2e8f0" transparent={true} opacity={1} />
        </mesh>

        {/* 奥壁 */}
        <mesh position={[0, 1, -2.5]} receiveShadow castShadow>
          <boxGeometry args={[10, 2, 0.1]} />
          <meshStandardMaterial ref={backWallRef} color="#e2e8f0" transparent={true} opacity={1} />
        </mesh>

        {/* 手前壁 */}
        <mesh position={[0, 1, 2.5]} receiveShadow castShadow>
          <boxGeometry args={[10, 2, 0.1]} />
          <meshStandardMaterial ref={frontWallRef} color="#e2e8f0" transparent={true} opacity={1} />
        </mesh>
      </group>

      {/* 鏡 - 奥壁に設置（枠付き） */}
      <group
        position={[0, 1, -2.45]}
        onPointerOver={() => {
          setHovered("mirror")
          onHover("mirror")
        }}
        onPointerOut={() => {
          setHovered("")
          onHover(null)
        }}
      >
        {/* 鏡の枠 */}
        <mesh receiveShadow castShadow position={[0, 0, -0.02]}>
          <boxGeometry args={[10, 2, 0.1]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        {/* 鏡本体 - 壁面全体をカバーする一枚板 */}
        <mesh receiveShadow castShadow position={[0, 0, 0.01]}>
          <boxGeometry args={[9.8, 1.9, 0.05]} />
          <meshStandardMaterial color={hovered === "mirror" ? "#3b82f6" : "#a0aec0"} metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* トイレ/洗面所 - 左下の小部屋 */}
      <group
        position={[-4, 0.5, 1.5]}
        onPointerOver={() => {
          setHovered("toilet")
          onHover("toilet")
        }}
        onPointerOut={() => {
          setHovered("")
          onHover(null)
        }}
      >
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1.8, 1, 1.8]} />
          <meshStandardMaterial color={hovered === "toilet" ? "#3b82f6" : "#f1f5f9"} transparent opacity={0.8} />
        </mesh>
        {/* トイレのシンボル */}
        <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 32]} />
          <meshStandardMaterial color="#bae6fd" />
        </mesh>
      </group>

      {/* テレビ/モニター - 左上 */}
      <group
        position={[-4, 1, -1.5]}
        onPointerOver={() => {
          setHovered("lighting")
          onHover("lighting")
        }}
        onPointerOut={() => {
          setHovered("")
          onHover(null)
        }}
      >
        <mesh receiveShadow castShadow rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[1.5, 0.8, 0.1]} />
          <meshStandardMaterial color={hovered === "lighting" ? "#3b82f6" : "#1e293b"} />
        </mesh>
        {/* テレビスタンド */}
        <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.1, 0.2, 1, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* 更衣スペース - 右側 */}
      <group
        position={[3.5, 0.5, 0]}
        onPointerOver={() => {
          setHovered("changing")
          onHover("changing")
        }}
        onPointerOut={() => {
          setHovered("")
          onHover(null)
        }}
      >
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2, 1, 2]} />
          <meshStandardMaterial color={hovered === "changing" ? "#3b82f6" : "#f8fafc"} transparent opacity={0.7} />
        </mesh>
        {/* カーテンのシンボル */}
        <mesh position={[0, 0, -1]} receiveShadow castShadow>
          <boxGeometry args={[1.8, 0.9, 0.05]} />
          <meshStandardMaterial color="#bfdbfe" />
        </mesh>
      </group>

      {/* 階段 - 右端 */}
      <group position={[4.5, 0.5, 1.5]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[0, i * 0.2, -i * 0.2]} receiveShadow castShadow>
            <boxGeometry args={[1, 0.1, 0.2]} />
            <meshStandardMaterial color="#d1d5db" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// メインシーンコンポーネント
function Scene({ onHover }: { onHover: (feature: string | null) => void }) {
  const { camera } = useThree()

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={40} />
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={1} castShadow />

      <StudioFloorPlan onHover={onHover} />

      <ContactShadows position={[0, -0.99, 0]} opacity={0.7} scale={15} blur={2} far={10} resolution={256} />

      <Environment preset="studio" />
    </>
  )
}

export default function Studio3DShowcase() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showZoomTip, setShowZoomTip] = useState(true)

  // ズームヒントを一定時間後に非表示にする
  useEffect(() => {
    if (showZoomTip) {
      const timer = setTimeout(() => {
        setShowZoomTip(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showZoomTip])

  const featureDescriptions: Record<string, { title: string; description: string }> = {
    floor: {
      title: "プロ仕様のフロア",
      description:
        "ダンスに最適化された衝撃吸収性と滑り止め加工を施したプロ仕様の床材を使用。長時間の練習でも体への負担を軽減します。",
    },
    mirror: {
      title: "全面鏡張り",
      description:
        "壁一面に高品質なミラーを設置。自分の動きをあらゆる角度から確認できるため、技術向上に最適な環境です。",
    },
    lighting: {
      title: "テレビ/モニター",
      description: "ダンス動画の視聴や振り付けの確認に便利なテレビモニター。レッスンの参考映像を見ながら練習できます。",
    },
    toilet: {
      title: "トイレ・洗面所",
      description: "スタジオ内に清潔なトイレと洗面所を完備。長時間の利用でも安心して練習に集中できます。",
    },
    changing: {
      title: "更衣スペース",
      description: "プライバシーに配慮した更衣スペースを用意。カーテンで仕切られた空間で、着替えも安心です。",
    },
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="h-px bg-[#4facfe] w-16"></div>
            <h2 className="text-2xl sm:text-3xl font-bold mx-4 text-white">スタジオ3D体験</h2>
            <div className="h-px bg-[#4facfe] w-16"></div>
          </div>
          <p className="text-base sm:text-lg leading-loose text-gray-300 max-w-2xl mx-auto">
            インタラクティブな3Dモデルで、スタジオの設備をご覧ください。 要素にカーソルを合わせると詳細が表示されます。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3 h-[500px] bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-xl relative">
            <Canvas shadows dpr={[1, 2]}>
              <Suspense fallback={null}>
                <Scene onHover={setActiveFeature} />
                <OrbitControls
                  enableZoom={true}
                  enablePan={false}
                  minPolarAngle={Math.PI / 6}
                  maxPolarAngle={Math.PI / 2}
                  minDistance={4}
                  maxDistance={15}
                />
              </Suspense>
            </Canvas>

            {/* ズームヒント */}
            {showZoomTip && (
              <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full flex items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ZoomIn className="mr-2 h-4 w-4" />
                <span className="text-sm">ズームインすると壁が透明になります</span>
              </motion.div>
            )}
          </div>

          <div className="md:col-span-2 p-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
              <h3 className="text-2xl font-bold mb-2">
                {activeFeature ? featureDescriptions[activeFeature]?.title || "スタジオの詳細" : "スタジオの詳細"}
              </h3>
              <div className="h-px w-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4"></div>
              <p className="text-gray-300 mb-6">
                {activeFeature
                  ? featureDescriptions[activeFeature]?.description ||
                    "3Dモデルの要素にカーソルを合わせると、設備の詳細が表示されます。"
                  : "3Dモデルの要素にカーソルを合わせると、設備の詳細が表示されます。"}
              </p>

              <ul className="space-y-4">
                {Object.entries(featureDescriptions).map(([key, { title }]) => (
                  <li key={key}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${activeFeature === key ? "bg-blue-900/50 text-white" : "text-gray-400 hover:text-white"}`}
                      onClick={() => setActiveFeature(key)}
                    >
                      <ChevronRight className="mr-2 h-4 w-4" />
                      {title}
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 bg-blue-50 rounded-xl px-6 py-4 border border-blue-800/50">
                <h4 className="font-medium text-blue-300 flex items-center mb-2">
                  <ZoomIn className="mr-2 h-4 w-4" />
                  操作ガイド
                </h4>
                <p className="text-sm text-gray-300">
                  マウスホイールでズームイン/アウトができます。近づくと壁が透明になり、内部の設備が見やすくなります。
                  ドラッグで視点を変更できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
