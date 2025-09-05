"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileImage, Smile, Send, Plus, Settings, User, X } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
  senderName: string
  sending?: boolean
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
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatName, setNewChatName] = useState("")

  const handleSendMessage = async () => {
    if (message.trim()) {
      setIsSending(true)

      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: "user",
        timestamp: new Date(),
        senderName: "You",
        sending: true,
      }

      setMessages([...messages, newMessage])
      setMessage("")

      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, sending: false } : msg)))
        setIsSending(false)

        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 2000)
      }, 500)
    }
  }

  const handleCreateNewChat = () => {
    if (newChatName.trim()) {
      console.log("Creating new chat:", newChatName)
      setNewChatName("")
      setShowNewChatModal(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-96 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Create New Chat</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowNewChatModal(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="Enter chat name..."
                className="w-full"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateNewChat()
                  }
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewChatModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewChat}>Create Chat</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-sidebar-foreground">Chats</h1>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 hover:scale-105"
              onClick={() => setShowNewChatModal(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-1">
            {mockConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`flex items-center gap-3 p-2 mx-1 my-1 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
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

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 justify-start text-sidebar-foreground hover:bg-sidebar-accent h-8 text-sm transition-colors duration-200"
            >
              <Settings className="h-3 w-3 mr-2" />
              Settings
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-200"
            >
              <User className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
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

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} ${
                  msg.sending ? "animate-pulse" : "animate-in slide-in-from-bottom-2 duration-300"
                }`}
              >
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
                    className={`px-3 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
                      msg.sender === "user"
                        ? "bg-slate-800/80 text-white rounded-br-sm border border-slate-700/50"
                        : "bg-slate-800/60 text-white rounded-bl-sm border border-slate-600/50"
                    } ${msg.sending ? "opacity-70" : "opacity-100"}`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-1 flex items-center gap-1">
                      {formatTime(msg.timestamp)}
                      {msg.sending && <span className="animate-spin">⏳</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-end gap-2 max-w-xs lg:max-w-md">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-slate-600 text-white text-xs">A</AvatarFallback>
                  </Avatar>
                  <div className="px-3 py-2 rounded-2xl bg-slate-800/60 text-white rounded-bl-sm border border-slate-600/50">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                      <span className="text-xs ml-2 opacity-60">typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-slate-800/60 text-white hover:bg-slate-800/80 border border-slate-700/50 transition-all duration-200 hover:scale-105"
            >
              <FileImage className="h-5 w-5" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Send a message..."
                className="rounded-full bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 h-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border transition-all duration-200"
                disabled={isSending}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleSendMessage}
              size="icon"
              variant="secondary"
              disabled={isSending || !message.trim()}
              className={`h-10 w-10 rounded-full bg-slate-800/60 text-white hover:bg-slate-800/80 border border-slate-700/50 transition-all duration-200 ${
                isSending ? "animate-pulse" : "hover:scale-105"
              } ${!message.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Send className={`h-5 w-5 transition-transform duration-200 ${isSending ? "scale-75" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
