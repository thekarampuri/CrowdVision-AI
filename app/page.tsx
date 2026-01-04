"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Shield, Scan } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const { login, signup, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }
        await signup(formData.email, formData.password)
      } else {
        await login(formData.email, formData.password)
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      await loginWithGoogle()
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGuestAccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl flex items-center justify-center gap-12">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col gap-8 flex-1">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center glow-blue">
                    <Scan className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 blur opacity-50 -z-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">CrowdVision AI</h1>
                  <p className="text-sm text-cyan-400 font-mono">Smart Surveillance System</p>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-3xl p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Advanced Crowd Detection</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Real-time YOLOv8 powered crowd monitoring with intelligent density analysis and geo-based heatmap
                    visualization
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">99.9%</div>
                  <div className="text-xs text-slate-400">Accuracy</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="text-2xl font-bold text-blue-400 mb-1">Real-time</div>
                  <div className="text-xs text-slate-400">Detection</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">24/7</div>
                  <div className="text-xs text-slate-400">Monitoring</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="w-full max-w-md">
            <div className="glass-strong rounded-3xl p-8 glow-blue">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Scan className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">CrowdVision AI</h1>
                  <p className="text-xs text-cyan-400 font-mono">Smart Surveillance</p>
                </div>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-8 p-1 glass rounded-2xl">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    mode === "login"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    mode === "signup"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-200 text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30 h-12"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200 text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="officer@crowdvision.ai"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30 h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30 h-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-200 text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="glass border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/30 h-12"
                      required
                    />
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex items-center justify-end">
                    <button type="button" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 disabled:opacity-50"
                >
                  {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-transparent px-4 text-slate-400 font-medium">OR CONTINUE WITH</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-12 glass border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl font-medium transition-all bg-transparent disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <Button
                  type="button"
                  onClick={handleGuestAccess}
                  variant="outline"
                  className="w-full h-12 glass border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl font-medium transition-all bg-transparent"
                >
                  Continue as Guest
                </Button>
              </form>

              {mode === "signup" && (
                <p className="mt-6 text-xs text-center text-slate-400 leading-relaxed">
                  By signing up, you agree to our{" "}
                  <button className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms of Service</button> and{" "}
                  <button className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy Policy</button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass rounded-full px-6 py-3 text-xs text-slate-400 font-mono">
        Secured by CrowdVision AI • Version 1.0
      </div>
    </div>
  )
}
