"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  CreditCard,
  Clock,
  Percent,
  DollarSign,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { CreditCard as CreditCardType } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

// Mapping dictionary để dịch tags thành văn bản thân thiện
const tagTranslations: Record<string, string> = {
  "high-cashback": "hoàn tiền cao",
  "no-annual-fee": "miễn phí thường niên",
  "travel-benefits": "ưu đãi du lịch",
  "dining-rewards": "ưu đãi ăn uống",
  "online-shopping": "mua sắm online",
  "fuel-savings": "tiết kiệm xăng dầu",
  "installment-0": "trả góp 0% lãi suất",
  "premium-service": "dịch vụ cao cấp",
  "fast-approval": "duyệt nhanh",
  "high-limit": "hạn mức cao",
  "low-interest": "lãi suất thấp",
  "rewards-points": "tích điểm thưởng",
}

// Criteria mapping để match với tags
const criteriaToTags: Record<string, string[]> = {
  "high-cashback": ["high-cashback", "rewards-points"],
  "no-annual-fee": ["no-annual-fee"],
  "travel-benefits": ["travel-benefits"],
  "dining-rewards": ["dining-rewards"],
  "online-shopping": ["online-shopping"],
  "fuel-savings": ["fuel-savings"],
  "installment-0": ["installment-0"],
  "premium-service": ["premium-service"],
}

interface CardWithScore extends CreditCardType {
  matchScore: number
  matchedCriteria: string[]
  reasonText: string
  rating: number
}

export default function SuggestionsPage() {
  const [suggestedCards, setSuggestedCards] = useState<CardWithScore[]>([])
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  useEffect(() => {
    const criteria = localStorage.getItem("selectedCriteria")
    if (criteria) {
      const parsedCriteria = JSON.parse(criteria)
      setSelectedCriteria(parsedCriteria)
      fetchAndMatchCards(parsedCriteria)
    } else {
      // Fallback: show top 3 cards
      fetchTopCards()
    }
  }, [])

  const fetchAndMatchCards = async (criteria: string[]) => {
    setLoading(true)
    try {
      const { data: cards } = await supabase
        .from("credit_cards")
        .select(`
          *,
          banks (*)
        `)
        .eq("is_visible", true)

      if (cards) {
        // Calculate match scores and generate reasons
        const cardsWithScores = cards.map((card) => {
          const matchedCriteria: string[] = []
          let matchScore = 0

          // Check each user criteria against card tags
          criteria.forEach((criterion) => {
            const relatedTags = criteriaToTags[criterion] || [criterion]
            const hasMatch = relatedTags.some((tag) => card.tags.includes(tag))
            if (hasMatch) {
              matchedCriteria.push(criterion)
              matchScore += 10
            }
          })

          // Bonus points for additional beneficial features
          if (card.no_annual_fee) matchScore += 5
          if (card.cashback_percent >= 1.5) matchScore += 5
          if (card.interest_rate_percent <= 20) matchScore += 3
          if (card.approval_time.includes("nhanh") || card.approval_time.includes("1-2")) matchScore += 3

          // Generate reason text
          const reasonText = generateReasonText(matchedCriteria)

          // Calculate rating (1-5 stars)
          const rating = calculateRating(card)

          return {
            ...card,
            matchScore,
            matchedCriteria,
            reasonText,
            rating,
          }
        })

        // Sort by match score and take top 3
        const topCards = cardsWithScores.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)

        setSuggestedCards(topCards)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
      fetchTopCards()
    } finally {
      setLoading(false)
    }
  }

  const fetchTopCards = async () => {
    const { data } = await supabase
      .from("credit_cards")
      .select(`
        *,
        banks (*)
      `)
      .eq("is_visible", true)
      .limit(3)

    if (data) {
      const cardsWithDefaults = data.map((card) => ({
        ...card,
        matchScore: 0,
        matchedCriteria: [],
        reasonText: "Thẻ phổ biến được nhiều người lựa chọn",
        rating: calculateRating(card),
      }))
      setSuggestedCards(cardsWithDefaults)
    }
    setLoading(false)
  }

  const generateReasonText = (matchedCriteria: string[]): string => {
    if (matchedCriteria.length === 0) {
      return "Thẻ phổ biến với nhiều ưu đãi hấp dẫn"
    }

    const translatedCriteria = matchedCriteria.map((c) => tagTranslations[c] || c)

    if (translatedCriteria.length === 1) {
      return `Phù hợp vì bạn ưu tiên ${translatedCriteria[0]}`
    } else if (translatedCriteria.length === 2) {
      return `Phù hợp vì bạn ưu tiên ${translatedCriteria[0]} và ${translatedCriteria[1]}`
    } else {
      return `Phù hợp vì bạn ưu tiên ${translatedCriteria.slice(0, -1).join(", ")} và ${translatedCriteria[translatedCriteria.length - 1]}`
    }
  }

  const calculateRating = (card: CreditCardType): number => {
    let score = 0
    let maxScore = 0

    // Uy tín ngân hàng (giả định dựa trên tên)
    maxScore += 1
    if (card.bank?.name.includes("Vietcombank") || card.bank?.name.includes("BIDV")) {
      score += 1
    } else if (card.bank?.name.includes("Techcombank") || card.bank?.name.includes("VietinBank")) {
      score += 0.8
    } else {
      score += 0.6
    }

    // Hoàn tiền
    maxScore += 1
    if (card.cashback_percent >= 2) score += 1
    else if (card.cashback_percent >= 1.5) score += 0.8
    else if (card.cashback_percent >= 1) score += 0.6
    else score += 0.3

    // Lãi suất
    maxScore += 1
    if (card.interest_rate_percent <= 15) score += 1
    else if (card.interest_rate_percent <= 20) score += 0.8
    else if (card.interest_rate_percent <= 25) score += 0.6
    else score += 0.3

    // Phí thường niên
    maxScore += 1
    if (card.no_annual_fee) score += 1
    else score += 0.3

    // Thời gian duyệt
    maxScore += 1
    if (card.approval_time.includes("nhanh") || card.approval_time.includes("1-2")) score += 1
    else if (card.approval_time.includes("3-5")) score += 0.7
    else score += 0.5

    return Math.min(5, Math.max(1, Math.round((score / maxScore) * 5 * 10) / 10))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? "text-yellow-400 fill-current"
                : i === fullStars && hasHalfStar
                  ? "text-yellow-400 fill-current opacity-50"
                  : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm font-medium text-gray-600 ml-1">{rating}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-teal-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang phân tích và tìm kiếm</h3>
          <p className="text-gray-600">Chúng tôi đang tìm những thẻ phù hợp nhất với bạn...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Top 3 thẻ phù hợp nhất với bạn</h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Dựa trên tiêu chí bạn đã chọn, đây là những thẻ tín dụng được gợi ý phù hợp nhất
          </p>

          {selectedCriteria.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="text-sm text-gray-500 mr-2">Tiêu chí đã chọn:</span>
              {selectedCriteria.map((criterion) => (
                <Badge key={criterion} variant="secondary" className="bg-teal-100 text-teal-800">
                  {tagTranslations[criterion] || criterion.replace("-", " ")}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {suggestedCards.map((card, index) => (
            <Card
              key={card.id}
              className={`relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                index === 0
                  ? "ring-2 ring-teal-400 scale-105 bg-gradient-to-br from-white to-teal-50"
                  : "hover:scale-105"
              }`}
            >
              {/* Best Match Badge */}
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 text-sm font-bold rounded-bl-lg">
                  <Star className="inline w-4 h-4 mr-1" />
                  PHÙ HỢP NHẤT
                </div>
              )}

              {/* Match Score Indicator */}
              {card.matchScore > 0 && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-teal-600" />
                    <span className="text-xs font-semibold text-teal-600">{card.matchScore}% phù hợp</span>
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                {/* Bank Logo & Card Name */}
                <div className="flex items-center space-x-4 mb-4">
                  {card.logo_url && (
                    <div className="w-16 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                      <Image
                        src={card.logo_url || "/placeholder.svg"}
                        alt={card.bank?.name || "Bank"}
                        width={60}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900">{card.name}</CardTitle>
                    <p className="text-sm text-gray-600 font-medium">{card.bank?.name}</p>
                  </div>
                </div>

                {/* Reason Text */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-teal-800">{generateReasonText(card.matchedCriteria)}</p>
                  </div>
                </div>

                {/* Card Image */}
                {card.image_url && (
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                    <Image src={card.image_url || "/placeholder.svg"} alt={card.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center justify-between mb-4">
                  {renderStars(card.rating)}
                  <Badge className="bg-lime-100 text-lime-800 font-semibold">Đánh giá cao</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Highlight Benefits */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-teal-600" />
                    Ưu đãi nổi bật
                  </h4>
                  <div className="space-y-2">
                    {card.highlight_benefits.slice(0, 3).map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Percent className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Hoàn tiền</p>
                    <p className="font-bold text-teal-600">{card.cashback_percent}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Duyệt thẻ</p>
                    <p className="font-bold text-blue-600 text-xs">{card.approval_time}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Hạn mức</p>
                    <p className="font-bold text-green-600 text-xs">{formatCurrency(card.max_limit_vnd)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Shield className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Lãi suất</p>
                    <p className="font-bold text-purple-600">{card.interest_rate_percent}%</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    asChild
                  >
                    <a href={card.affiliate_url} target="_blank" rel="noopener noreferrer">
                      <Zap className="mr-2 h-5 w-5" />
                      ĐĂNG KÝ MỞ NGAY
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-teal-200 hover:bg-teal-50 font-semibold py-3 rounded-xl bg-transparent"
                  >
                    SO SÁNH
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Assistant Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chưa hài lòng với kết quả?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Để trợ lý AI hỗ trợ lọc sâu hơn dựa trên mục tiêu tài chính, thu nhập và thói quen tiêu dùng của bạn
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setShowAIAssistant(true)}
              >
                <MessageSquare className="mr-2 h-5 w-5" />💬 Trò chuyện với Trợ Lý AI
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Exploration */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bạn muốn khám phá các dòng thẻ khác?</h3>
              <p className="text-gray-600 mb-6">
                Xem toàn bộ danh sách thẻ tín dụng với bộ lọc nâng cao và so sánh chi tiết
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" size="lg" className="font-semibold bg-transparent">
                  <Link href="/cards">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Xem tất cả thẻ
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 font-semibold">
                  <Link href="/">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Tìm kiếm lại
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
