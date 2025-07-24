"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavLink from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname, redirect } from "next/navigation";
import { CgProfile } from "react-icons/cg";
import { FiMenu, FiX, FiHome, FiCloud, FiType, FiSquare, FiUser, FiLogOut, FiStar } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect with enhanced logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    signOut();
    toast.success("Logged out successfully!", {
      style: {
        background: 'linear-gradient(135deg, #10B981, #059669)',
        color: 'white',
        borderRadius: '12px',
        padding: '16px',
      },
      duration: 3000,
    });
    router.push("/");
  };

  // Enhanced navigation items with better icons
  const navItems = [
    { name: "Home", href: "/", icon: FiHome, color: "from-blue-500 to-cyan-500" },
    { name: "Cloudinary", href: "/cloudinary", icon: FiCloud, color: "from-purple-500 to-pink-500" },
    { name: "Text", href: "/text", icon: FiType, color: "from-green-500 to-emerald-500" },
    { name: "QR", href: "/qr", icon: FiSquare, color: "from-orange-500 to-red-500" },
  ];

  // Enhanced animation variants
  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const mobileItemVariants = {
    closed: { x: -30, opacity: 0, scale: 0.9 },
    open: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <motion.nav
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 inset-x-0 w-full z-50 transition-all duration-700 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-2xl shadow-2xl shadow-blue-500/20 border-b border-white/20' 
          : 'bg-black/70 backdrop-blur-xl'
      }`}
    >
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.4, 0.2, 0.4],
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 7.5
          }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + (i % 2) * 60}%`
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
          />
        ))}
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex items-center justify-between h-full mx-auto max-w-7xl">
          {/* Enhanced Logo and Social Section */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-4 sm:gap-6"
          >
            {/* Enhanced Profile Image */}
<div className="relative w-12 h-12 sm:w-14 sm:h-14">
  <Image
    src="/me.jpg"
    width={56}
    height={56}
    alt="Profile"
    className="rounded-full w-full h-full object-cover"
    priority
  />
  
  {/* Online indicator */}
  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
</div>



            {/* Enhanced Social Links */}
            <div className="hidden sm:flex items-center gap-3">
              {[
                {
                  href: "https://www.instagram.com/nittish_baboria",
                  icon: "https://skillicons.dev/icons?i=instagram",
                  alt: "Instagram",
                  gradient: "from-pink-500 via-purple-500 to-orange-500",
                  shadow: "shadow-pink-500/30"
                },
                {
                  href: "https://www.linkedin.com/in/nittish-baboria/",
                  icon: "https://skillicons.dev/icons?i=linkedin",
                  alt: "LinkedIn",
                  gradient: "from-blue-600 via-blue-500 to-cyan-500",
                  shadow: "shadow-blue-500/30"
                },
                {
                  href: "https://github.com/nittish03",
                  icon: "https://skillicons.dev/icons?i=github",
                  alt: "GitHub",
                  gradient: "from-gray-700 via-gray-600 to-gray-500",
                  shadow: "shadow-gray-500/30"
                }
              ].map((social, index) => (
                <motion.button
                  key={social.href}
                  onClick={() => window.open(social.href, "_blank")}
                  className={`relative p-3 rounded-2xl bg-gradient-to-br ${social.gradient} shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden ${social.shadow} hover:shadow-lg`}
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ 
                    delay: 0.3 + index * 0.1, 
                    type: "spring", 
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={{ 
                    scale: 1.15, 
                    y: -3,
                    rotate: 5
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img 
                    src={social.icon} 
                    className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110" 
                    alt={social.alt}
                  />
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                    animate={{
                      x: ["-100%", "100%"]
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                  />
                  
                  <motion.div
                    className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Mobile Menu Toggle */}
          <motion.button
            variants={itemVariants}
            className="md:hidden relative p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            onClick={() => setMenuOpen(!menuOpen)}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={menuOpen ? 'close' : 'menu'}
                initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className="text-white text-2xl"
              >
                {menuOpen ? <FiX /> : <FiMenu />}
              </motion.div>
            </AnimatePresence>
            
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-200"
              whileTap={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.3, 0]
              }}
              transition={{ duration: 0.4 }}
            />
          </motion.button>

          {/* Enhanced Desktop Menu */}
          <motion.ul 
            variants={itemVariants}
            className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-2xl rounded-full px-8 py-4 border border-white/10 shadow-2xl"
          >
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <motion.li 
                  key={item.href} 
                  className="relative"
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.4 + index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  <NavLink 
                    href={item.href} 
                    className={`relative flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-500 group ${
                      isActive 
                        ? `text-white bg-gradient-to-r ${item.color} shadow-lg shadow-current/30` 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <motion.div
                      whileHover={{ 
                        rotate: 360, 
                        scale: 1.2,
                        filter: "drop-shadow(0 0 8px currentColor)"
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={isActive ? "text-white" : ""}
                    >
                      <Icon size={18} />
                    </motion.div>
                    
                    <span className="hidden lg:block relative z-10">{item.name}</span>
                    
                    {/* Enhanced active indicator */}
                    {isActive && (
                      <>
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                          layoutId="navbar-active-bar"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-current/10"
                          layoutId="navbar-active-bg"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      </>
                    )}

                    {/* Enhanced hover effects */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)"
                      }}
                    />
                    
                    {/* Particle effect for active item */}
                    {isActive && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </NavLink>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* Enhanced Auth Controls */}
          <motion.div 
            variants={itemVariants}
            className="hidden md:flex items-center gap-4"
          >
            {session ? (
              <motion.div 
                className="flex items-center gap-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                {/* Enhanced welcome message */}
                <motion.div
                  className="relative px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 overflow-hidden group"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
                  }}
                >
                  <span className="text-white font-medium text-sm relative z-10 flex items-center gap-2">
                    <FiUser size={16} />
                    Welcome, {session.user?.name?.split(" ")[0]} 
                    <motion.span
                      animate={{ rotate: [0, 20, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    >
                      ✨
                    </motion.span>
                  </span>
                  
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                    animate={{
                      background: [
                        "linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                        "linear-gradient(180deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))",
                        "linear-gradient(270deg, rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>

                {/* Enhanced logout button */}
                <motion.button
                  className="relative flex items-center justify-center bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                  onClick={handleLogout}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -5, 5, 0],
                    boxShadow: "0 15px 35px rgba(239, 68, 68, 0.4)"
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FiLogOut size={20} className="relative z-10" />
                  </motion.div>
                  
                  {/* Ripple effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100"
                    whileHover={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.02 }}
              >
                <NavLink href="/login">
                  <motion.button
                    className="relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 transform-gpu overflow-hidden group"
                    whileHover={{ 
                      scale: 1.05, 
                      y: -2,
                      boxShadow: "0 25px 50px rgba(59, 130, 246, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Enhanced shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                      animate={{
                        x: ["-150%", "150%"],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Content with enhanced animation */}
                    <span className="relative z-10 flex items-center gap-3">
                      <FiStar className="group-hover:rotate-12 transition-transform duration-300" />
                      Get Started
                      <motion.span
                        animate={{ 
                          x: [0, 4, 0],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                      >
                        ✨
                      </motion.span>
                    </span>
                    
                    {/* Multiple hover layers */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  </motion.button>
                </NavLink>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Ultra Enhanced Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden absolute top-20 left-0 w-full bg-black/98 backdrop-blur-2xl border-t border-white/20 shadow-2xl overflow-hidden"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Mobile menu background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
            
            <div className="relative p-8 space-y-8">
              {/* Mobile Navigation with enhanced animations */}
              <div className="space-y-4">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <motion.div
                      key={item.href}
                      variants={mobileItemVariants}
                    >
                      <NavLink 
                        href={item.href} 
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-500 border backdrop-blur-md ${
                          isActive 
                            ? `bg-gradient-to-r ${item.color} text-white border-current/30 shadow-xl shadow-current/20` 
                            : 'text-gray-300 hover:text-white hover:bg-white/10 border-white/10 hover:border-white/30 hover:shadow-lg'
                        }`}
                      >
                        <motion.div
                          className={`p-3 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/10'}`}
                          whileHover={{ 
                            rotate: 360, 
                            scale: 1.1,
                            boxShadow: "0 0 20px currentColor"
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon size={24} />
                        </motion.div>
                        
                        <div className="flex-1">
                          <span className="font-semibold text-lg">{item.name}</span>
                        </div>
                        
                        {isActive && (
                          <motion.div
                            className="flex items-center gap-2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <motion.div
                              className="w-3 h-3 bg-white rounded-full"
                              animate={{ 
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.7, 1]
                              }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          </motion.div>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </div>

              {/* Enhanced Mobile Social Links */}
              <motion.div 
                className="flex justify-center gap-4 py-6 border-y border-white/10"
                variants={mobileItemVariants}
              >
                {[
                  { href: "https://www.instagram.com/nittish_baboria", icon: "https://skillicons.dev/icons?i=instagram", gradient: "from-pink-500 to-orange-500" },
                  { href: "https://www.linkedin.com/in/nittish-baboria/", icon: "https://skillicons.dev/icons?i=linkedin", gradient: "from-blue-600 to-blue-400" },
                  { href: "https://github.com/nittish03", icon: "https://skillicons.dev/icons?i=github", gradient: "from-gray-700 to-gray-500" }
                ].map((social, index) => (
                  <motion.button
                    key={social.href}
                    onClick={() => window.open(social.href, "_blank")}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${social.gradient} shadow-lg hover:shadow-xl transition-all duration-300`}
                    whileHover={{ 
                      scale: 1.15, 
                      y: -4,
                      rotate: 10,
                      boxShadow: "0 15px 30px rgba(0,0,0,0.3)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    <img src={social.icon} className="w-7 h-7" alt="Social" />
                  </motion.button>
                ))}
              </motion.div>

              {/* Enhanced Mobile Auth */}
              <motion.div
                variants={mobileItemVariants}
                className="space-y-4"
              >
                {session ? (
                  <>
                    <div className="text-center p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-500/30 backdrop-blur-md">
                      <span className="text-white text-xl font-semibold flex items-center justify-center gap-2">
                        <FiUser />
                        Welcome, {session.user?.name?.split(" ")[0]} 
                        <motion.span
                          animate={{ rotate: [0, 20, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                          ✨
                        </motion.span>
                      </span>
                    </div>
                    
                    <motion.button
                      className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-2xl font-semibold shadow-2xl hover:shadow-red-500/50 transition-all duration-300 text-lg"
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiLogOut size={24} />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <NavLink href="/login" onClick={() => setMenuOpen(false)}>
                    <motion.button
                      className="w-full relative px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 transform-gpu overflow-hidden group text-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                        animate={{
                          x: ["-150%", "150%"],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: 4,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <FiStar className="group-hover:rotate-12 transition-transform duration-300" />
                        Get Started
                        <motion.span
                          animate={{ 
                            x: [0, 4, 0],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                        >
                          ✨
                        </motion.span>
                      </span>
                      
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </motion.button>
                  </NavLink>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
