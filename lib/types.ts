export interface Bank {
  id: string
  name: string
  code: string
  logo_url: string
  website_url: string
  created_at: string
  updated_at: string
}

export interface CreditCard {
  id: string
  name: string
  slug: string
  bank_id: string
  image_url: string
  logo_url: string
  short_description: string
  detail_url: string
  highlight_benefits: string[]
  detailed_benefits: string
  cashback_percent: number
  no_annual_fee: boolean
  interest_rate_percent: number
  max_limit_vnd: number
  approval_time: string
  tags: string[]
  affiliate_url: string
  is_visible: boolean
  created_at: string
  updated_at: string
  bank?: Bank
}

export interface CriteriaLabel {
  slug: string
  label: string
  description: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface HeroSlide {
  id: string
  title: string
  image_url: string
  associated_criteria: string[]
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  created_at: string
  updated_at: string
}
