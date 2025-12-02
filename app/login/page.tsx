'use client'

import { useState, useEffect, useRef } from 'react'
import { useLoginMutation } from '../../lib/store/api/authApi'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Mail, Lock, Eye, EyeOff, Building2, Globe, Shield, Zap, Database, Banknote, Factory, Sparkles, ArrowRight, CheckCircle, MapPin, Phone, ExternalLink } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [login, { isLoading, error }] = useLoginMutation()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const containerRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    // Auto switch theme based on time for dramatic effect
    const hour = new Date().getHours()
    if (hour >= 18 || hour < 6) {
      setTheme('dark')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password }).unwrap()
      window.location.href = document.referrer || "/"
    } catch (err) {
      // Error handled by RTK Query
    }
  }

  const products = [
    {
      icon: <Database className="h-6 w-6" />,
      title: "Inventory Pro",
      description: "AI-powered inventory management with predictive analytics",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: <Banknote className="h-6 w-6" />,
      title: "Business Suite",
      description: "Complete enterprise resource planning solution",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: <Factory className="h-6 w-6" />,
      title: "Office Nexus",
      description: "Seamless office automation & collaboration platform",
      color: "from-yellow-500 to-orange-400"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "BankSecure",
      description: "Advanced banking solutions with military-grade security",
      color: "from-orange-600 to-red-500"
    }
  ]

  const features = [
    "Real-time Analytics Dashboard",
    "AI-Powered Automation",
    "Cloud & On-Premise Solutions",
    "24/7 Enterprise Support",
    "Custom Development",
    "GDPR & ISO Certified"
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950/20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-r from-orange-600/5 to-red-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-md opacity-70 animate-pulse" />
              <Avatar className="h-14 w-14 relative border-2 border-orange-500/20 shadow-lg">
                <AvatarImage src="https://i.ibb.co.com/VYgw7dnt/Whats-App-Image-2025-09-02-at-11-58-46-PM-removebg-preview.png" alt="Inovate IT" />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                  <Sparkles className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Inovate IT
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Gulshan, Dhaka, Bangladesh
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400">
              <Sparkles className="h-3 w-3 mr-1" />
              Enterprise Ready
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-gray-600 dark:text-gray-400"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 min-h-[calc(100vh-12rem)]">
          {/* Left Side - Marketing */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Card className="h-full border-0 bg-gradient-to-br from-white/80 to-orange-50/80 dark:from-gray-900/80 dark:to-orange-950/20 backdrop-blur-sm shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full translate-y-20 -translate-x-20" />
              
              <CardContent className="p-8 relative z-10">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-clip-text text-transparent animate-gradient">
                    Transforming Businesses with <span className="text-shadow-orange-glow">Innovation</span>
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    Inovate IT is a premier software solutions firm revolutionizing how businesses operate across Bangladesh and beyond. We blend cutting-edge technology with deep industry expertise.
                  </p>
                </motion.div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, translateY: -5 }}
                      className="group cursor-pointer"
                    >
                      <Card className="border border-orange-500/20 bg-gradient-to-br from-white to-white/50 dark:from-gray-800 dark:to-gray-800/50 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${product.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            {product.icon}
                          </div>
                          <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{product.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="p-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-8 pt-6 border-t border-orange-500/20"
                >
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">500+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Clients</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">50+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Products</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">24/7</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
            ref={containerRef}
          >
            <Card className="h-full border-0 bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Animated border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 animate-gradient-x" />
              
              <CardContent className="p-8 relative z-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-gradient-to-r from-orange-500/10 to-amber-500/10 p-1">
                    <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                      <Zap className="h-4 w-4 mr-2" />
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="demo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Live Demo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                          Welcome Back
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Access your enterprise dashboard
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Enterprise Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="admin@yourcompany.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="bg-white/50 dark:bg-gray-800/50 border-orange-500/20 focus:border-orange-500 focus:ring-orange-500/20 pl-4"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white/50 dark:bg-gray-800/50 border-orange-500/20 focus:border-orange-500 focus:ring-orange-500/20 pl-4 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
                                <AlertDescription>
                                  Invalid credentials. Please try again.
                                </AlertDescription>
                              </Alert>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 group"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Authenticating...
                              </>
                            ) : (
                              <>
                                Access Dashboard
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Need an enterprise account?{' '}
                          <Button variant="link" className="text-orange-500 hover:text-orange-600 p-0">
                            Contact Sales
                          </Button>
                        </p>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="demo">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6 text-center py-8"
                    >
                      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl mb-6">
                        <Zap className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                        <h3 className="text-xl font-bold mb-2">Experience Our Platform</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Try our live demo with sample enterprise data
                        </p>
                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                          Launch Demo Dashboard
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6 bg-orange-500/20" />

                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Button variant="outline" size="sm" className="border-orange-500/30 hover:bg-orange-500/10">
                      <Phone className="h-3 w-3 mr-2" />
                      +880 1234 567890
                    </Button>
                    <Button variant="outline" size="sm" className="border-orange-500/30 hover:bg-orange-500/10">
                      <Globe className="h-3 w-3 mr-2" />
                      www.inovate-it.com
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    © 2024 Inovate IT. All enterprise solutions protected.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
            initial={{
              x: Math.random() * 100 + 'vw',
              y: Math.random() * 100 + 'vh',
            }}
            animate={{
              x: [null, Math.random() * 100 + 'vw'],
              y: [null, Math.random() * 100 + 'vh'],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
        
        .text-shadow-orange-glow {
          text-shadow: 0 0 20px rgba(255, 107, 0, 0.5);
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient-x 2s ease infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}