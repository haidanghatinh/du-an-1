"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  X,
  Save,
  Eye,
  RefreshCw,
  HelpCircle,
  Star,
  ExternalLink,
  CreditCard,
  Clock,
  DollarSign,
  Percent,
  Shield,
  Sparkles,
  ArrowLeft,
  Heart,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Bank } from "@/lib/types"

// Predefined tags for quick selection
const predefinedTags = [
  { id: "high-cashback", label: "Hoàn tiền cao", color: "bg-green-100 text-green-800" },
  { id: "no-annual-fee", label: "Miễn phí thường niên", color: "bg-blue-100 text-blue-800" },
  { id: "travel-benefits", label: "Ưu đãi du lịch", color: "bg-purple-100 text-purple-800" },
  { id: "dining-rewards", label: "Ưu đãi ăn uống", color: "bg-orange-100 text-orange-800" },
  { id: "online-shopping", label: "Mua sắm online", color: "bg-pink-100 text-pink-800" },
  { id: "fuel-savings", label: "Tiết kiệm xăng dầu", color: "bg-yellow-100 text-yellow-800" },
  { id: "installment-0", label: "Trả góp 0% lãi suất", color: "bg-indigo-100 text-indigo-800" },
  { id: "premium-service", label: "Dịch vụ cao cấp", color: "bg-gray-100 text-gray-800" },
  { id: "fast-approval", label: "Duyệt nhanh", color: "bg-teal-100 text-teal-800" },
  { id: "high-limit", label: "Hạn mức cao", color: "bg-red-100 text-red-800" },
]

// Bank suggestions
const bankSuggestions = [
  "Vietcombank",
  "BIDV",
  "VietinBank",
  "Techcombank",
  "MB Bank",
  "ACB",
  "VPBank",
  "Sacombank",
  "HDBank",
  "OCB",
]

export default function NewCardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bankSuggestion, setBankSuggestion] = useState<string[]>([])
  const [showBankSuggestions, setShowBankSuggestions] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])
  const [logoUploading, setLogoUploading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [savedCards, setSavedCards] = useState<string[]>([])
  const [showSavedMsg, setShowSavedMsg] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    bank_name: "",
    short_description: "",
    detailed_benefits: "",
    cashback_percent: 0,
    no_annual_fee: true,
    interest_rate_percent: 0,
    max_limit_vnd: 0,
    approval_time: "",
    affiliate_url: "",
    is_visible: true,
    logo_url: "",
    image_url: "",
    highlight_benefits: [] as string[],
    tags: [] as string[],
  })

  const [newBenefit, setNewBenefit] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Lấy danh sách ngân hàng từ bảng banks
    const fetchBanks = async () => {
      const { data } = await supabase.from("banks").select("*")
      if (data) setBanks(data)
    }
    fetchBanks()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("savedCards")
    if (saved) setSavedCards(JSON.parse(saved))
  }, [])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const slug = generateSlug(formData.name)

  // Auto-generate affiliate URL with UTM
  const generateAffiliateUrl = (baseUrl: string, slug: string) => {
    if (!baseUrl) return ""
    const separator = baseUrl.includes("?") ? "&" : "?"
    return `${baseUrl}${separator}utm_source=smartcard&utm_medium=referral&utm_campaign=${slug}`
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleBankNameChange = (value: string) => {
    handleInputChange("bank_name", value)
    if (value.length > 0) {
      const filtered = bankSuggestions.filter((bank) => bank.toLowerCase().includes(value.toLowerCase()))
      setBankSuggestion(filtered)
      setShowBankSuggestions(true)
    } else {
      setShowBankSuggestions(false)
    }
  }

  const selectBank = (bank: string) => {
    handleInputChange("bank_name", bank)
    setShowBankSuggestions(false)
  }

  const addBenefit = () => {
    if (newBenefit.trim() && formData.highlight_benefits.length < 5) {
      setFormData((prev) => ({
        ...prev,
        highlight_benefits: [...prev.highlight_benefits, newBenefit.trim()],
      }))
      setNewBenefit("")
    }
  }

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlight_benefits: prev.highlight_benefits.filter((_, i) => i !== index),
    }))
  }

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter((t) => t !== tagId) : [...prev.tags, tagId],
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Tên thẻ là bắt buộc"
    if (!formData.bank_name.trim()) newErrors.bank_name = "Tên ngân hàng là bắt buộc"
    if (!formData.short_description.trim()) newErrors.short_description = "Mô tả ngắn là bắt buộc"
    if (formData.cashback_percent < 0 || formData.cashback_percent > 100)
      newErrors.cashback_percent = "Hoàn tiền phải từ 0-100%"
    if (formData.interest_rate_percent < 0 || formData.interest_rate_percent > 36)
      newErrors.interest_rate_percent = "Lãi suất phải từ 0-36%"
    if (!formData.affiliate_url.trim()) newErrors.affiliate_url = "Link affiliate là bắt buộc"
    if (!formData.logo_url.trim()) newErrors.logo_url = "Logo ngân hàng là bắt buộc (upload hoặc nhập link)"
    if (!formData.image_url.trim()) newErrors.image_url = "Ảnh thẻ là bắt buộc (upload hoặc nhập link)"
    if (formData.highlight_benefits.length === 0) newErrors.highlight_benefits = "Nhập ít nhất 1 ưu đãi nổi bật"
    if (formData.tags.length === 0) newErrors.tags = "Chọn ít nhất 1 tag nhu cầu/tiêu chí"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `logo_${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage.from('card-assets').upload(fileName, file, { upsert: true })
    if (error) {
      alert('Lỗi upload logo: ' + error.message)
    } else {
      const url = supabase.storage.from('card-assets').getPublicUrl(fileName).data.publicUrl
      setFormData((prev) => ({ ...prev, logo_url: url }))
    }
    setLogoUploading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `card_${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage.from('card-assets').upload(fileName, file, { upsert: true })
    if (error) {
      alert('Lỗi upload ảnh thẻ: ' + error.message)
    } else {
      const url = supabase.storage.from('card-assets').getPublicUrl(fileName).data.publicUrl
      setFormData((prev) => ({ ...prev, image_url: url }))
    }
    setImageUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const bankName = formData.bank_name.trim()
      let bankId = null
      // 1. Tìm ngân hàng theo name
      const { data: banksFound, error: findBankError } = await supabase
        .from("banks")
        .select("*")
        .eq("name", bankName)
        .single()
      if (banksFound && banksFound.id) {
        bankId = banksFound.id
      } else {
        // 2. Nếu chưa có, thêm mới vào bảng banks (truyền đủ các trường text)
        const { data: newBank, error: bankError } = await supabase
          .from("banks")
          .insert([{ name: bankName, code: '', logo_url: '', website_url: '' }])
          .select()
          .single()
        if (bankError || !newBank) {
          setErrors((prev) => ({ ...prev, bank_name: "Không thể thêm ngân hàng mới. Vui lòng thử lại." }))
          setLoading(false)
          return
        }
        bankId = newBank.id
      }
      const finalAffiliateUrl = generateAffiliateUrl(formData.affiliate_url, slug)
      const { data, error } = await supabase.from("credit_cards").insert([
        {
          name: formData.name,
          slug,
          bank_id: bankId,
          short_description: formData.short_description,
          detailed_benefits: formData.detailed_benefits,
          cashback_percent: formData.cashback_percent,
          no_annual_fee: formData.no_annual_fee,
          interest_rate_percent: formData.interest_rate_percent,
          max_limit_vnd: formData.max_limit_vnd,
          approval_time: formData.approval_time,
          affiliate_url: finalAffiliateUrl,
          is_visible: formData.is_visible,
          logo_url: formData.logo_url,
          image_url: formData.image_url,
          highlight_benefits: formData.highlight_benefits,
          tags: formData.tags,
        },
      ])
      if (error) {
        alert("Lỗi: " + error.message)
      } else {
        // Lưu thẻ vào localStorage khi lưu thành công
        let saved = localStorage.getItem("savedCards")
        let savedArr: string[] = saved ? JSON.parse(saved) : []
        if (!savedArr.includes(slug)) {
          savedArr.push(slug)
          localStorage.setItem("savedCards", JSON.stringify(savedArr))
        }
        setShowSavedMsg(true)
        setTimeout(() => setShowSavedMsg(false), 2000)
        alert("Thêm thẻ thành công!")
        router.push("/admin/dashboard")
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi thêm thẻ")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      bank_name: "",
      short_description: "",
      detailed_benefits: "",
      cashback_percent: 0,
      no_annual_fee: true,
      interest_rate_percent: 0,
      max_limit_vnd: 0,
      approval_time: "",
      affiliate_url: "",
      is_visible: true,
      logo_url: "",
      image_url: "",
      highlight_benefits: [],
      tags: [],
    })
    setErrors({})
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const calculateRating = () => {
    let score = 3.5 // Base score
    if (formData.no_annual_fee) score += 0.3
    if (formData.cashback_percent >= 2) score += 0.4
    if (formData.interest_rate_percent <= 20) score += 0.3
    if (formData.approval_time.includes("nhanh") || formData.approval_time.includes("1-2")) score += 0.2
    return Math.min(5, Math.max(1, Math.round(score * 10) / 10))
  }

  const toggleSaveCard = (cardId: string) => {
    let updated: string[]
    if (savedCards.includes(cardId)) {
      updated = savedCards.filter((id) => id !== cardId)
    } else {
      updated = [...savedCards, cardId]
      setShowSavedMsg(true)
      setTimeout(() => setShowSavedMsg(false), 2000)
    }
    setSavedCards(updated)
    localStorage.setItem("savedCards", JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thêm thẻ tín dụng mới</h1>
                <p className="text-sm text-gray-600">Trái tim dữ liệu của Smart Card Finder</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={resetForm} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />💾 Lưu thẻ
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TooltipProvider>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN - FORM */}
            <div className="space-y-6">
              {/* 1. THÔNG TIN CHÍNH */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50">
                  <CardTitle className="flex items-center text-teal-800">
                    <CreditCard className="mr-2 h-5 w-5" />
                    1. Thông tin chính
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Label htmlFor="name">Tên thẻ *</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tên đầy đủ của thẻ tín dụng, ví dụ: "Thẻ tín dụng Techcombank Cashback"</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="VD: Thẻ tín dụng ABC Cashback"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    {slug && (
                      <p className="text-sm text-gray-500 mt-1">
                        Slug: <code className="bg-gray-100 px-1 rounded">{slug}</code>
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-2">
                      <Label htmlFor="bank_name">Ngân hàng *</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tên ngân hàng phát hành thẻ</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => handleBankNameChange(e.target.value)}
                      placeholder="Nhập tên ngân hàng..."
                      className={errors.bank_name ? "border-red-500" : ""}
                      onFocus={() => setShowBankSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowBankSuggestions(false), 200)}
                    />
                    {errors.bank_name && <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>}

                    {/* Bank Suggestions */}
                    {showBankSuggestions && bankSuggestion.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {bankSuggestion.map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                            onClick={() => selectBank(bank)}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Label htmlFor="short_description">Mô tả ngắn *</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mô tả ngắn gọn về thẻ, hiển thị trên card preview</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => handleInputChange("short_description", e.target.value)}
                      placeholder="Mô tả ngắn gọn về thẻ..."
                      rows={3}
                      className={errors.short_description ? "border-red-500" : ""}
                    />
                    {errors.short_description && (
                      <p className="text-red-500 text-sm mt-1">{errors.short_description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="logo_url">Logo ngân hàng (URL)</Label>
                      <Input
                        id="logo_url"
                        value={formData.logo_url}
                        onChange={(e) => handleInputChange("logo_url", e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="mb-2"
                      />
                      <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} />
                      {logoUploading && <p className="text-xs text-blue-500 mt-1">Đang tải lên...</p>}
                    </div>
                    <div>
                      <Label htmlFor="image_url">Ảnh thẻ (URL)</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => handleInputChange("image_url", e.target.value)}
                        placeholder="https://example.com/card.png"
                        className="mb-2"
                      />
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
                      {imageUploading && <p className="text-xs text-blue-500 mt-1">Đang tải lên...</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. ƯU ĐÃI & ĐẶC ĐIỂM */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                  <CardTitle className="flex items-center text-green-800">
                    <Sparkles className="mr-2 h-5 w-5" />
                    2. Ưu đãi & Đặc điểm
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Ưu đãi nổi bật (tối đa 5)</Label>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        placeholder="VD: Hoàn tiền 5% cho mua sắm online"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                        disabled={formData.highlight_benefits.length >= 5}
                      />
                      <Button
                        type="button"
                        onClick={addBenefit}
                        disabled={!newBenefit.trim() || formData.highlight_benefits.length >= 5}
                      >
                        Thêm
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.highlight_benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                          {benefit}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeBenefit(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="detailed_benefits">Ưu đãi chi tiết</Label>
                    <Textarea
                      id="detailed_benefits"
                      value={formData.detailed_benefits}
                      onChange={(e) => handleInputChange("detailed_benefits", e.target.value)}
                      placeholder="Mô tả chi tiết các ưu đãi..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Label htmlFor="cashback_percent">Hoàn tiền (%)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tỷ lệ hoàn tiền tối đa (0-100%)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="cashback_percent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.cashback_percent}
                        onChange={(e) => handleInputChange("cashback_percent", Number.parseFloat(e.target.value) || 0)}
                        className={errors.cashback_percent ? "border-red-500" : ""}
                      />
                      {errors.cashback_percent && (
                        <p className="text-red-500 text-sm mt-1">{errors.cashback_percent}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Label htmlFor="interest_rate_percent">Lãi suất (%/năm)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Lãi suất thẻ tín dụng (0-36%)</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="interest_rate_percent"
                        type="number"
                        min="0"
                        max="36"
                        step="0.1"
                        value={formData.interest_rate_percent}
                        onChange={(e) =>
                          handleInputChange("interest_rate_percent", Number.parseFloat(e.target.value) || 0)
                        }
                        className={errors.interest_rate_percent ? "border-red-500" : ""}
                      />
                      {errors.interest_rate_percent && (
                        <p className="text-red-500 text-sm mt-1">{errors.interest_rate_percent}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max_limit_vnd">Hạn mức tối đa (VNĐ)</Label>
                      <Input
                        id="max_limit_vnd"
                        type="number"
                        min="0"
                        value={formData.max_limit_vnd}
                        onChange={(e) => handleInputChange("max_limit_vnd", Number.parseInt(e.target.value) || 0)}
                        placeholder="50000000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="approval_time">Thời gian duyệt</Label>
                      <Input
                        id="approval_time"
                        value={formData.approval_time}
                        onChange={(e) => handleInputChange("approval_time", e.target.value)}
                        placeholder="VD: 1-3 ngày làm việc"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="no_annual_fee"
                      checked={formData.no_annual_fee}
                      onCheckedChange={(checked) => handleInputChange("no_annual_fee", checked)}
                    />
                    <Label htmlFor="no_annual_fee">Miễn phí thường niên</Label>
                  </div>

                  {/* Tags Selection */}
                  <div>
                    <Label>Tag nhu cầu / tiêu chí</Label>
                    <p className="text-sm text-gray-500 mb-3">Chọn các tag phù hợp để hệ thống gợi ý thông minh</p>
                    <div className="grid grid-cols-2 gap-2">
                      {predefinedTags.map((tag) => (
                        <div
                          key={tag.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            formData.tags.includes(tag.id)
                              ? "border-teal-400 bg-teal-50 shadow-md"
                              : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                          }`}
                          onClick={() => toggleTag(tag.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{tag.label}</span>
                            {formData.tags.includes(tag.id) && (
                              <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                <X className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. TRACKING & TRẠNG THÁI */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center text-blue-800">
                    <Shield className="mr-2 h-5 w-5" />
                    3. Tracking & Trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Label htmlFor="affiliate_url">Link mở thẻ (Affiliate URL) *</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Link đăng ký thẻ, UTM tracking sẽ được tự động thêm</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="affiliate_url"
                      value={formData.affiliate_url}
                      onChange={(e) => handleInputChange("affiliate_url", e.target.value)}
                      placeholder="https://bank.com/apply"
                      className={errors.affiliate_url ? "border-red-500" : ""}
                    />
                    {errors.affiliate_url && <p className="text-red-500 text-sm mt-1">{errors.affiliate_url}</p>}
                    {formData.affiliate_url && slug && (
                      <p className="text-xs text-gray-500 mt-1">
                        Final URL: {generateAffiliateUrl(formData.affiliate_url, slug)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => handleInputChange("is_visible", checked)}
                    />
                    <Label htmlFor="is_visible">Hiển thị công khai</Label>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Tracking tự động</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Clicks</p>
                        <p className="font-semibold">0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Applications</p>
                        <p className="font-semibold">0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">CVR</p>
                        <p className="font-semibold">0%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN - LIVE PREVIEW */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <Card className="shadow-2xl border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-5 w-5" /> Live Preview Card
                    <button
                      className={`ml-auto rounded-full p-2 border-2 ${savedCards.includes(slug) ? "bg-teal-500 border-teal-500 text-white" : "bg-white border-gray-200 text-teal-500 hover:bg-teal-50"}`}
                      onClick={() => toggleSaveCard(slug)}
                      aria-label={savedCards.includes(slug) ? "Bỏ lưu thẻ" : "Lưu thẻ yêu thích"}
                      type="button"
                    >
                      <Heart className={`w-5 h-5 ${savedCards.includes(slug) ? "fill-current" : ""}`} />
                    </button>
                  </CardTitle>
                  {showSavedMsg && (
                    <div className="text-xs text-green-600 mt-1 animate-fade-in">Đã lưu thẻ</div>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border shadow-lg">
                    {/* Logo + Bank Name */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {formData.logo_url ? (
                          <Image
                            src={formData.logo_url || "/placeholder.svg"}
                            alt="Bank Logo"
                            width={50}
                            height={35}
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-600">{formData.bank_name || "Tên ngân hàng"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(calculateRating()) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium text-gray-600 ml-1">{calculateRating()}</span>
                      </div>
                    </div>

                    {/* Card Name + Slug */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.name || "Tên thẻ tín dụng"}</h3>
                    {slug && <p className="text-sm text-gray-500 mb-4">/{slug}</p>}

                    {/* Card Image */}
                    <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-r from-teal-400 to-blue-500">
                      {formData.image_url ? (
                        <Image
                          src={formData.image_url || "/placeholder.svg"}
                          alt="Card"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <CreditCard className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4 text-sm">
                      {formData.short_description || "Mô tả ngắn về thẻ tín dụng..."}
                    </p>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <Percent className="h-4 w-4 text-teal-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Hoàn tiền</p>
                        <p className="font-bold text-teal-600">{formData.cashback_percent}%</p>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Hạn mức</p>
                        <p className="font-bold text-green-600 text-xs">
                          {formData.max_limit_vnd ? formatCurrency(formData.max_limit_vnd) : "N/A"}
                        </p>
                      </div>
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Duyệt thẻ</p>
                        <p className="font-bold text-blue-600 text-xs">{formData.approval_time || "N/A"}</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    {formData.highlight_benefits.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Ưu đãi nổi bật:</h4>
                        <div className="space-y-1">
                          {formData.highlight_benefits.slice(0, 3).map((benefit, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-teal-500 rounded-full mr-2 flex-shrink-0"></div>
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {formData.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {formData.tags.slice(0, 4).map((tagId) => {
                            const tag = predefinedTags.find((t) => t.id === tagId)
                            return (
                              <Badge key={tagId} variant="secondary" className="text-xs">
                                {tag?.label}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-2">
                      <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl">
                        <ExternalLink className="mr-2 h-4 w-4" />✅ MỞ THẺ NGAY
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="🔘 bg-transparent">
                          So sánh
                        </Button>
                        <Button variant="outline" size="sm" className="🔘 bg-transparent">
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetForm} disabled={loading} className="flex-1 bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-2 bg-teal-600 hover:bg-teal-700">
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Lưu...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />💾 Lưu thẻ
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
