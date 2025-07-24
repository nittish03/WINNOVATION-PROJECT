'use client'
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  X, 
  User, 
  BookOpen, 
  Award, 
  Users, 
  LogOut, 
  BarChart3, 
  FileText, 
  MessageSquare,
  Sparkles
} from "lucide-react"

export default function NavBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHover, setActiveHover] = useState(null)
  const navRef = useRef(null)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3, color: "from-blue-500 to-purple-500" },
    { href: "/skills", label: "Skills", icon: Award, color: "from-emerald-500 to-teal-500" },
    { href: "/courses", label: "Courses", icon: BookOpen, color: "from-orange-500 to-red-500" },
    { href: "/my-courses", label: "My Courses", icon: BookOpen, color: "from-pink-500 to-rose-500" },
    { href: "/assignments", label: "Assignments", icon: FileText, color: "from-indigo-500 to-blue-500" },
    { href: "/certificates", label: "Certificates", icon: Award, color: "from-yellow-500 to-orange-500" },
    { href: "/discussions", label: "Discussions", icon: MessageSquare, color: "from-purple-500 to-pink-500" },
  ]

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3, color: "from-violet-500 to-purple-500" },
    { href: "/admin/users", label: "Users", icon: Users, color: "from-blue-500 to-indigo-500" },
    { href: "/admin/skills", label: "Manage Skills", icon: Award, color: "from-emerald-500 to-green-500" },
    { href: "/admin/courses", label: "Manage Courses", icon: BookOpen, color: "from-orange-500 to-amber-500" },
    { href: "/admin/assignments", label: "Assignments", icon: FileText, color: "from-red-500 to-pink-500" },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, color: "from-teal-500 to-cyan-500" },
  ]

  const links = session?.user?.role === "admin" ? adminLinks : studentLinks

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-2xl border-b border-gray-200/50' 
            : 'bg-white/95 backdrop-blur-md shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">


            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl mx-8">
              {session && (
                <AnimatePresence>
                  <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                    {links.map((link, index) => {
                      const Icon = link.icon
                      const isActive = pathname === link.href
                      
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onHoverStart={() => setActiveHover(link.href)}
                          onHoverEnd={() => setActiveHover(null)}
                        >
                          <Link
                            href={link.href}
                            className={`relative flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden group whitespace-nowrap ${
                              isActive
                                ? 'text-white shadow-lg transform scale-105'
                                : 'text-gray-700 hover:text-white hover:shadow-md hover:scale-105'
                            }`}
                          >
                            {/* Animated Background */}
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 ${
                                isActive ? 'opacity-100' : 'group-hover:opacity-100'
                              }`}
                              initial={false}
                              animate={{ opacity: isActive ? 1 : 0 }}
                              whileHover={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                            
                            {/* Shimmer Effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                              animate={
                                activeHover === link.href || isActive
                                  ? { translateX: '200%' }
                                  : { translateX: '-100%' }
                              }
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                            />

                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Icon className="h-4 w-4 relative z-10 flex-shrink-0" />
                            </motion.div>
                            <span className="relative z-10 text-xs xl:text-sm">{link.label}</span>

                            {/* Active Indicator */}
                            {isActive && (
                              <motion.div
                                layoutId="activeTab"
                                className="absolute -bottom-1 left-1/2 w-2 h-2 bg-white rounded-full"
                                style={{ x: '-50%' }}
                              />
                            )}
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
              {session ? (
                <div className="flex items-center space-x-3">
                  {/* Animated User Profile */}
                  <motion.div
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/50"
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="relative h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <User className="h-3 w-3 text-white" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                        animate={{ translateX: ['100%', '-100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-gray-900 truncate max-w-24 xl:max-w-32">
                        {session.user.name || session.user.email}
                      </span>
                      <motion.span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          session.user.role === "admin" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        {session.user.role === "admin" ? "Admin" : "Student"}
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Animated Logout Button */}
                  <motion.button
                    onClick={() => signOut({ callbackUrl: '/signup' })}
                    className="flex items-center space-x-1.5 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LogOut className="h-4 w-4" />
                    </motion.div>
                    <span className="text-sm font-medium hidden xl:block">Logout</span>
                  </motion.button>
                </div>
              ) : (
                /* Guest Navigation with Animations */
                <div className="flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-blue-50"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/singup"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-xl transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 180 }}
                      exit={{ rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                {session ? (
                  <>
                    {/* Mobile User Info */}
                    <motion.div
                      className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl mb-4"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {session.user.name || session.user.email}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {session.user.university || 'Student Portal'}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                          session.user.role === "admin" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {session.user.role === "admin" ? "Admin" : "Student"}
                        </span>
                      </div>
                    </motion.div>

                    {/* Mobile Navigation Links */}
                    <div className="space-y-1 mb-4">
                      {links.map((link, index) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        
                        return (
                          <motion.div
                            key={link.href}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.05 * (index + 2) }}
                          >
                            <Link
                              href={link.href}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                                isActive
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <span>{link.label}</span>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Mobile Logout */}
                    <motion.button
                      onClick={() => {
                        signOut({ callbackUrl: '/login' })
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 w-full text-left rounded-xl transition-all duration-300"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * (links.length + 3) }}
                    >
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                      <span>Logout</span>
                    </motion.button>
                  </>
                ) : (
                  /* Mobile Guest Navigation */
                  <div className="space-y-3">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        href="/login"
                        className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl text-base font-medium transition-all duration-300 text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        href="/signup"
                        className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 shadow-lg text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
