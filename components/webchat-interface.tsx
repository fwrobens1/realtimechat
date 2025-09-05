"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileImage, Smile, Send, Plus, Settings, User } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
  senderName: string
}

interface Conversation {
  id: string
  name: string
  lastMessage: string
  timestamp: Date
  avatar?: string
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "General",
    lastMessage: "Welcome to the general chat!",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    name: "Development Team",
    lastMessage: "Meeting at 3 PM today",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    name: "Design Discussion",
    lastMessage: "New mockups are ready for review",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "4",
    name: "Random Chat",
    lastMessage: "Anyone up for lunch?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Welcome to the general chat! Feel free to discuss anything here.",
    sender: "other",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    senderName: "Admin",
  },
  {
    id: "2",
    content: "Thanks! This looks like a great place to connect with everyone.",
    sender: "user",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    senderName: "You",
  },
  {
    id: "3",
    content: "We're excited to have you here. Don't hesitate to ask questions or share ideas.",
    sender: "other",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    senderName: "Admin",
  },
  {
    id: "4",
    content: "I'm looking forward to collaborating with everyone on upcoming projects.",
    sender: "user",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    senderName: "You",
  },
]

export function WebchatInterface() {
  const [selectedConversation, setSelectedConversation] = useState<string>("1")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(mockMessages)

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: "user",
        timestamp: new Date(),
        senderName: "You",
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const selectedConv = mockConversations.find((c) => c.id === selectedConversation)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-sidebar-foreground">Chats</h1>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-1">
            {mockConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`flex items-center gap-3 p-2 mx-1 my-1 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === conversation.id
                    ? "bg-slate-800/60 text-white border border-slate-700/50"
                    : "text-sidebar-foreground hover:bg-slate-800/30 hover:border hover:border-slate-700/30"
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-slate-600 text-white text-xs">
                    {conversation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate text-sm">{conversation.name}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTime(conversation.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 justify-start text-sidebar-foreground hover:bg-sidebar-accent h-8 text-sm"
            >
              <Settings className="h-3 w-3 mr-2" />
              Settings
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent">
              <User className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-sidebar-border bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConv?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-slate-600 text-white">
                {selectedConv?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-card-foreground">{selectedConv?.name}</h2>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-end gap-2 max-w-xs lg:max-w-md">
                  {msg.sender === "other" && (
                    <Avatar className="h-7 w-7">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-slate-600 text-white text-xs">
                        {msg.senderName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl shadow-sm ${
                      msg.sender === "user"
                        ? "bg-slate-800/80 text-white rounded-br-sm border border-slate-700/50"
                        : "bg-slate-800/60 text-white rounded-bl-sm border border-slate-600/50"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-1">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Snapchat-inspired Input Bar */}
        <div className="p-4 bg-background">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-slate-800/60 text-white hover:bg-slate-800/80 border border-slate-700/50"
            >
              <FileImage className="h-5 w-5" />
            </Button>

            {/* Input Field */}
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Send a message..."
                className="rounded-full bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border"
              />
              {/* Emoji Button inside input */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-slate-800/60 text-white hover:bg-slate-800/80 border border-slate-700/50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
