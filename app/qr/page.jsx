"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

const Qrcode = () => {
  const [value, setValue] = useState("");

  return (
    <div 
      className="w-full min-h-screen flex flex-col justify-center text-gray-900 items-center relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: `linear-gradient(to bottom right, rgba(var(--theme-primary-rgb), 0.2), rgba(var(--theme-secondary-rgb), 0.2))`
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: `linear-gradient(to bottom right, rgba(var(--theme-secondary-rgb), 0.2), rgba(var(--theme-primary-rgb), 0.2))`
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 7.5
          }}
        />

        {/* Floating QR elements */}
        {['⬛', '⬜', '📱', '🔲', '📊', '✨'].map((char, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl text-gray-300"
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
          >
            {char}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-2xl w-80 flex flex-col items-center border border-gray-200 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20,
          duration: 0.8
        }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: `0 25px 50px rgba(168, 85, 247, 0.3)`
          }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(to right, rgba(var(--theme-primary-rgb), 0.1), rgba(var(--theme-secondary-rgb), 0.1), rgba(var(--theme-accent-rgb), 0.1))`
          }}
          animate={{
            background: [
              "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
              "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(99, 102, 241, 0.1))",
              "linear-gradient(225deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <motion.h2 
          className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-3 relative z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-2xl"
          >
            📱
          </motion.span>
          QR Code Generator
        </motion.h2>

        <motion.input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300 hover:border-gray-400 relative z-10"
          placeholder="Enter text or URL..."
          onChange={(e) => setValue(e.target.value)}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileFocus={{ scale: 1.02 }}
        />

        <motion.div 
          className="bg-white p-4 rounded-xl shadow-xl border-2 border-gray-200 relative overflow-hidden z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.4,
            type: "spring", 
            stiffness: 200,
            damping: 15
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: `0 20px 40px rgba(168, 85, 247, 0.3)`
          }}
          key={value} // Re-animate when value changes
        >
          {/* QR Code glow effect */}
          <motion.div
            className="absolute inset-0 rounded-xl blur-xl"
            style={{
              background: `linear-gradient(to right, rgba(var(--theme-primary-rgb), 0.2), rgba(var(--theme-secondary-rgb), 0.2))`
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <QRCode 
            size={200} 
            value={value || "Type something..."} 
            style={{ position: 'relative', zIndex: 10 }}
          />
        </motion.div>

        {/* Decorative sparkle */}
        <motion.div
          className="absolute top-4 right-4 z-20"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-2xl">✨</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Qrcode;
