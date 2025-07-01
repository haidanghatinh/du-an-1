"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Sparkles, Send, User, Bot } from "lucide-react"

interface Message {
  id?: string
  role: "user" | "assistant"
  content: string
  created_at?: string
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Load chat history (optional, nếu muốn lưu vào Supabase)
  useEffect(() => {
    // Có thể load lịch sử chat từ Supabase nếu muốn
  }, [])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    // Gửi tới OpenAI API hoặc Supabase Edge Function (mockup demo)
    let aiReply = ""
    try {
      // Demo: trả lời cứng, bạn có thể tích hợp OpenAI API tại đây
      if (input.toLowerCase().includes("hoàn tiền")) {
        aiReply = "Bạn nên chọn các thẻ có tag 'hoàn tiền cao' như Techcombank Cashback, VPBank StepUp..."
      } else if (input.toLowerCase().includes("du lịch")) {
        aiReply = "Bạn nên chọn thẻ có ưu đãi du lịch như Vietcombank Visa Platinum, BIDV Premier..."
      } else {
        aiReply = "Tôi là trợ lý AI, hãy hỏi tôi về các loại thẻ tín dụng, ưu đãi, hoặc nhu cầu của bạn!"
      }
      // Lưu lịch sử chat vào Supabase (bảng ai_conversations nếu muốn)
      await supabase.from("ai_conversations").insert([
        { role: "user", content: userMsg.content },
        { role: "assistant", content: aiReply },
      ])
    } catch (e) {
      aiReply = "Xin lỗi, hiện tại tôi chưa thể trả lời. Vui lòng thử lại sau."
    }
    setMessages((prev) => [...prev, { role: "assistant", content: aiReply }])
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <Sparkles className="h-6 w-6 text-teal-600" />
          <h1 className="text-xl font-bold text-gray-900">Trợ Lý AI - Tư vấn thẻ tín dụng</h1>
        </div>
      </div>
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-2 py-4">
        <Card className="flex-1 flex flex-col shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-teal-700 text-lg">Chat với AI về thẻ tín dụng</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 overflow-y-auto" ref={chatRef} style={{ minHeight: 400 }}>
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">Hãy đặt câu hỏi về thẻ tín dụng, ưu đãi, nhu cầu của bạn...</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow text-sm ${msg.role === "user" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                  <div className="flex items-center space-x-2">
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-teal-500" />}
                    <span>{msg.content}</span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-800 shadow text-sm flex items-center space-x-2 animate-pulse">
                  <Bot className="w-4 h-4 text-teal-500" />
                  <span>Đang trả lời...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex items-center space-x-2 mt-4">
          <Input
            placeholder="Nhập câu hỏi về thẻ tín dụng, ưu đãi, nhu cầu..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-teal-600 hover:bg-teal-700">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
} 