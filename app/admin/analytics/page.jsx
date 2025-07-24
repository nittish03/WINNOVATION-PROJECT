'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { BarChart3, Users, BookOpen, Award, TrendingUp } from "lucide-react"

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadAnalytics()
  }, [session, router])

  const loadAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto p-6 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Platform insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={analytics.totalUsers || 0}
          icon={<Users className="h-8 w-8" />}
          color="blue"
          change="+12%"
        />
        <MetricCard
          title="Active Courses"
          value={analytics.activeCourses || 0}
          icon={<BookOpen className="h-8 w-8" />}
          color="green"
          change="+8%"
        />
        <MetricCard
          title="Completions"
          value={analytics.completions || 0}
          icon={<Award className="h-8 w-8" />}
          color="purple"
          change="+15%"
        />
        <MetricCard
          title="Engagement Rate"
          value={`${analytics.engagementRate || 0}%`}
          icon={<TrendingUp className="h-8 w-8" />}
          color="orange"
          change="+5%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <BarChart3 className="h-16 w-16 text-gray-400" />
            <div className="ml-4 text-gray-500">
              <p>Chart visualization would go here</p>
              <p className="text-sm">Integration with Chart.js or similar</p>
            </div>
          </div>
        </div>

        {/* Course Popularity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Courses</h3>
          <div className="space-y-4">
            {analytics.popularCourses?.slice(0, 5).map((course, index) => (
              <div key={course.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.enrollments} enrollments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{course.completionRate}%</p>
                  <p className="text-xs text-gray-500">completion rate</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <p>No course data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skills Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Skills Distribution</h3>
          <div className="space-y-3">
            {analytics.skillsBreakdown?.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between">
                <span className="text-sm">{skill.name}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${skill.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{skill.count}</span>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                <p>No skill data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Fast
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Server Load</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Moderate
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Good
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color, change }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600"
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-green-600">{change} from last month</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colors[color]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
