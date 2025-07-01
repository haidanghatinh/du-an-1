"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  CreditCard,
  Plane,
  ShoppingBag,
  Car,
  Home,
  Utensils,
  Fuel,
  Gift,
  Check,
  ArrowDown,
} from "lucide-react"
import Tilt from 'react-parallax-tilt'

// 8 nhu cầu phổ biến với icon và mô tả
const popularNeeds = [
  {
    id: "cashback",
    title: "Bạn thích hoàn tiền khi chi tiêu?",
    subtitle: "Tối ưu hóa lợi ích từ mỗi giao dịch",
    icon: CreditCard,
    image: "/placeholder.svg?height=600&width=1200",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "travel",
    title: "Thẻ lý tưởng cho người du lịch thường xuyên",
    subtitle: "Miles, phòng chờ sân bay và ưu đãi du lịch",
    icon: Plane,
    image: "/placeholder.svg?height=600&width=1200",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "shopping",
    title: "Mua sắm thông minh với ưu đãi tốt nhất",
    subtitle: "Giảm giá và hoàn tiền khi shopping",
    icon: ShoppingBag,
    image: "/placeholder.svg?height=600&width=1200",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "fuel",
    title: "Tiết kiệm chi phí xăng dầu hàng tháng",
    subtitle: "Hoàn tiền cao khi đổ xăng",
    icon: Fuel,
    image: "/placeholder.svg?height=600&width=1200",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    id: "dining",
    title: "Ăn uống ngon miệng, tiết kiệm thông minh",
    subtitle: "Ưu đãi tại nhà hàng và giao đồ ăn",
    icon: Utensils,
    image: "/placeholder.svg?height=600&width=1200",
    gradient: "from-red-500 to-pink-600",
  },
  {
    id: "online",
    title: "Mua sắm online an toàn và có lợi",
    subtitle: "Bảo mật cao và hoàn tiền online",
    icon: Gift,
    image: "/placeholder.svg?height=600&width=1200",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    id: "installment",
    title: "Trả góp 0% lãi suất cho mua sắm lớn",
    subtitle: "Linh hoạt tài chính với trả góp",
    icon: Home,
    image: "/placeholder.svg?height=600&width=1200",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    id: "premium",
    title: "Dịch vụ cao cấp cho phong cách sống",
    subtitle: "Concierge, golf và ưu đãi VIP",
    icon: Car,
    image: "/placeholder.svg?height=600&width=1200",
    gradient: "from-gray-700 to-gray-900",
  },
]

// 8 tiêu chí chọn lọc
const criteriaOptions = [
  {
    id: "high-cashback",
    label: "Hoàn tiền cao",
    description: "Thẻ có tỷ lệ hoàn tiền từ 1.5% trở lên",
    icon: "💰",
  },
  {
    id: "no-annual-fee",
    label: "Miễn phí thường niên",
    description: "Không mất phí duy trì thẻ hàng năm",
    icon: "🆓",
  },
  {
    id: "travel-benefits",
    label: "Ưu đãi du lịch",
    description: "Miles, phòng chờ sân bay, bảo hiểm du lịch",
    icon: "✈️",
  },
  {
    id: "dining-rewards",
    label: "Ưu đãi ăn uống",
    description: "Hoàn tiền cao tại nhà hàng và giao đồ ăn",
    icon: "🍽️",
  },
  {
    id: "online-shopping",
    label: "Mua sắm online",
    description: "Ưu đãi đặc biệt cho giao dịch trực tuyến",
    icon: "🛒",
  },
  {
    id: "fuel-savings",
    label: "Tiết kiệm xăng dầu",
    description: "Hoàn tiền cao khi đổ xăng tại cây xăng",
    icon: "⛽",
  },
  {
    id: "installment-0",
    label: "Trả góp 0% lãi suất",
    description: "Mua sắm lớn với trả góp không lãi suất",
    icon: "📱",
  },
  {
    id: "premium-service",
    label: "Dịch vụ cao cấp",
    description: "Concierge, golf, spa và các dịch vụ VIP",
    icon: "👑",
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showStickyButton, setShowStickyButton] = useState(false)
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load saved criteria from localStorage
    const saved = localStorage.getItem("selectedCriteria")
    if (saved) {
      try {
        setSelectedCriteria(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading saved criteria:", e)
      }
    }

    // Auto-slide every 3 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % popularNeeds.length)
    }, 3000)

    // Sticky button on scroll
    const handleScroll = () => {
      const criteriaSection = document.getElementById("criteria-section")
      if (criteriaSection) {
        const rect = criteriaSection.getBoundingClientRect()
        setShowStickyButton(rect.bottom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      clearInterval(interval)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Tự động chạy step-by-step khi mở modal
  useEffect(() => {
    if (showModal) {
      setCurrentStep(1)
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)
      stepIntervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < 5) return prev + 1
          else {
            clearInterval(stepIntervalRef.current!)
            setTimeout(() => {
              window.location.href = "/suggestions"
            }, 800)
            return prev
          }
        })
      }, 1200)
    } else {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)
    }
  }, [showModal])

  const handleCriteriaSelect = (id: string) => {
    let newSelection: string[]

    if (selectedCriteria.includes(id)) {
      newSelection = selectedCriteria.filter((c) => c !== id)
    } else if (selectedCriteria.length < 3) {
      newSelection = [...selectedCriteria, id]
    } else {
      return // Don't allow more than 3 selections
    }

    setSelectedCriteria(newSelection)
    localStorage.setItem("selectedCriteria", JSON.stringify(newSelection))
  }

  const handleSearch = () => {
    if (selectedCriteria.length > 0) {
      setShowModal(true)
      setCurrentStep(1)
    }
  }

  const scrollToCriteria = () => {
    const element = document.getElementById("criteria-section")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const stepMessages = [
    { icon: "🔍", message: "Đang phân tích nhu cầu của bạn..." },
    { icon: "📊", message: "Đang tìm dữ liệu thẻ phù hợp..." },
    { icon: "⚖️", message: "Đang so sánh ưu đãi..." },
    { icon: "🎯", message: "Gợi ý đang được tạo..." },
    { icon: "✅", message: "Hoàn tất! Chuẩn bị kết quả..." },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* PHẦN 1: HERO SLIDER */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-1 py-2 sm:px-4 sm:py-8">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            {/* Hiệu ứng nền động */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-300/30 to-teal-200/30 rounded-full blur-2xl animate-pulse z-0" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-teal-300/30 to-blue-200/30 rounded-full blur-2xl animate-pulse z-0" />
            <div className="relative h-[60vw] min-h-[260px] max-h-[420px] sm:h-[60vh] sm:min-h-[400px] flex items-center justify-center">
              {popularNeeds.map((need, index) => (
                <div
                  key={need.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"}`}
                >
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${need.image})` }} />
                  <div className={`absolute inset-0 bg-gradient-to-r ${need.gradient} opacity-80`} />
                  <div className="relative z-10 flex items-center justify-center h-full px-2 sm:px-8">
                    <div className="text-center text-white max-w-xs sm:max-w-2xl mx-auto">
                      <div className="mb-3 sm:mb-6 flex justify-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                          <need.icon className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                        </div>
                      </div>
                      <h1 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 animate-fade-in leading-tight">{need.title}</h1>
                      <p className="text-sm sm:text-lg mb-4 sm:mb-8 opacity-90 animate-fade-in">{need.subtitle}</p>
                      <Button
                        onClick={scrollToCriteria}
                        size="lg"
                        className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-105 transition-all duration-200 px-5 sm:px-8 py-2.5 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg"
                      >
                        <Search className="mr-2 h-5 w-5" />
                        Tìm ngay thẻ phù hợp
                        <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full w-10 h-10 sm:w-12 sm:h-12"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + popularNeeds.length) % popularNeeds.length)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full w-10 h-10 sm:w-12 sm:h-12"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % popularNeeds.length)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            {/* Slide Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
              {popularNeeds.map((_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white scale-125 shadow-lg" : "bg-white/50 hover:bg-white/70"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 2: 8 TIÊU CHÍ - mobile scroll ngang, desktop grid */}
      <section id="criteria-section" className="py-2 px-1 sm:py-8 sm:px-2 md:py-16 md:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4 md:mb-12">
            <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-4">Chọn nhu cầu quan trọng nhất với bạn</h2>
            <p className="text-xs sm:text-base md:text-lg text-gray-600 mb-2">Chọn tối đa 3 tiêu chí để chúng tôi gợi ý thẻ phù hợp nhất</p>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant={selectedCriteria.length > 0 ? "default" : "secondary"} className="text-xs sm:text-sm">
                Đã chọn: {selectedCriteria.length}/3
              </Badge>
              {selectedCriteria.length === 3 && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  <Check className="w-3 h-3 mr-1" />
                  Sẵn sàng tìm kiếm
                </Badge>
              )}
            </div>
          </div>
          <div className="relative">
            {/* Hiệu ứng nền blur */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-teal-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />
            <Card className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-2 sm:p-4 md:p-8">
                <TooltipProvider>
                  <div className="flex overflow-x-auto gap-2 sm:gap-3 md:grid md:grid-cols-4 md:gap-6 scrollbar-hide pb-2">
                    {criteriaOptions.map((criterion) => {
                      const isSelected = selectedCriteria.includes(criterion.id)
                      const isDisabled = selectedCriteria.length >= 3 && !isSelected
                      return (
                        <Tooltip key={criterion.id}>
                          <TooltipTrigger asChild>
                            <Tilt tiltMaxAngleX={12} tiltMaxAngleY={12} glareEnable={true} glareMaxOpacity={0.12} scale={1.04} transitionSpeed={700} className="min-w-[110px] sm:min-w-[140px]">
                              <div
                                className={`group relative p-2 sm:p-3 md:p-6 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 transform ${
                                  isSelected
                                    ? "bg-gradient-to-br from-teal-500/20 to-blue-500/20 border-2 border-teal-400/70 shadow-xl scale-105 animate-pulse"
                                    : isDisabled
                                      ? "bg-white/10 border border-gray-300/30 opacity-50 cursor-not-allowed"
                                      : "bg-white/40 border border-white/30 hover:bg-white/60 hover:border-teal-400/50 hover:scale-105 hover:shadow-lg"
                                } backdrop-blur-sm`}
                                onClick={() => !isDisabled && handleCriteriaSelect(criterion.id)}
                                style={{ boxShadow: isSelected ? '0 4px 24px 0 rgba(13,148,136,0.18)' : undefined }}
                              >
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2 md:mb-3 text-center drop-shadow-lg">{criterion.icon}</div>
                                <h3 className="font-semibold text-gray-900 text-center text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1 md:mb-2">
                                  {criterion.label}
                                </h3>
                              </div>
                            </Tilt>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="text-sm">{criterion.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                  {/* CTA Button */}
                  <div className="text-center mt-4 md:mt-12">
                    <Button
                      onClick={handleSearch}
                      disabled={selectedCriteria.length === 0}
                      size="lg"
                      className={`px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full shadow-xl transition-all duration-300 ${
                        selectedCriteria.length > 0
                          ? "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-2xl animate-pulse"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Search className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />🔍 Tìm kiếm thẻ phù hợp
                      <Sparkles className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                    {selectedCriteria.length === 0 && (
                      <p className="text-xs md:text-sm text-gray-500 mt-3 animate-bounce">
                        Vui lòng chọn ít nhất 1 tiêu chí để tiếp tục
                      </p>
                    )}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <Button
            onClick={scrollToCriteria}
            size="lg"
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-full shadow-2xl px-6 py-3"
          >
            <ArrowDown className="mr-2 h-5 w-5" />
            Chọn tiêu chí
          </Button>
        </div>
      )}

      {/* MODAL STEP FILTER */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Đang tìm kiếm thẻ phù hợp</DialogTitle>
          </DialogHeader>

          <div className="py-8">
            {/* Progress Bar */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-600">Bước {currentStep}/5</span>
              <span className="text-sm font-semibold text-teal-600">{Math.round((currentStep / 5) * 100)}%</span>
            </div>

            {/* Horizontal Stepper */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                      step <= currentStep
                        ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white scale-110 shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step <= currentStep ? (
                      step === currentStep ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )
                    ) : (
                      step
                    )}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-12 h-1 mt-2 transition-all duration-500 ${
                        step < currentStep ? "bg-gradient-to-r from-teal-500 to-blue-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Current Step Message */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-4 animate-bounce">{stepMessages[currentStep - 1]?.icon}</div>
              <p className="text-lg font-medium text-gray-700">{stepMessages[currentStep - 1]?.message}</p>

              {/* Loading Animation */}
              <div className="flex justify-center mt-4">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 px-8 py-3 rounded-full font-semibold"
              >
                {currentStep === 5 ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Xem kết quả
                  </>
                ) : (
                  "Tiếp tục"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
