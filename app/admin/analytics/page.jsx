'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { Users, BookOpen, Award, TrendingUp, Activity, Calendar } from "lucide-react"

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalSkills: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return
    loadAnalytics()
  }, [session])

  const loadAnalytics = async () => {
    try {
      const [usersRes, coursesRes, skillsRes, enrollmentsRes, certificatesRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/courses'),
        axios.get('/api/skills'),
        axios.get('/api/enrollments'),
        axios.get('/api/certificates')
      ])

      setAnalytics({
        totalUsers: usersRes.data.length,
        totalStudents: usersRes.data.filter(u => u.role === 'student').length,
        totalCourses: coursesRes.data.length,
        totalSkills: skillsRes.data.length,
        totalEnrollments: enrollmentsRes.data.length,
        totalCertificates: certificatesRes.data.length,
        recentActivity: [
          ...enrollmentsRes.data.slice(0, 5).map(e => ({
            type: 'enrollment',
            user: e.user?.name,
            course: e.course?.title,
            date: e.enrolledAt
          })),
          ...certificatesRes.data.slice(0, 5).map(c => ({
            type: 'certificate',
            user: c.user?.name,
            course: c.course?.title,
            date: c.issuedAt
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session || session.user.role !== 'admin') {
    return <div className="text-center py-8">Access denied. Admins only.</div>
  }

  if (loading) return <div className="text-center py-8">Loading analytics...</div>

  const statCards = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Students',
      value: analytics.totalStudents,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Courses',
      value: analytics.totalCourses,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Skills',
      value: analytics.totalSkills,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Enrollments',
      value: analytics.totalEnrollments,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Certificates',
      value: analytics.totalCertificates,
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {analytics.recentActivity.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No recent activity
            </div>
          ) : (
            analytics.recentActivity.map((activity, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                      activity.type === 'enrollment' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user} {activity.type === 'enrollment' ? 'enrolled in' : 'earned certificate for'} {activity.course}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.type === 'enrollment' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
