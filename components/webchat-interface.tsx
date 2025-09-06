"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileImage, Smile, Send, Plus, Settings, User, X, Reply, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"

// Generate a proper UUID for the default conversation
const GENERAL_CONVERSATION_ID = "00000000-0000-0000-0000-000000000001"

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
  senderName: string
  sending?: boolean
  replyTo?: {
    id: string
    content: string
    senderName: string
  }
}

interface Conversation {
  id: string
  name: string
  lastMessage: string
  timestamp: Date
  avatar?: string
}

const defaultConversations: Conversation[] = [
  {
    id: GENERAL_CONVERSATION_ID,
    name: "General",
    lastMessage: "Start chatting...",
    timestamp: new Date(),
  },
]

export function WebchatInterface() {
  const { user, profile, signOut } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string>(GENERAL_CONVERSATION_ID)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>(defaultConversations)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user && selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [user, selectedConversation])

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey (username)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.user_id === user?.id ? 'user' : 'other',
        timestamp: new Date(msg.created_at),
        senderName: msg.user_id === user?.id ? 'You' : msg.profiles.username,
        replyTo: msg.reply_to ? {
          id: msg.reply_to,
          content: '', // We'd need to fetch this separately if needed
          senderName: ''
        } : undefined
      }))

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (message.trim() && user) {
      setIsSending(true)

      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: selectedConversation,
            user_id: user.id,
            content: message.trim(),
            reply_to: replyingTo?.id || null
          })
          .select()
          .single()

        if (error) throw error

        const newMessage: Message = {
          id: data.id,
          content: data.content,
          sender: "user",
          timestamp: new Date(data.created_at),
          senderName: "You",
          replyTo: replyingTo
            ? {
                id: replyingTo.id,
                content: replyingTo.content,
                senderName: replyingTo.senderName,
              }
            : undefined,
        }

        setMessages([...messages, newMessage])
        setMessage("")
        setReplyingTo(null)
      } catch (error) {
        console.error('Error sending message:', error)
      } finally {
        setIsSending(false)
      }
    }
  }

  const handleCreateNewChat = () => {
    if (newChatName.trim()) {
      console.log("Creating new chat:", newChatName)
      setNewChatName("")
      setShowNewChatModal(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
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

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

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
            <div className="flex items-center gap-1">
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
          {profile && (
            <div className="mt-3 p-2 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-slate-600 text-white text-xs">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile.is_guest ? 'Guest' : 'Member'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-1">
            {conversations.map((conversation) => (
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
              onClick={handleSignOut}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-200"
            >
              <LogOut className="h-3 w-3" />
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
                onMouseEnter={() => setHoveredMessage(msg.id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div className="flex items-end gap-2 max-w-xs lg:max-w-md relative">
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
                    {msg.replyTo && (
                      <div className="mb-2 pl-2 border-l-2 border-slate-500/50">
                        <p className="text-xs text-slate-400 font-medium">{msg.replyTo.senderName}</p>
                        <p className="text-xs text-slate-300 line-clamp-1 max-w-[200px] truncate">
                          {msg.replyTo.content.length > 50
                            ? `${msg.replyTo.content.substring(0, 50)}...`
                            : msg.replyTo.content}
                        </p>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-1 flex items-center gap-1">
                      {formatTime(msg.timestamp)}
                      {msg.sending && <span className="animate-spin">⏳</span>}
                    </p>
                  </div>
                  {msg.sender === "other" && hoveredMessage === msg.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleReply(msg)}
                      className="absolute -top-2 right-0 h-6 w-6 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-full opacity-0 animate-in fade-in-0 duration-200 opacity-100"
                    >
                      <Reply className="h-3 w-3" />
                    </Button>
                  )}
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
          {replyingTo && (
            <div className="mb-2 p-2 bg-slate-800/30 rounded-lg border-l-2 border-slate-500/50 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Reply className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">Replying to {replyingTo.senderName}</span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-[300px]">
                  {replyingTo.content.length > 60 ? `${replyingTo.content.substring(0, 60)}...` : replyingTo.content}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={cancelReply}
                className="h-6 w-6 text-slate-400 hover:text-white flex-shrink-0 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
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
