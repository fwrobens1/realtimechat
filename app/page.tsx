'use client'

import { AuthForm } from "@/components/auth/auth-form"
import { WebchatInterface } from "@/components/webchat-interface"
import { useAuth } from "@/hooks/useAuth"

function HomePage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <AuthForm onSuccess={() => {}} />
  }

  return (
    <div className="h-screen w-full">
      <WebchatInterface />
    </div>
  )
}

export default function Home() {
  return (
    <HomePage />
  )
}
