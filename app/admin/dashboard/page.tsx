"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Settings,
  MessageSquare,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { CreditCard as CreditCardType } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export default function AdminDashboard() {
  const [cards, setCards] = useState<CreditCardType[]>([])
  const [stats, setStats] = useState({
    totalCards: 0,
    visibleCards: 0,
    totalClicks: 0,
    totalApplications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCards()
    fetchStats()
  }, [])

  const fetchCards = async () => {
    const { data } = await supabase
      .from("credit_cards")
      .select(`
        *,
        banks (*)
      `)
      .order("created_at", { ascending: false })

    if (data) setCards(data)
    setLoading(false)
  }

  const fetchStats = async () => {
    // Get card stats
    const { data: cardStats } = await supabase.from("credit_cards").select("is_visible")

    if (cardStats) {
      setStats((prev) => ({
        ...prev,
        totalCards: cardStats.length,
        visibleCards: cardStats.filter((c) => c.is_visible).length,
      }))
    }

    // Get click stats (mock data for now)
    setStats((prev) => ({
      ...prev,
      totalClicks: 1250,
      totalApplications: 89,
    }))
  }

  const toggleCardVisibility = async (cardId: string, currentVisibility: boolean) => {
    const { error } = await supabase.from("credit_cards").update({ is_visible: !currentVisibility }).eq("id", cardId)

    if (!error) {
      setCards(cards.map((card) => (card.id === cardId ? { ...card, is_visible: !currentVisibility } : card)))
    }
  }

  const deleteCard = async (cardId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thẻ này?")) {
      const { error } = await supabase.from("credit_cards").delete().eq("id", cardId)

      if (!error) {
        setCards(cards.filter((card) => card.id !== cardId))
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Quản lý hệ thống Smart Credit Card Finder</p>
            </div>
            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/admin/cards/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm thẻ mới
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Xem trang chủ</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số thẻ</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <p className="text-xs text-muted-foreground">{stats.visibleCards} thẻ đang hiển thị</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lượt click</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đơn đăng ký</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">Tỷ lệ chuyển đổi: 7.1%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₫45.2M</div>
              <p className="text-xs text-muted-foreground">+8% so với tháng trước</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cards">Quản lý thẻ</TabsTrigger>
            <TabsTrigger value="analytics">Thống kê</TabsTrigger>
            <TabsTrigger value="hero">Hero Slides</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          {/* Cards Management */}
          <TabsContent value="cards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách thẻ tín dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
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
                          <h3 className="font-semibold">{card.name}</h3>
                          <p className="text-sm text-gray-600">{card.bank?.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={card.is_visible ? "default" : "secondary"}>
                              {card.is_visible ? "Hiển thị" : "Ẩn"}
                            </Badge>
                            <span className="text-xs text-gray-500">Hoàn tiền: {card.cashback_percent}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCardVisibility(card.id, card.is_visible)}
                        >
                          {card.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/cards/${card.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCard(card.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê click theo thẻ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cards.slice(0, 5).map((card, index) => (
                      <div key={card.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{card.name}</span>
                        </div>
                        <div className="text-sm font-semibold">{Math.floor(Math.random() * 500) + 100} clicks</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tỷ lệ chuyển đổi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cards.slice(0, 5).map((card, index) => (
                      <div key={card.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{card.name}</span>
                        </div>
                        <div className="text-sm font-semibold">{(Math.random() * 15 + 2).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hero Slides */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý Hero Slides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tính năng quản lý Hero Slides sẽ được phát triển</p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm slide mới
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt hệ thống</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tính năng cài đặt hệ thống sẽ được phát triển</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
