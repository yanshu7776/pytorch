"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"

export default function PriceTable() {
  const [activeTab, setActiveTab] = useState("weekday")

  const weekdayPrices = [
    { time: "0-17時", price: "¥1,000", perPerson: "¥200/人" },
    { time: "17-24時", price: "¥1,200", perPerson: "¥240/人" },
  ]

  const weekendPrices = [{ time: "0-24時", price: "¥1,500", perPerson: "¥300/人" }]

  return (
    <div>
      <Tabs defaultValue="weekday" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="weekday">平日料金</TabsTrigger>
          <TabsTrigger value="weekend">土日祝料金</TabsTrigger>
        </TabsList>

        <TabsContent value="weekday" className="mt-0">
          <Card className="border-none shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-[#005BAC] text-white">
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm">利用時間帯</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm">料金（1時間あたり）</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm">5人利用時（1人あたり）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekdayPrices.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 text-xs sm:text-sm">
                          {item.time}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 font-bold text-xs sm:text-sm">
                          {item.price}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 text-gray-600 text-xs sm:text-sm">
                          {item.perPerson}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekend" className="mt-0">
          <Card className="border-none shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-[#005BAC] text-white">
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm">利用時間帯</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm">料金（1時間あたり）</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs sm:text-sm">5人利用時（1人あたり）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekendPrices.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 text-xs sm:text-sm">
                          {item.time}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 font-bold text-xs sm:text-sm">
                          {item.price}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 text-gray-600 text-xs sm:text-sm">
                          {item.perPerson}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 bg-[#F3EFE9]/30 p-5 rounded-lg">
        <h4 className="text-base font-semibold mb-3 text-[#005BAC]">料金に含まれるもの</h4>
        <ul className="space-y-3">
          <li className="flex items-start">
            <Check className="mr-2 h-4 w-4 text-[#005BAC] flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-gray-700">
              高品質音響システム
              <span className="md:hidden mobile-break"></span>
              （BOSE製スピーカー）
            </span>
          </li>
          <li className="flex items-start">
            <Check className="mr-2 h-4 w-4 text-[#005BAC] flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-gray-700">プロ仕様の全面鏡</span>
          </li>
          <li className="flex items-start">
            <Check className="mr-2 h-4 w-4 text-[#005BAC] flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-gray-700">冷暖房完備</span>
          </li>
          <li className="flex items-start">
            <Check className="mr-2 h-4 w-4 text-[#005BAC] flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-gray-700">Wi-Fi無料</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
