'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  FileText,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Zap,
  Database,
  Server,
  HardDrive,
  UserCheck,
  GraduationCap,
  PenTool
} from "lucide-react"

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadAnalytics()
  }, [session, router])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/api/admin/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError(error.response?.data?.error || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeString) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered': return <UserCheck className="h-4 w-4" />
      case 'enrollment': return <BookOpen className="h-4 w-4" />
      case 'submission': return <FileText className="h-4 w-4" />
      // case 'certificate': return <Award className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Platform insights and performance metrics • Last updated: {formatTime(analytics.systemHealth?.lastUpdated || new Date())}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={analytics.totalUsers?.toLocaleString() || 0}
            icon={<Users className="h-8 w-8" />}
            color="blue"
            change={`${analytics.userGrowth > 0 ? '+' : ''}${analytics.userGrowth}%`}
            changePositive={analytics.userGrowth >= 0}
          />
          <MetricCard
            title="Active Courses"
            value={analytics.activeCourses || 0}
            icon={<BookOpen className="h-8 w-8" />}
            color="green"
            change={`${analytics.courseGrowth > 0 ? '+' : ''}${analytics.courseGrowth}%`}
            changePositive={analytics.courseGrowth >= 0}
          />
          <MetricCard
            title="Completions"
            value={analytics.completions?.toLocaleString() || 0}
            icon={<Award className="h-8 w-8" />}
            color="purple"
            change={`${analytics.completionRate}% rate`}
            changePositive={true}
          />
          <MetricCard
            title="Engagement Rate"
            value={`${analytics.engagementRate || 0}%`}
            icon={<TrendingUp className="h-8 w-8" />}
            color="orange"
            change={`${analytics.totalEnrollments} enrollments`}
            changePositive={true}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Assignments"
            value={analytics.totalAssignments?.toLocaleString() || 0}
            icon={<PenTool className="h-6 w-6" />}
            color="indigo"
            change={`${analytics.submissionRate}% submission rate`}
            changePositive={true}
            small={true}
          />
          <MetricCard
            title="Submissions"
            value={analytics.totalSubmissions?.toLocaleString() || 0}
            icon={<FileText className="h-6 w-6" />}
            color="cyan"
            change={`${analytics.totalGrades} graded`}
            changePositive={true}
            small={true}
          />
          {/* <MetricCard
            title="Certificates"
            value={analytics.totalCertificates?.toLocaleString() || 0}
            icon={<GraduationCap className="h-6 w-6" />}
            color="pink"
            change={`${analytics.completionRate}% completion`}
            changePositive={true}
            small={true}
          /> */}
          <MetricCard
            title="Total Enrollments"
            value={analytics.totalEnrollments?.toLocaleString() || 0}
            icon={<Target className="h-6 w-6" />}
            color="emerald"
            change={`${Math.round((analytics.totalEnrollments || 0) / (analytics.totalUsers || 1) * 100)}% avg per user`}
            changePositive={true}
            small={true}
          />
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 6 Months)</h3>
            <div className="space-y-3">
              {analytics.monthlyUserGrowth?.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{month.month}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max(5, (month.users / Math.max(...(analytics.monthlyUserGrowth?.map(m => m.users) || [1]))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {month.users}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No growth data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Courses</h3>
            <div className="space-y-4">
              {analytics.popularCourses?.slice(0, 6).map((course, index) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.skill} • {course.instructor}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-gray-900">{course.enrollments}</p>
                    <p className="text-xs text-gray-500">{course.completionRate}% completed</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No course data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Skills Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Distribution</h3>
            <div className="space-y-3">
              {analytics.skillsBreakdown?.slice(0, 8).map((skill) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{skill.name}</p>
                    <p className="text-xs text-gray-500">{skill.category}</p>
                  </div>
                  <div className="flex items-center ml-4">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.max(5, skill.percentage)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{skill.userCount}</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.recentActivity?.slice(0, 15).map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTime(activity.time)}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <HealthMetric
                label="Database"
                status={analytics.systemHealth?.database || 'unknown'}
                icon={<Database className="h-4 w-4" />}
              />
              <HealthMetric
                label="API Response"
                status={analytics.systemHealth?.apiResponse || 'unknown'}
                icon={<Zap className="h-4 w-4" />}
              />
              <HealthMetric
                label="Server Load"
                status={analytics.systemHealth?.serverLoad || 'unknown'}
                icon={<Server className="h-4 w-4" />}
              />
              <HealthMetric
                label="Storage"
                status={analytics.systemHealth?.storage || 'unknown'}
                icon={<HardDrive className="h-4 w-4" />}
              />
            </div>

            {/* User Role Distribution */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">User Roles</h4>
              <div className="space-y-2">
                {analytics.roleDistribution?.map((role) => (
                  <div key={role.role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{role.role}</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{role.count}</span>
                      <span className="text-xs text-gray-500">({role.percentage}%)</span>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No role data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Analytics */}
        {analytics.assignmentAnalytics && analytics.assignmentAnalytics.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grading Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.assignmentAnalytics.slice(0, 10).map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.course}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignment.submissions} / {assignment.enrolledStudents}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                assignment.submissionRate >= 80 ? 'bg-green-600' :
                                assignment.submissionRate >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${assignment.submissionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{assignment.submissionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                assignment.gradingProgress >= 80 ? 'bg-green-600' :
                                assignment.gradingProgress >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${assignment.gradingProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{assignment.gradingProgress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color, change, changePositive, small = false }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    indigo: "from-indigo-500 to-indigo-600",
    cyan: "from-cyan-500 to-cyan-600",
    pink: "from-pink-500 to-pink-600",
    emerald: "from-emerald-500 to-emerald-600"
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${small ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>{title}</p>
          <p className={`${small ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>{value}</p>
          <p className={`${small ? 'text-xs' : 'text-sm'} ${changePositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colors[color]} text-white flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function HealthMetric({ label, status, icon }) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    good: 'bg-green-100 text-green-800',
    fast: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    slow: 'bg-red-100 text-red-800',
    unhealthy: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-gray-600 mr-2">{icon}</div>
        <span className="text-sm text-gray-900">{label}</span>
      </div>
      <span className={`px-2 py-1 text-xs rounded capitalize ${statusColors[status] || statusColors.unknown}`}>
        {status}
      </span>
    </div>
  )
}
