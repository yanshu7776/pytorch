import { Facebook, Instagram, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#005BAC] text-white py-10">
      <div className="container-wrapper">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="relative h-14 w-40 mb-4 bg-white rounded-md p-1">
              <Image src="/images/logo-new.jpeg" alt="Beyond Dance Studio Logo" fill className="object-contain" />
            </div>
            <p className="text-base leading-loose text-white/80 mb-3">
              〒543-0071
              <br />
              大阪府大阪市天王寺区玉造元町６−５
            </p>
            <p className="text-sm text-white/80">玉造駅から徒歩2分</p>
          </div>

          <div>
            <h4 className="text-2xl font-bold mb-4 border-b border-white/20 pb-2">営業時間</h4>
            <p className="text-sm text-white/80">
              24時間営業
              <br />
              ※年中無休
            </p>

            <h4 className="text-lg font-semibold mt-6 mb-4 border-b border-white/20 pb-2">ナビゲーション</h4>
            <ul className="space-y-1">
              {[
                { name: "ホーム", href: "/" },
                { name: "スタジオ紹介", href: "/#info" },
                { name: "スタジオ設備", href: "/#features" },
                { name: "ギャラリー", href: "/#gallery" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 hover:text-white transition-colors hover-underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">お問い合わせ</h4>
            <p className="text-sm text-white/80 mb-4">
              お問い合わせはこちらから
              <br />
              <a
                href="mailto:info@beyond-dance.jp"
                className="text-white/90 hover:text-white transition-colors hover-underline"
              >
                info@beyond-dance.jp
              </a>
            </p>

            <h4 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2">フォローする</h4>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors p-2 bg-white/10 rounded-full hover:bg-white/20"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} 玉造ダンススタジオBeyond. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
