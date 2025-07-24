"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";
import { MdDeleteForever, MdCloudUpload, MdSearch, MdLock, MdDescription, MdAccessTime } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiUpload, FiFile, FiShield, FiTrash2, FiZap, FiCloud, FiSearch, FiHardDrive } from "react-icons/fi";

export default function LandingPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [allFiles, setAllFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [accessPassword, setAccessPassword] = useState("");
  const [accessingFile, setAccessingFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const getAllFiles = async () => {
      try {
        const response = await axios.get("/api/googleDrive/files");
        setAllFiles(response.data.data);
        setFilteredFiles(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch documents.");
      }
    };
    getAllFiles();
  }, []);

  useEffect(() => {
    setFilteredFiles(
      allFiles.filter((file) =>
        file.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, allFiles]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsUploading(true);
    const loading = toast.loading("Uploading file...", {
      style: {
        background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
        color: 'white',
        borderRadius: '12px',
      },
    });
    
    if (!file) {
      toast.dismiss(loading);
      toast.error("Please select a file to upload.");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("password", password);

    try {
      const response = await axios.post("/api/googleDrive/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(loading);
      toast.success("File uploaded successfully!", {
        style: {
          background: 'linear-gradient(135deg, #34A853 0%, #00C851 100%)',
          color: 'white',
          borderRadius: '12px',
        },
      });

      const uploadedFile = response.data.data;
      uploadedFile.isProtected = !!password;

      setFile(null);
      setTitle("");
      setPassword("");
      setAllFiles([...allFiles, uploadedFile]);
    } catch (error) {
      toast.dismiss(loading);
      toast.error("Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const loading = toast.loading("Deleting File...");
    try {
      await axios.post("/api/googleDrive/deleteFile", { id });
      toast.dismiss(loading);
      toast.success("File deleted successfully.");
      setAllFiles(allFiles.filter((file) => file.id !== id));
    } catch (error) {
      toast.dismiss(loading);
      toast.error("Failed to delete file.");
    }
  };

  const openFile = async (file) => {
    if (file.isProtected) {
      setAccessingFile(file);
    } else {
      window.open(file.pdf, "_blank", "noreferrer");
    }
  };

  const verifyPasswordAndOpen = async () => {
    if (!accessPassword || !accessingFile) return;

    const loading = toast.loading("Verifying password...");
    try {
      const res = await axios.post("/api/googleDrive/accessFile", {
        id: accessingFile.id,
        password: accessPassword,
      });

      toast.dismiss(loading);
      toast.success("Access granted!");
      setAccessingFile(null);
      setAccessPassword("");
      window.open(res.data.fileUrl, "_blank", "noreferrer");
    } catch (err) {
      toast.dismiss(loading);
      toast.error("Incorrect password.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const fileItemVariants = {
    hidden: { x: -20, opacity: 0, scale: 0.95 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
      {/* Enhanced Google Drive themed background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-500/20 to-yellow-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.6, 0.3, 0.6],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: 10
          }}
        />

        {/* Drive-themed floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-blue-400/40 rounded-full"
            style={{
              left: `${15 + i * 12}%`,
              top: `${10 + (i % 3) * 30}%`
            }}
            animate={{
              y: [-20, -80, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Header - Google Drive Style */}
        <motion.header 
          variants={itemVariants}
          className="text-center mb-16"
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <FiHardDrive className="text-6xl text-blue-400" />
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-400 via-green-500 to-yellow-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Drive Manager
            </motion.h1>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-white max-w-2xl mx-auto"
          >
            Secure file storage and management with Google Drive integration 📁
          </motion.p>
        </motion.header>

        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          {/* Enhanced Upload Section - Google Drive Colors */}
          <motion.section 
            variants={itemVariants}
            className="relative"
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
              whileHover={{ 
                boxShadow: "0 25px 50px rgba(66, 133, 244, 0.2)",
                scale: 1.01
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Google Drive themed background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-yellow-500/5"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(66, 133, 244, 0.05), rgba(52, 168, 83, 0.05))",
                    "linear-gradient(135deg, rgba(52, 168, 83, 0.05), rgba(251, 188, 5, 0.05))",
                    "linear-gradient(225deg, rgba(251, 188, 5, 0.05), rgba(66, 133, 244, 0.05))"
                  ]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              <motion.h2 
                className="relative text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <MdCloudUpload className="text-blue-400" size={40} />
                </motion.div>
                Upload to Drive
              </motion.h2>
              
              <form onSubmit={handleSubmit} className="relative space-y-6">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <input
                    type="text"
                    placeholder="Enter file title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-lg"
                    required
                  />
                </motion.div>

                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Set password (optional)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-400 pr-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-lg"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                  </motion.button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-all duration-300 hover:shadow-lg"
                    required
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isUploading}
                  className="w-full relative px-8 py-4 bg-gradient-to-r from-blue-600 via-green-600 to-yellow-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform-gpu overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ 
                    scale: isUploading ? 1 : 1.02, 
                    y: isUploading ? 0 : -2,
                    boxShadow: "0 25px 50px rgba(66, 133, 244, 0.4)"
                  }}
                  whileTap={{ scale: isUploading ? 1 : 0.98 }}
                >
                  {/* Google Drive shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{
                      x: ["-150%", "150%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "linear"
                    }}
                  />

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isUploading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Uploading to Drive...
                      </>
                    ) : (
                      <>
                        <FiUpload size={20} />
                        Upload to Drive
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          📤
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>
              </form>
            </motion.div>
          </motion.section>

          {/* Enhanced Search Section */}
          <motion.div 
            variants={itemVariants}
            className="relative max-w-2xl mx-auto"
          >
            <motion.div
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-2xl pointer-events-none" />
              <input
                type="text"
                placeholder="Search your Drive files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-lg"
              />
            </motion.div>
          </motion.div>

          {/* Enhanced Files Section */}
          <motion.section 
            variants={itemVariants}
            className="relative"
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl"
              whileHover={{ 
                boxShadow: "0 25px 50px rgba(66, 133, 244, 0.1)"
              }}
            >
              <motion.h2 
                className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FiFile className="text-green-400" size={40} />
                </motion.div>
                Drive Files ({filteredFiles.length})
              </motion.h2>

              {filteredFiles.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  variants={containerVariants}
                >
                  <AnimatePresence>
                    {filteredFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        variants={fileItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        layout
                        className="group relative"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <motion.div
                          className="bg-white/5 hover:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-white/40 cursor-pointer transition-all duration-300"
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 15px 35px rgba(66, 133, 244, 0.15)"
                          }}
                          onClick={() => openFile(file)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <motion.div
                                className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-green-600 shadow-lg"
                                whileHover={{ 
                                  rotate: 360, 
                                  scale: 1.1
                                }}
                                transition={{ duration: 0.6 }}
                              >
                                <FiFile className="text-white" size={20} />
                              </motion.div>
                              
                              <div>
                                <h3 className="font-bold text-white flex items-center gap-2 text-lg group-hover:text-blue-300 transition-colors">
                                  {file.title}
                                  {file.isProtected && (
                                    <motion.span
                                      animate={{ 
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                      }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <MdLock className="text-yellow-400" size={18} />
                                    </motion.span>
                                  )}
                                </h3>
                                <p className="text-sm text-white capitalize flex items-center gap-1 mt-1">
                                  <MdDescription size={14} />
                                  {file.type?.split("/")[1] || "document"}
                                </p>
                              </div>
                            </div>

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(file.id);
                              }}
                              className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all duration-300"
                              whileHover={{ 
                                scale: 1.1, 
                                rotate: 10,
                                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)"
                              }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiTrash2 size={18} />
                            </motion.button>
                          </div>
                          
                          <p className="text-xs text-white flex items-center gap-1">
                            <MdAccessTime size={12} />
                            {new Date(file.dateUploaded).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>

                          {/* Enhanced hover effects */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          />
                          
                          {/* Drive-themed sparkle */}
                          <motion.div
                            className="absolute top-4 right-16 opacity-0 group-hover:opacity-100"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ 
                              scale: [0, 1, 0], 
                              rotate: [0, 180, 360],
                              y: [-5, -15, -5]
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <FiZap className="text-yellow-400" size={16} />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                      y: [0, -10, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    📁
                  </motion.div>
                  <p className="text-xl text-white mb-2">Your Drive is empty</p>
                  <p className="text-white">Upload your first file to get started</p>
                </motion.div>
              )}
            </motion.div>
          </motion.section>
        </div>

        {/* Enhanced Password Modal */}
        <AnimatePresence>
          {accessingFile && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setAccessPassword("");
                  setAccessingFile(null);
                }
              }}
            >
              <motion.div
                className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 relative overflow-hidden"
                initial={{ scale: 0.8, y: 50, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, y: 50, opacity: 0, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Google Drive themed background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(66, 133, 244, 0.1), rgba(52, 168, 83, 0.1))",
                      "linear-gradient(135deg, rgba(52, 168, 83, 0.1), rgba(251, 188, 5, 0.1))",
                      "linear-gradient(225deg, rgba(251, 188, 5, 0.1), rgba(66, 133, 244, 0.1))"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                <div className="relative text-center mb-6">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-2xl"
                  >
                    <FiShield className="text-white" size={40} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Protected Drive File</h2>
                  <p className="text-white text-lg">Enter password to access</p>
                  <p className="text-white font-medium mt-1">"{accessingFile.title}"</p>
                </div>

                <motion.input
                  type="password"
                  placeholder="Enter password"
                  value={accessPassword}
                  onChange={(e) => setAccessPassword(e.target.value)}
                  className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 mb-6 text-center text-lg"
                  whileFocus={{ scale: 1.02 }}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      verifyPasswordAndOpen();
                    }
                  }}
                />

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => {
                      setAccessPassword("");
                      setAccessingFile(null);
                    }}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-all duration-300 backdrop-blur-md border border-white/20"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={verifyPasswordAndOpen}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FiShield size={18} />
                      Access
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
