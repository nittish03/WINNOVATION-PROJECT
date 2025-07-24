"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { FiMenu, FiX, FiHome, FiBookOpen, FiStar, FiUser, FiLogOut, FiAward, FiLayers } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("Logged out successfully!");
    router.push("/");
  };

  // Main navigation links
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome, show: true },
    { name: "Skills", href: "/skills", icon: FiStar, show: true },
    { name: "Courses", href: "/courses", icon: FiBookOpen, show: true },
    { name: "My Skills", href: "/user-skills", icon: FiLayers, show: session?.user?.role === "student" },
    { name: "Enrollments", href: "/enrollments", icon: FiUser, show: session?.user?.role === "student" },
    { name: "Certificates", href: "/certificates", icon: FiAward, show: true },
    { name: "Profile", href: "/profile", icon: FiUser, show: true },
  ];

  // Animate navbar and menu button
  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    open: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: "easeOut", delayChildren: 0.07 } },
  };

  const mobileItemVariants = {
    closed: { x: -30, opacity: 0, scale: 0.9 },
    open: { x: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  };

  // Role badge
  const RoleBadge = () =>
    session?.user?.role ? (
      <span className="ml-2 px-2 py-1 bg-blue-700 text-xs rounded text-white font-bold">
        {session.user.role.toUpperCase()}
      </span>
    ) : null;

  return (
    <motion.nav
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 inset-x-0 w-full z-50 transition-all duration-700 ${
        scrolled
          ? "bg-black/95 backdrop-blur-2xl shadow-2xl shadow-blue-500/20 border-b border-white/20"
          : "bg-black/70 backdrop-blur-xl"
      }`}
    >
      <div className="relative px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex items-center justify-between h-full mx-auto max-w-7xl">
          {/* Profile image */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
            {
              session?.user?.image && (
<div className="flex justify-center items-center">
  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-200">
    <Image
      src={`/api/image-proxy?url=${encodeURIComponent(session?.user?.image)}`}
      alt="Profile"
      width={48}
      height={48}
      className="w-full h-full object-cover object-center"
      priority
    />
  </div>
</div>

              )
            }

            </Link>
            <div className="hidden lg:flex flex-col">
              <span className="text-white font-semibold">
                {session?.user?.name || "Skill Portal"}
                <RoleBadge />
              </span>
              <span className="text-xs text-blue-200">{session?.user?.email}</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <motion.ul
            variants={itemVariants}
            className="hidden md:flex items-center gap-3 bg-white/5 backdrop-blur-2xl rounded-full px-8 py-4 border border-white/10 shadow-2xl"
          >
            {navItems.map(
              (item, i) =>
                item.show && (
                  <motion.li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-500 group ${
                        pathname === item.href
                          ? "text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md"
                          : "text-gray-200 hover:text-white hover:bg-blue-800/30"
                      }`}
                    >
                      <item.icon className="mr-1" />
                      {item.name}
                    </Link>
                  </motion.li>
                )
            )}
            {session && (
              <motion.li>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white transition-all"
                  onClick={handleLogout}
                >
                  <FiLogOut /> Logout
                </button>
              </motion.li>
            )}
          </motion.ul>

          {/* Mobile Menu Toggle */}
          <motion.button
            variants={itemVariants}
            className="md:hidden p-3 rounded-2xl bg-white/10 border border-white/20 text-white"
            onClick={() => setMenuOpen((x) => !x)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={menuOpen ? "close" : "menu"}
                initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className="text-2xl"
              >
                {menuOpen ? <FiX /> : <FiMenu />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden absolute top-20 left-0 w-full bg-black/98 backdrop-blur-2xl border-t border-white/20 shadow-2xl"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="px-6 py-8 space-y-6">
              {navItems
                .filter((item) => item.show)
                .map((item) => (
                  <motion.div key={item.href} variants={mobileItemVariants}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 text-lg rounded-2xl ${
                        pathname === item.href
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                          : "text-gray-200 hover:text-white hover:bg-blue-800/30"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <item.icon className="mr-1" />
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              {session ? (
                <motion.div variants={mobileItemVariants}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-red-500 text-white text-lg mt-4"
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                  >
                    <FiLogOut /> Logout
                  </button>
                </motion.div>
              ) : (
                <motion.div variants={mobileItemVariants}>
                  <Link href="/login" className="block w-full">
                    <span className="w-full flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-lg mt-4">
                      <FiUser /> Sign In
                    </span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
