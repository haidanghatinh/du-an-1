"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, CreditCard } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = () => {
    const element = document.getElementById("criteria-section")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">Smart Card Finder</span>
              <p className="text-xs text-gray-500 hidden sm:block">Tìm thẻ tín dụng phù hợp</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/cards" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
              Danh sách thẻ
            </Link>
            <Link href="/suggestions" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
              Tìm kiếm
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
              Liên hệ
            </Link>
            <Link href="/chat" className="text-gray-700 hover:text-teal-600 transition-colors font-medium">
              Tư vấn AI
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-red-600 transition-colors font-bold">
              Admin
            </Link>
            <Button
              onClick={scrollToSection}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Bắt đầu tìm thẻ
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="/cards"
                className="block px-3 py-2 text-gray-700 hover:text-teal-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Danh sách thẻ
              </Link>
              <Link
                href="/suggestions"
                className="block px-3 py-2 text-gray-700 hover:text-teal-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Tìm kiếm
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-teal-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Liên hệ
              </Link>
              <Link
                href="/chat"
                className="block px-3 py-2 text-gray-700 hover:text-teal-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Tư vấn AI
              </Link>
              <Link
                href="/admin"
                className="block px-3 py-2 text-red-600 hover:text-red-700 font-bold"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
              <Button
                onClick={() => {
                  setIsOpen(false)
                  scrollToSection()
                }}
                className="w-full mt-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                Bắt đầu tìm thẻ
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
