"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
    setMounted(true)
  }, [])

  // 🚨 prevent hydration mismatch
  if (!mounted) return null
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/30 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-secondary/30 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-accent/30 rounded-full blur-[128px] animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Powered by Advanced AI</span>
        </div>

        {/* Main heading */}
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            AI-Powered
          </span>{" "}
          Food Waste Management
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Reduce waste, feed more people using intelligent matching. Our AI connects food donors with NGOs in real-time, ensuring no meal goes to waste.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          
          {/* GET STARTED */}
          <Link href={isLoggedIn ? "/dashboard" : "/register"}>
        <Button 
              size="lg" 
              className="group relative bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 px-8 py-6 text-lg"
            >
          {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
          {/* LOGIN */}
      <Link href={isLoggedIn ? "/dashboard" : "/login"}>
        <Button 
              size="lg" 
              variant="outline" 
              className="border-border/60 bg-background/50 backdrop-blur-sm text-foreground hover:bg-muted/50 px-8 py-6 text-lg"
            >
          {isLoggedIn ? "Open App" : "Login"}
        </Button>
      </Link>

        </div>

        {/* Hero illustration / Abstract AI graphic */}
        <div className="relative mt-16 lg:mt-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl" />
          </div>
          
          <div className="relative mx-auto max-w-4xl">
            {/* Glassmorphism card with AI visualization */}
            <div className="relative rounded-2xl border border-border/40 bg-card/30 p-8 backdrop-blur-xl shadow-2xl">
              <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="grid grid-cols-3 gap-6">
                {/* Donor node */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">Food Donors</span>
                </div>

                {/* AI Core */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-accent/30 blur-md animate-pulse" />
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-accent-foreground" />
                    </div>
                    {/* Connection lines */}
                    <svg className="absolute -left-16 top-1/2 -translate-y-1/2 w-16 h-4" viewBox="0 0 64 16">
                      <path d="M0 8 H64" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                          <stop offset="100%" stopColor="var(--accent)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <svg className="absolute -right-16 top-1/2 -translate-y-1/2 w-16 h-4" viewBox="0 0 64 16">
                      <path d="M0 8 H64" stroke="url(#gradient2)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                      <defs>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--accent)" />
                          <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">AI Matching</span>
                </div>

                {/* NGO node */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-secondary/30 blur-md animate-pulse" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center">
                      <svg className="h-8 w-8 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">NGOs</span>
                </div>
              </div>

              {/* Bottom glow */}
              <div className="absolute -bottom-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
