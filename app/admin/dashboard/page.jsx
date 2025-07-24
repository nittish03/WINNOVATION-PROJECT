'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar,
  FileText,
  MessageSquare,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  GraduationCap,
  Target
} from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentUsers: [],
    recentCourses: [],
    recentEnrollments: [],
    recentAssignments: [],
    skillsDistribution: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin')
      return
    }

    loadDashboardData()
  }, [session, status, router])

  const loadDashboardData = async () => {
    try {
      const [
        usersRes,
        coursesRes,
        skillsRes,
        enrollmentsRes,
        assignmentsRes,
        certificatesRes
      ] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/courses'),
        axios.get('/api/skills'),
        axios.get('/api/admin/enrollments'),
        axios.get('/api/admin/assignments'),
        axios.get('/api/admin/certificates')
      ])

      const users = usersRes.data
      const courses = coursesRes.data
      const skills = skillsRes.data
      const enrollments = enrollmentsRes.data
      const assignments = assignmentsRes.data
      const certificates = certificatesRes.data

      // Calculate stats
      const stats = {
        totalUsers: users.length,
        totalStudents: users.filter(u => u.role === 'student').length,
        totalInstructors: users.filter(u => u.role === 'instructor').length,
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.publishedAt).length,
        totalSkills: skills.length,
        totalEnrollments: enrollments.length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
        totalAssignments: assignments.length,
        totalCertificates: certificates.length,
        avgProgress: Math.round(
          enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / 
          (enrollments.length || 1)
        )
      }

      // Skills distribution
      const skillsDistribution = skills.map(skill => ({
        name: skill.name,
        category: skill.category,
        userCount: skill._count?.users || 0,
        courseCount: skill._count?.courses || 0
      }))

      setDashboardData({
        stats,
        recentUsers: users.slice(0, 5),
        recentCourses: courses.slice(0, 5),
        recentEnrollments: enrollments.slice(0, 10),
        recentAssignments: assignments.slice(0, 5),
        skillsDistribution: skillsDistribution.slice(0, 8)
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const { stats } = dashboardData

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {session?.user?.name}. Here's what's happening in your portal.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-8 w-8" />}
          color="blue"
          subtitle={`${stats.totalStudents} students, ${stats.totalInstructors} instructors`}
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="h-8 w-8" />}
          color="green"
          subtitle={`${stats.publishedCourses} published`}
        />
        <StatCard
          title="Total Enrollments"
          value={stats.totalEnrollments}
          icon={<UserCheck className="h-8 w-8" />}
          color="purple"
          subtitle={`${stats.completedEnrollments} completed`}
        />
        <StatCard
          title="Certificates Issued"
          value={stats.totalCertificates}
          icon={<Award className="h-8 w-8" />}
          color="yellow"
          subtitle="Achievement unlocked"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Skills"
          value={stats.totalSkills}
          icon={<Target className="h-6 w-6" />}
          color="indigo"
          size="small"
        />
        <StatCard
          title="Active Assignments"
          value={stats.totalAssignments}
          icon={<FileText className="h-6 w-6" />}
          color="pink"
          size="small"
        />
        <StatCard
          title="Average Progress"
          value={`${stats.avgProgress}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="teal"
          size="small"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            href="/admin/users"
            icon={<Users className="h-5 w-5" />}
            title="Manage Users"
            description="Add, edit, or remove users"
            color="blue"
          />
          <QuickActionButton
            href="/courses"
            icon={<BookOpen className="h-5 w-5" />}
            title="Manage Courses"
            description="Create and manage courses"
            color="green"
          />
          <QuickActionButton
            href="/admin/skills"
            icon={<Award className="h-5 w-5" />}
            title="Manage Skills"
            description="Add and organize skills"
            color="purple"
          />
          <QuickActionButton
            href="/admin/analytics"
            icon={<BarChart3 className="h-5 w-5" />}
            title="View Analytics"
            description="Detailed reports and insights"
            color="orange"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
              <Link
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Enrollments</h3>
              <Link
                href="/admin/enrollments"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.course?.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {enrollment.user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {enrollment.progress || 0}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Distribution */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Skills Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.skillsDistribution.map((skill) => (
              <div key={skill.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{skill.name}</h4>
                  <span className="text-xs text-gray-500">{skill.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{skill.userCount} users</span>
                  <span>{skill.courseCount} courses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, subtitle, size = "large" }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    yellow: "from-yellow-500 to-yellow-600",
    indigo: "from-indigo-500 to-indigo-600",
    pink: "from-pink-500 to-pink-600",
    teal: "from-teal-500 to-teal-600",
    orange: "from-orange-500 to-orange-600"
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colors[color]} text-white`}>
            {icon}
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`${size === 'small' ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({ href, icon, title, description, color }) {
  const colors = {
    blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
    green: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700",
    purple: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
    orange: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
  }

  return (
    <Link
      href={href}
      className={`${colors[color]} border rounded-lg p-4 transition-colors hover:shadow-md`}
    >
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="ml-2 font-medium">{title}</h3>
      </div>
      <p className="text-sm opacity-80">{description}</p>
    </Link>
  )
}
