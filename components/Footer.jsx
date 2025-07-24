'use client'
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated, useTrail, config } from "@react-spring/web";
import { 
  Heart, 
  Instagram, 
  Linkedin, 
  Github, 
  Sparkles, 
  Rocket,
  Code2,
  Coffee,
  Zap,
  Star,
  ArrowUp
} from "lucide-react";

// Client-only wrapper to prevent SSR issues
const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return children;
};

// Fixed floating hearts component
const FloatingHearts = () => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const heartPositions = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: (i * 10) + Math.random() * 5, // More predictable positioning
      delay: i * 0.5,
      duration: 4 + (i % 3)
    }));
    setHearts(heartPositions);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hearts.length > 0 && hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-400/20"
          style={{ left: `${heart.x}%`, bottom: 0 }}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{ 
            y: -200, 
            opacity: [0, 1, 0], 
            scale: [0, 1, 0],
            rotate: [0, 360] 
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "easeOut"
          }}
        >
          <Heart size={16} />
        </motion.div>
      ))}
    </div>
  );
};

// Magnetic button component
const MagneticSocialButton = ({ href, icon: Icon, color, name }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * 0.3;
    const y = (e.clientY - centerY) * 0.3;
    setPosition({ x, y });
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className="flex flex-col items-center">
      <motion.button
        className={`relative group p-4 rounded-2xl transition-all duration-300 transform-gpu shadow-lg hover:shadow-2xl ${color}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={resetPosition}
        onClick={() => window.open(href, "_blank")}
        animate={{ x: position.x, y: position.y }}
        whileHover={{ scale: 1.1, rotateZ: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <Icon size={24} className="text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" />
        
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-white/20 blur-md"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          />
        )}
        
        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
      
      <motion.p 
        className="text-gray-400 text-sm mt-2"
        whileHover={{ color: "#ffffff" }}
      >
        {name}
      </motion.p>
    </div>
  );
};

// Glitch text effect
const GlitchText = ({ children, className = "" }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      {isGlitching && (
        <>
          <span 
            className="absolute top-0 left-0 text-red-400 animate-pulse"
            style={{ transform: "translate(-2px, -1px)" }}
          >
            {children}
          </span>
          <span 
            className="absolute top-0 left-0 text-blue-400 animate-pulse"
            style={{ transform: "translate(2px, 1px)" }}
          >
            {children}
          </span>
        </>
      )}
    </div>
  );
};

// Scroll to top button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
          onClick={scrollToTop}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="text-white" size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const Footer = () => {
  const [isInView, setIsInView] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const footerElement = document.getElementById('footer');
    if (footerElement) {
      observer.observe(footerElement);
    }

    return () => {
      if (footerElement) {
        observer.unobserve(footerElement);
      }
    };
  }, []);

  // Social links with enhanced styling
  const socialLinks = [
    { 
      href: "https://www.instagram.com/nittish_baboria", 
      icon: Instagram, 
      color: "bg-gradient-to-br from-pink-500 to-orange-500 hover:shadow-pink-500/50",
      name: "Instagram"
    },
    { 
      href: "https://www.linkedin.com/in/nittish-baboria/", 
      icon: Linkedin, 
      color: "bg-gradient-to-br from-blue-600 to-blue-400 hover:shadow-blue-500/50",
      name: "LinkedIn"
    },
    { 
      href: "https://github.com/nittish03", 
      icon: Github, 
      color: "bg-gradient-to-br from-gray-700 to-gray-500 hover:shadow-gray-500/50",
      name: "GitHub"
    },
  ];

  // Fun stats/features
  const stats = [
    { icon: Code2, label: "Lines of Code", value: "10K+", color: "text-blue-400" },
    { icon: Coffee, label: "Cups of Coffee", value: "∞", color: "text-orange-400" },
    { icon: Rocket, label: "Projects Launched", value: "25+", color: "text-green-400" },
    { icon: Star, label: "GitHub Stars", value: "100+", color: "text-yellow-400" }
  ];

  // Trail animation for stats
  const trail = useTrail(stats.length, {
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { 
      opacity: isInView ? 1 : 0, 
      transform: isInView ? 'translateY(0px)' : 'translateY(50px)' 
    },
    config: config.wobbly,
  });

  // Spring animation for main content
  const contentSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(100px)' },
    to: { 
      opacity: isInView ? 1 : 0, 
      transform: isInView ? 'translateY(0px)' : 'translateY(100px)' 
    },
    config: config.gentle,
    delay: 200,
  });

  return (
    <>
      <footer 
        id="footer"
        className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-16 overflow-hidden"
      >
        {/* Background Effects */}
        <ClientOnly>
          <FloatingHearts />
        </ClientOnly>
        
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"
          animate={{ 
            background: [
              "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))",
              "linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))",
              "linear-gradient(225deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
              "linear-gradient(315deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px] opacity-20" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Fun Stats Section */}
          <animated.div style={contentSpring}>
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : -50 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.h2 
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <GlitchText>Built with</GlitchText>
                <motion.span
                  className="inline-block mx-2"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="text-red-500 fill-red-500" size={40} />
                </motion.span>
                <GlitchText>& Code</GlitchText>
              </motion.h2>
              <motion.p 
                className="text-gray-400 text-lg max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: isInView ? 1 : 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Crafting digital experiences that push the boundaries of what's possible.
              </motion.p>
            </motion.div>

            {/* Animated Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {trail.map((style, index) => {
                const stat = stats[index];
                const StatIcon = stat.icon;
                return (
                  <animated.div
                    key={index}
                    style={style}
                    className="relative group"
                  >
                    <motion.div
                      className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300"
                      whileHover={{ 
                        scale: 1.05, 
                        rotateY: 5,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
                      }}
                    >
                      <motion.div
                        className={`${stat.color} mb-3`}
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <StatIcon size={32} />
                      </motion.div>
                      <motion.div 
                        className="text-2xl font-bold text-white mb-1"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </motion.div>
                  </animated.div>
                );
              })}
            </div>
          </animated.div>

          {/* Enhanced Social Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.h3 
              className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
              whileHover={{ scale: 1.05 }}
            >
              Let's Connect & Create Magic Together ✨
            </motion.h3>
            
            <div className="flex justify-center items-center gap-6 flex-wrap">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={social.href}
                  initial={{ opacity: 0, y: 30, rotate: -180 }}
                  animate={{ 
                    opacity: isInView ? 1 : 0, 
                    y: isInView ? 0 : 30,
                    rotate: isInView ? 0 : -180
                  }}
                  transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
                >
                  <MagneticSocialButton
                    href={social.href}
                    icon={social.icon}
                    color={social.color}
                    name={social.name}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Animated Divider */}
          <motion.div
            className="relative my-12"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isInView ? 1 : 0 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            <motion.div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="text-purple-400" size={20} />
            </motion.div>
          </motion.div>

          {/* Enhanced Footer Bottom */}
          <motion.div 
            className="flex flex-col md:flex-row md:justify-between items-center text-gray-400 space-y-4 md:space-y-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm">
                © {currentYear} 
              </span>
              <motion.span
                className="font-bold text-white"
                animate={{ 
                  color: ["#ffffff", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Nittish
              </motion.span>
              <span className="text-sm">
                All Rights Reserved.
              </span>
              <motion.div
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="text-yellow-400" size={16} />
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-2 text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span>Made with</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="text-red-500 fill-red-500" size={16} />
              </motion.div>
              <span>and lots of</span>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Coffee className="text-orange-400" size={16} />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Easter egg - hidden message */}
<motion.div
 className="text-center mt-8 opacity-0 hover:opacity-100 transition-opacity duration-1000"
 whileHover={{ scale: 1.1 }}
>
<p className="text-xs text-gray-600 font-mono">
 {/* Thanks for scrolling this far! You're awesome! 🚀 */}
 Thanks for scrolling this far! You're awesome! 🚀
</p>
</motion.div>


        </div>
      </footer>
      
      <ClientOnly>
        <ScrollToTop />
      </ClientOnly>
    </>
  );
};

export default Footer;
