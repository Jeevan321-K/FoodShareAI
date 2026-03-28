"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight, User, Building2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "donor" as "donor" | "ngo",
  })

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    // 💡 Use the Dynamic API Base from Vercel Env
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";
    
    console.log(`Registering via: ${API_BASE}/auth/register`);

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
    })

    const data = await res.json()

    if (res.ok) {
      alert("Registered successfully ✅")
      router.push("/login")
    } else {
      // Show the actual error from your Backend (e.g. "User already exists")
      alert(data.message || "Registration failed")
    }

  } catch (err) {
    console.error("Connection Error:", err)
    alert("Could not connect to the server. Is the backend running?")
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-teal-500/10 to-emerald-500/20" />
        
        {/* Animated Orbs */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-emerald-500/25 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-300" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">FoodShareAI</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
            Join the movement against food waste
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-md text-pretty">
            Whether you&apos;re a restaurant, grocery store, or NGO - together we can make a difference in fighting hunger and reducing waste.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-medium text-foreground">Connect with NGOs</div>
                <div className="text-sm text-muted-foreground">Find nearby organizations instantly</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="font-medium text-foreground">AI-Powered Matching</div>
                <div className="text-sm text-muted-foreground">Smart recommendations for donations</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="font-medium text-foreground">Track Your Impact</div>
                <div className="text-sm text-muted-foreground">See how many meals you&apos;ve helped save</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">FoodCycle</span>
          </div>

          {/* Glassmorphism Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-75" />
            
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
                <p className="text-muted-foreground">Start your journey in reducing food waste</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-11 pr-11 h-12 bg-secondary/50 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "donor" })}
                      className={`relative p-4 rounded-xl border transition-all duration-300 ${
                        formData.role === "donor"
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      {formData.role === "donor" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-xl" />
                      )}
                      <div className="relative flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.role === "donor" ? "bg-emerald-500/20" : "bg-secondary"
                        }`}>
                          <Heart className={`w-5 h-5 ${formData.role === "donor" ? "text-emerald-400" : "text-muted-foreground"}`} />
                        </div>
                        <span className={`font-medium ${formData.role === "donor" ? "text-emerald-400" : "text-foreground"}`}>
                          Donor
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Restaurant, Store, Individual
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "ngo" })}
                      className={`relative p-4 rounded-xl border transition-all duration-300 ${
                        formData.role === "ngo"
                          ? "border-cyan-500/50 bg-cyan-500/10"
                          : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      {formData.role === "ngo" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-xl" />
                      )}
                      <div className="relative flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.role === "ngo" ? "bg-cyan-500/20" : "bg-secondary"
                        }`}>
                          <Building2 className={`w-5 h-5 ${formData.role === "ngo" ? "text-cyan-400" : "text-muted-foreground"}`} />
                        </div>
                        <span className={`font-medium ${formData.role === "ngo" ? "text-cyan-400" : "text-foreground"}`}>
                          NGO
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Food Bank, Shelter, Charity
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Register Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </form>

              {/* Login Link */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
