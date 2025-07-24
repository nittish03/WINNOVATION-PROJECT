'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { BookOpen, Award, Users, TrendingUp, Calendar, CheckCircle, Plus, Settings } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({})
  const [recentData, setRecentData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    loadDashboardData()
  }, [session])

  const loadDashboardData = async () => {
    try {
      if (session.user.role === 'admin') {
        // Admin dashboard data
        const [usersRes, coursesRes, skillsRes, enrollmentsRes] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/courses'),
          axios.get('/api/skills'),
          axios.get('/api/admin/enrollments')
        ])

        setStats({
          totalUsers: usersRes.data.length,
          totalStudents: usersRes.data.filter(u => u.role === 'student').length,
          totalCourses: coursesRes.data.length,
          publishedCourses: coursesRes.data.filter(c => c.publishedAt).length,
          totalSkills: skillsRes.data.length,
          totalEnrollments: enrollmentsRes.data.length,
          completedEnrollments: enrollmentsRes.data.filter(e => e.status === 'completed').length
        })

        setRecentData({
          recentUsers: usersRes.data.slice(0, 5),
          recentEnrollments: enrollmentsRes.data.slice(0, 5)
        })
      } else {
        // Student dashboard data (existing code)
        const [enrollmentsRes, skillsRes, certsRes] = await Promise.all([
          axios.get('/api/enrollments'),
          axios.get('/api/user-skills'),
          axios.get('/api/certificates')
        ])

        setStats({
          enrolledCourses: enrollmentsRes.data.length,
          completedCourses: enrollmentsRes.data.filter(e => e.status === 'completed').length,
          skillsLearned: skillsRes.data.length,
          certificates: certsRes.data.length
        })

        setRecentData({
          recentCourses: enrollmentsRes.data.slice(0, 3)
        })
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  // Admin Dashboard
  if (session?.user?.role === 'admin') {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-16">
        {/* Admin Welcome Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-2">Manage your skill development platform</p>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} color="blue" />
          <StatCard title="Total Courses" value={stats.totalCourses} icon={<BookOpen />} color="green" />
          <StatCard title="Total Skills" value={stats.totalSkills} icon={<Award />} color="purple" />
          <StatCard title="Total Enrollments" value={stats.totalEnrollments} icon={<TrendingUp />} color="orange" />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Active Students" 
            value={stats.totalStudents} 
            icon={<Users />} 
            color="blue" 
            size="small" 
          />
          <StatCard 
            title="Published Courses" 
            value={stats.publishedCourses} 
            icon={<BookOpen />} 
            color="green" 
            size="small" 
          />
          <StatCard 
            title="Completed Courses" 
            value={stats.completedEnrollments} 
            icon={<CheckCircle />} 
            color="purple" 
            size="small" 
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickLink href="/admin/users" title="Manage Users" icon={<Users className="h-4 w-4" />} />
              <QuickLink href="/admin/courses" title="Manage Courses" icon={<BookOpen className="h-4 w-4" />} />
              <QuickLink href="/admin/skills" title="Manage Skills" icon={<Award className="h-4 w-4" />} />
              <QuickLink href="/admin/analytics" title="View Analytics" icon={<TrendingUp className="h-4 w-4" />} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <div className="space-y-3">
              {recentData.recentUsers?.map(user => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
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
    )
  }

  // Student Dashboard (existing code)
  return (
    <div className="max-w-6xl mx-auto p-6 mt-16">
      {/* Student Welcome Header */}
      <div className="bg-blue-600 text-white rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name}!</h1>
        <p className="mt-2">Continue your learning journey</p>
      </div>

      {/* Student Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Enrolled Courses" value={stats.enrolledCourses} icon={<BookOpen />} color="blue" />
        <StatCard title="Completed" value={stats.completedCourses} icon={<CheckCircle />} color="green" />
        <StatCard title="Skills Learned" value={stats.skillsLearned} icon={<Award />} color="purple" />
        <StatCard title="Certificates" value={stats.certificates} icon={<Award />} color="yellow" />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickLink href="/courses" title="Browse Courses" />
            <QuickLink href="/assignments" title="View Assignments" />
            <QuickLink href="/user-skills" title="Update Skills" />
            <QuickLink href="/certificates" title="My Certificates" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
          <div className="space-y-3">
            {recentData.recentCourses?.map(enrollment => (
              <div key={enrollment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{enrollment.course?.title}</p>
                  <p className="text-sm text-gray-600">{enrollment.progress || 0}% complete</p>
                </div>
                <Link href={`/courses/${enrollment.courseId}`} className="text-blue-600 text-sm">
                  Continue
                </Link>
              </div>
            )) || <p className="text-gray-500">No enrolled courses</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, size = "large" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600", 
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    orange: "bg-orange-50 text-orange-600"
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`${size === 'small' ? 'text-xl' : 'text-2xl'} font-bold`}>{value || 0}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickLink({ href, title, icon }) {
  return (
    <Link href={href} className="flex items-center p-3 rounded hover:bg-gray-50 border">
      {icon && <span className="mr-3">{icon}</span>}
      <span className="font-medium">{title}</span>
    </Link>
  )
}
