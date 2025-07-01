"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid, List, Heart, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { CreditCard as CreditCardType, Bank } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export default function CardsPage() {
  const [cards, setCards] = useState<CreditCardType[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [filteredCards, setFilteredCards] = useState<CreditCardType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBank, setSelectedBank] = useState<string>("all") // Updated default value
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [savedCards, setSavedCards] = useState<string[]>([])

  useEffect(() => {
    fetchCards()
    fetchBanks()
  }, [])

  useEffect(() => {
    filterAndSortCards()
  }, [cards, searchTerm, selectedBank, sortBy])

  useEffect(() => {
    const saved = localStorage.getItem("savedCards")
    if (saved) setSavedCards(JSON.parse(saved))
  }, [])

  const fetchCards = async () => {
    const { data } = await supabase
      .from("credit_cards")
      .select(`
        *,
        banks (*)
      `)
      .eq("is_visible", true)

    if (data) {
      setCards(data)
    }
    setLoading(false)
  }

  const fetchBanks = async () => {
    const { data } = await supabase.from("banks").select("*").order("name")

    if (data) setBanks(data)
  }

  const filterAndSortCards = () => {
    let filtered = [...cards]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Bank filter
    if (selectedBank !== "all") {
      filtered = filtered.filter((card) => card.bank_id === selectedBank)
    }

    // Sort
    switch (sortBy) {
      case "cashback":
        filtered.sort((a, b) => b.cashback_percent - a.cashback_percent)
        break
      case "interest":
        filtered.sort((a, b) => a.interest_rate_percent - b.interest_rate_percent)
        break
      case "limit":
        filtered.sort((a, b) => b.max_limit_vnd - a.max_limit_vnd)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // popular
        // Keep original order or implement popularity logic
        break
    }

    setFilteredCards(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const toggleSaveCard = (cardId: string) => {
    let updated: string[]
    if (savedCards.includes(cardId)) {
      updated = savedCards.filter((id) => id !== cardId)
    } else {
      updated = [...savedCards, cardId]
    }
    setSavedCards(updated)
    localStorage.setItem("savedCards", JSON.stringify(updated))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải danh sách thẻ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Danh sách thẻ tín dụng</h1>
          <p className="text-gray-600">Khám phá và so sánh {cards.length} thẻ tín dụng từ các ngân hàng hàng đầu</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm thẻ tín dụng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Bank Filter */}
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Chọn ngân hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngân hàng</SelectItem> {/* Updated value prop */}
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Phổ biến</SelectItem>
                  <SelectItem value="cashback">Hoàn tiền cao</SelectItem>
                  <SelectItem value="interest">Lãi suất thấp</SelectItem>
                  <SelectItem value="limit">Hạn mức cao</SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị {filteredCards.length} thẻ tín dụng
            {searchTerm && ` cho "${searchTerm}"`}
            {selectedBank !== "all" && ` từ ${banks.find((b) => b.id === selectedBank)?.name}`}
          </p>
        </div>

        {/* Cards Grid/List */}
        <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "grid-cols-1 gap-4"}`}>
          {filteredCards.map((card) => (
            <Card key={card.id} className="relative group shadow-lg border-0 bg-white/90 hover:shadow-2xl transition-all">
              {/* Nút lưu thẻ */}
              <button
                className={`absolute top-4 right-4 z-10 rounded-full p-2 border-2 ${savedCards.includes(card.id) ? "bg-teal-500 border-teal-500 text-white" : "bg-white border-gray-200 text-teal-500 hover:bg-teal-50"}`}
                onClick={() => toggleSaveCard(card.id)}
                aria-label={savedCards.includes(card.id) ? "Bỏ lưu thẻ" : "Lưu thẻ yêu thích"}
              >
                <Heart className={`w-5 h-5 ${savedCards.includes(card.id) ? "fill-current" : ""}`} />
              </button>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {card.logo_url && (
                      <Image
                        src={card.logo_url || "/placeholder.svg"}
                        alt={card.name}
                        width={40}
                        height={30}
                        className="object-contain"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg">{card.name}</CardTitle>
                      <p className="text-sm text-gray-600">{card.bank?.name}</p>
                    </div>
                  </div>
                </div>

                {card.image_url && viewMode === "grid" && (
                  <div className="relative h-32 rounded-lg overflow-hidden">
                    <Image src={card.image_url || "/placeholder.svg"} alt={card.name} fill className="object-cover" />
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm">{card.short_description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {card.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Hoàn tiền</p>
                    <p className="font-semibold text-teal-600">{card.cashback_percent}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Lãi suất</p>
                    <p className="font-semibold">{card.interest_rate_percent}%/năm</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hạn mức</p>
                    <p className="font-semibold text-xs">{formatCurrency(card.max_limit_vnd)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phí thường niên</p>
                    <p className="font-semibold">{card.no_annual_fee ? "Miễn phí" : "Có phí"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                    <a href={card.affiliate_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Đăng ký ngay
                    </a>
                  </Button>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/cards/${card.slug}`}>Chi tiết</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      So sánh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thẻ nào</h3>
            <p className="text-gray-600 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedBank("all") // Updated default value
                setSortBy("popular")
              }}
              variant="outline"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
