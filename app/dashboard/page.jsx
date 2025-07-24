'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { BookOpen, Award, Users, TrendingUp, User, Star } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const loadDashboardData = async () => {
      try {
        if (session.user.role === "admin") {
          const [usersRes, coursesRes, skillsRes] = await Promise.all([
            axios.get('/api/admin/users'),
            axios.get('/api/courses'),
            axios.get('/api/skills')
          ])
          setStats({
            totalUsers: usersRes.data.length,
            totalCourses: coursesRes.data.length,
            totalSkills: skillsRes.data.length,
            activeStudents: usersRes.data.filter(u => u.role === "student").length
          })
        } else {
          const [enrollmentsRes, skillsRes, certsRes] = await Promise.all([
            axios.get('/api/enrollments'),
            axios.get('/api/user-skills'),
            axios.get('/api/certificates')
          ])
          setStats({
            enrolledCourses: enrollmentsRes.data.length,
            skillsLearned: skillsRes.data.length,
            certificatesEarned: certsRes.data.length,
            totalProgress: Math.round(enrollmentsRes.data.reduce((acc, e) => acc + e.progress, 0) / enrollmentsRes.data.length) || 0
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [session])

  if (!session) return <div className="p-8 text-center">Please sign in to view your dashboard.</div>
  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {session.user.role === "admin" ? "Admin Dashboard" : "Your Dashboard"}
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {session.user.role === "admin" ? (
          <>
            <StatCard
              title="Total Users"
              value={stats.totalUsers || 0}
              icon={<Users className="h-8 w-8 text-blue-600" />}
              color="blue"
            />
            <StatCard
              title="Total Courses"
              value={stats.totalCourses || 0}
              icon={<BookOpen className="h-8 w-8 text-green-600" />}
              color="green"
            />
            <StatCard
              title="Total Skills"
              value={stats.totalSkills || 0}
              icon={<Award className="h-8 w-8 text-purple-600" />}
              color="purple"
            />
            <StatCard
              title="Active Students"
              value={stats.activeStudents || 0}
              icon={<TrendingUp className="h-8 w-8 text-orange-600" />}
              color="orange"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Enrolled Courses"
              value={stats.enrolledCourses || 0}
              icon={<BookOpen className="h-8 w-8 text-blue-600" />}
              color="blue"
            />
            <StatCard
              title="Skills Learned"
              value={stats.skillsLearned || 0}
              icon={<Award className="h-8 w-8 text-green-600" />}
              color="green"
            />
            <StatCard
              title="Certificates"
              value={stats.certificatesEarned || 0}
              icon={<Star className="h-8 w-8 text-yellow-600" />}
              color="yellow"
            />
            <StatCard
              title="Avg Progress"
              value={`${stats.totalProgress || 0}%`}
              icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
              color="purple"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {session.user.role === "admin" ? (
              <>
                <QuickActionLink href="/admin/users" title="Manage Users" />
                <QuickActionLink href="/admin/courses" title="Manage Courses" />
                <QuickActionLink href="/admin/skills" title="Manage Skills" />
                <QuickActionLink href="/admin/analytics" title="View Analytics" />
              </>
            ) : (
              <>
                <QuickActionLink href="/courses" title="Browse Courses" />
                <QuickActionLink href="/user-skills" title="Update Skills" />
                <QuickActionLink href="/assignments" title="View Assignments" />
                <QuickActionLink href="/certificates" title="My Certificates" />
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              No recent activity to display.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
    yellow: "bg-yellow-50 border-yellow-200"
  }

  return (
    <div className={`${colors[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickActionLink({ href, title }) {
  return (
    <Link
      href={href}
      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
    >
      <span className="text-sm font-medium text-gray-900">{title}</span>
    </Link>
  )
}
