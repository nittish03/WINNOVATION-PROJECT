'use client'
import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Menu, X, User, BookOpen, Award, Users, Settings, LogOut } from "lucide-react"

export default function NavBar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: User },
    { href: "/skills", label: "Skills", icon: Award },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/my-courses", label: "My Courses", icon: BookOpen },
    { href: "/user-skills", label: "My Skills", icon: Award },
    { href: "/assignments", label: "Assignments", icon: BookOpen },
    { href: "/certificates", label: "Certificates", icon: Award },
    { href: "/discussions", label: "Discussions", icon: Users },
  ]

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: User },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/skills", label: "Manage Skills", icon: Award },
    { href: "/admin/courses", label: "Manage Courses", icon: BookOpen },
    { href: "/admin/assignments", label: "Assignments", icon: BookOpen },
    { href: "/admin/analytics", label: "Analytics", icon: Settings },
  ]

  const links = session?.user?.role === "admin" ? adminLinks : studentLinks

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">SkillPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {session && (
              <>
                {links.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <img
                    src={session.user.image || "/avatar.png"}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium">
                    {session.user.name || session.user.email}
                    {session.user.role === "admin" && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {session && (
                <>
                  {links.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                          pathname === link.href
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                  <div className="border-t pt-4">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
