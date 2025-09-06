"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

interface AuthFormProps {
  onSuccess: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'guest'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signUp, signIn, signInAsGuest } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'guest') {
        if (!username.trim()) {
          throw new Error('Username is required')
        }
        await signInAsGuest(username.trim())
      } else if (mode === 'signup') {
        if (!email || !password || !username.trim()) {
          throw new Error('All fields are required')
        }
        await signUp(email, password, username.trim())
      } else {
        if (!email || !password) {
          throw new Error('Email and password are required')
        }
        await signIn(email, password)
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-card-foreground mb-2">
              Welcome to Chat
            </h1>
            <p className="text-muted-foreground">
              {mode === 'guest' 
                ? 'Enter a username to start chatting'
                : mode === 'signup'
                ? 'Create your account'
                : 'Sign in to your account'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'guest' && (
              <>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {(mode === 'signup' || mode === 'guest') && (
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : 
                mode === 'guest' ? 'Start Chatting' :
                mode === 'signup' ? 'Sign Up' : 'Sign In'
              }
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            {mode !== 'guest' && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setMode('guest')}
                disabled={loading}
              >
                Quick Chat (No Account)
              </Button>
            )}

            <div className="text-center text-sm text-muted-foreground">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Want to create an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}