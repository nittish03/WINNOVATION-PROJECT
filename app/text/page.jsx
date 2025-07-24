'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MdContentCopy, 
  MdDelete, 
  MdSave, 
  MdAccessTime,
  MdTextFields,
  MdAutoAwesome,
  MdNoteAdd,
  MdExpandMore,
  MdExpandLess
} from "react-icons/md";
import { 
  FiType, 
  FiCopy, 
  FiTrash2, 
  FiSave,
  FiFileText,
  FiClock,
  FiFeather,
  FiZap,
  FiEdit
} from "react-icons/fi";

// Enhanced Text Item Component with working buttons
const TextItem = ({ item, onCopy, onDelete, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // More accurate text length detection
  const getTextLines = (text) => {
    return text.split('\n').length;
  };

  const getTextLength = (text) => {
    return text.length;
  };

  // Show expand button if text is longer than 150 characters OR has more than 3 lines
  const shouldShowExpand = getTextLength(item.text) > 150 || getTextLines(item.text) > 3;

  // Handle expand/collapse
  const handleToggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Handle copy
  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy(item.text);
  };

  // Handle delete
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      layout
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="bg-white/5 hover:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 15px 35px rgba(34, 197, 94, 0.15)"
        }}
        layout
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg flex-shrink-0"
            whileHover={{ 
              rotate: 360, 
              scale: 1.1
            }}
            transition={{ duration: 0.6 }}
          >
            <FiFileText className="text-white" size={20} />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg">Text Note</h3>
            <p className="text-sm text-gray-400 flex items-center gap-1 truncate">
              <FiClock size={12} />
              {new Date(item.dateUploaded).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>
        
        {/* Text Content with improved overflow handling */}
        <motion.div 
          className="text-white bg-white/5 p-4 rounded-xl mb-4 relative overflow-hidden"
          layout
        >
          <motion.div
            className="whitespace-pre-wrap break-words transition-all duration-300"
            style={{
              display: !isExpanded && shouldShowExpand ? '-webkit-box' : 'block',
              WebkitLineClamp: !isExpanded && shouldShowExpand ? 3 : 'unset',
              WebkitBoxOrient: !isExpanded && shouldShowExpand ? 'vertical' : 'unset',
              overflow: !isExpanded && shouldShowExpand ? 'hidden' : 'visible',
              wordBreak: 'break-word',
              hyphens: 'auto',
              lineHeight: '1.6'
            }}
            layout
          >
            {item.text}
          </motion.div>
          
          {/* Gradient fade for long text - only show when collapsed */}
          {!isExpanded && shouldShowExpand && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.div>

        {/* Expand/Collapse button - Fixed with proper event handling */}
        {shouldShowExpand && (
          <div className="mb-4">
            <motion.button
              type="button"
              onClick={handleToggleExpand}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors duration-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {isExpanded ? (
                <>
                  <MdExpandLess size={16} />
                  Show less
                </>
              ) : (
                <>
                  <MdExpandMore size={16} />
                  Show more ({item.text.length} chars)
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Action Buttons - Fixed with proper event handling */}
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 hover:text-blue-300 rounded-xl transition-all duration-300 text-sm font-medium flex-1 border border-blue-500/20 hover:border-blue-500/40"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCopy size={14} />
            Copy
          </motion.button>

          <motion.button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 text-sm font-medium flex-1 border border-red-500/20 hover:border-red-500/40"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 5px 15px rgba(239, 68, 68, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <FiTrash2 size={14} />
            Delete
          </motion.button>
        </div>

        {/* Hover glow effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
        
        {/* Magic sparkle */}
        {isHovered && (
          <motion.div
            className="absolute top-4 right-4 pointer-events-none"
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
        )}
      </motion.div>
    </motion.div>
  );
};

const Text = () => {
  const [text, setText] = useState('');
  const [savedTexts, setSavedTexts] = useState([]);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(false);

  // Fetch saved texts
  const fetchTexts = async () => {
    try {
      const res = await axios.get('/api/text/fetchText');
      if (res.data.success) {
        setSavedTexts(res.data.data);
      } else {
        setMessage({ type: 'error', content: '❌ Could not fetch saved texts.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', content: '❌ Failed to fetch saved texts.' });
    }
  };

  // Handle copy to clipboard
  const HandleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('📋 Text copied to clipboard!', {
        style: {
          background: 'linear-gradient(135deg, #00C851 0%, #007E33 100%)',
          color: 'white',
          borderRadius: '12px',
        },
      });
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('❌ Failed to copy text.');
    }
  };

  useEffect(() => {
    fetchTexts();
  }, []);

  // Save new text
  const handleForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const res = await axios.post('/api/text/saveText', { text });
      if (res.data.success) {
        setMessage({ type: 'success', content: '✅ Text saved successfully!' });
        toast.success('Text saved successfully!', {
          style: {
            background: 'linear-gradient(135deg, #00C851 0%, #007E33 100%)',
            color: 'white',
            borderRadius: '12px',
          },
        });
        setText('');
        fetchTexts();
      } else {
        setMessage({ type: 'error', content: `❌ ${res.data.message}` });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', content: '❌ Failed to save text.' });
    } finally {
      setLoading(false);
    }
  };

  // Delete text
  const handleDelete = async (id) => {
    try {
      const res = await axios.post('/api/text/deleteText', { id });
      if (res.data.success) {
        setMessage({ type: 'success', content: '🗑️ Text deleted successfully!' });
        toast.success('Text deleted successfully!');
        fetchTexts();
      } else {
        setMessage({ type: 'error', content: `❌ ${res.data.message}` });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', content: '❌ Failed to delete text.' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white relative overflow-hidden">
      {/* Text-themed animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
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

        {/* Floating text elements */}
        {['A', 'T', '✍️', '📝', '📄', '💭', '✨', '🔤'].map((char, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl font-bold text-green-400/30"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`
            }}
            animate={{
              y: [-20, -80, -20],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.3, 1],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 4 + i * 0.5,
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
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Header */}
        <motion.header 
          variants={itemVariants}
          className="text-center mb-16"
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <FiFeather className="text-6xl text-green-400" />
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Text Saver
            </motion.h1>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Save, organize, and manage your text snippets with style ✍️
          </motion.p>
        </motion.header>

        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          {/* Enhanced Text Input Section */}
          <motion.section 
            variants={itemVariants}
            className="relative"
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
              whileHover={{ 
                boxShadow: "0 25px 50px rgba(34, 197, 94, 0.2)",
                scale: 1.01
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Text-themed background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(34, 197, 94, 0.05), rgba(16, 185, 129, 0.05))",
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(20, 184, 166, 0.05))",
                    "linear-gradient(225deg, rgba(20, 184, 166, 0.05), rgba(34, 197, 94, 0.05))"
                  ]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              <motion.h2 
                className="relative text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MdNoteAdd className="text-green-400" size={40} />
                </motion.div>
                Write Your Text
              </motion.h2>
              
              <form onSubmit={handleForm} className="relative space-y-6">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <motion.textarea
                    className="w-full p-6 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 resize-none min-h-[200px] text-lg hover:shadow-lg"
                    placeholder="Enter your text here... ✍️"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                  
                  {/* Character counter */}
                  <div className="absolute bottom-4 right-6 text-sm text-gray-400 bg-black/20 px-2 py-1 rounded">
                    {text.length} characters
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full relative px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform-gpu overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ 
                    scale: loading ? 1 : 1.02, 
                    y: loading ? 0 : -2,
                    boxShadow: "0 25px 50px rgba(34, 197, 94, 0.4)"
                  }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {/* Shimmer effect */}
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
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Saving Text...
                      </>
                    ) : (
                      <>
                        <FiSave size={20} />
                        Save Text
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          💾
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              {/* Status Message */}
              <AnimatePresence>
                {message.content && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mt-6 text-center font-medium text-lg ${
                      message.type === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {message.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.section>

          {/* Enhanced Saved Texts Section with Working Buttons */}
          <motion.section 
            variants={itemVariants}
            className="relative"
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl"
              whileHover={{ 
                boxShadow: "0 25px 50px rgba(34, 197, 94, 0.1)"
              }}
            >
              <motion.h2 
                className="text-2xl sm:text-3xl font-bold mb-8 flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FiFileText className="text-emerald-400" size={40} />
                </motion.div>
                Saved Texts ({savedTexts.length})
              </motion.h2>

              {savedTexts.length === 0 ? (
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
                    📝
                  </motion.div>
                  <p className="text-xl text-gray-400 mb-2">No saved texts yet</p>
                  <p className="text-gray-500">Write and save your first text above</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {savedTexts.map((item, index) => (
                      <TextItem
                        key={item.id}
                        item={item}
                        onCopy={HandleCopy}
                        onDelete={handleDelete}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
};

export default Text;
