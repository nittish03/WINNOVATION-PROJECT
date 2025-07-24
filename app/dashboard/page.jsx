'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { BookOpen, Award, Users, TrendingUp, CheckCircle, FileText, BarChart3, Calendar } from "lucide-react"
import StatCard from "@/components/StatCard"
import QuickActionCard from "@/components/QuickActionCard"
import Link from "next/link"

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({})
  const [recentData, setRecentData] = useState({})
  const [loading, setLoading] = useState(true)

  console.log(session)
  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    loadDashboardData()
  }, [session, router])

  const loadDashboardData = async () => {
    try {
      if (session.user.role === 'admin') {
        const response = await axios.get('/api/admin/dashboard')
        setStats(response.data.stats)
        setRecentData(response.data.recent)
      } else {
        const response = await axios.get('/api/student/dashboard')
        setStats(response.data.stats)
        setRecentData(response.data.recent)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Admin Dashboard
  if (session?.user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Admin Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-purple-100">Manage your skill development platform</p>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<Users className="h-8 w-8" />} 
              color="blue" 
            />
            <StatCard 
              title="Active Courses" 
              value={stats.activeCourses} 
              icon={<BookOpen className="h-8 w-8" />} 
              color="green" 
            />
            <StatCard 
              title="Total Skills" 
              value={stats.totalSkills} 
              icon={<Award className="h-8 w-8" />} 
              color="purple" 
            />
            <StatCard 
              title="Enrollments" 
              value={stats.totalEnrollments} 
              icon={<TrendingUp className="h-8 w-8" />} 
              color="orange" 
            />
          </div>

          {/* Admin Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuickActionCard 
              title="Admin Controls"
              actions={[
                { href: "/admin/users", title: "Manage Users", icon: <Users className="h-4 w-4" /> },
                { href: "/admin/skills", title: "Manage Skills", icon: <Award className="h-4 w-4" /> },
                { href: "/admin/courses", title: "Manage Courses", icon: <BookOpen className="h-4 w-4" /> },
                { href: "/admin/analytics", title: "View Analytics", icon: <BarChart3 className="h-4 w-4" /> }
              ]}
            />
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {recentData.recentUsers?.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                )) || <p className="text-gray-500">No recent users</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Student Dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Student Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back, {session?.user?.name}!</h1>
          <p className="mt-2 text-blue-100">Continue your learning journey</p>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Enrolled Courses" 
            value={stats.enrolledCourses} 
            icon={<BookOpen className="h-8 w-8" />} 
            color="blue" 
          />
          <StatCard 
            title="Completed" 
            value={stats.completedCourses} 
            icon={<CheckCircle className="h-8 w-8" />} 
            color="green" 
          />
          <StatCard 
            title="Skills" 
            value={stats.totalSkills} 
            icon={<Award className="h-8 w-8" />} 
            color="purple" 
          />
          <StatCard 
            title="Certificates" 
            value={stats.certificates} 
            icon={<Award className="h-8 w-8" />} 
            color="yellow" 
          />
        </div>

        {/* Student Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickActionCard 
            title="Quick Actions"
            actions={[
              { href: "/courses", title: "Browse Courses" },
              { href: "/assignments", title: "View Assignments" },
              { href: "/skills", title: "Explore Skills" },
              { href: "/certificates", title: "My Certificates" }
            ]}
          />
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h3>
            <div className="space-y-3">
              {recentData.recentCourses?.map(enrollment => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{enrollment.course?.title}</p>
                    <p className="text-sm text-gray-600">{enrollment.progress || 0}% complete</p>
                  </div>
                  <Link 
                    href={`/courses/${enrollment.courseId}`} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Continue
                  </Link>
                </div>
              )) || <p className="text-gray-500">No enrolled courses</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
