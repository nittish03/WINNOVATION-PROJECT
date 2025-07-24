'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { Users, BookOpen, Award, TrendingUp, Calendar, Target } from "lucide-react"

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalSkills: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
    totalSubmissions: 0,
    recentSignups: [],
    popularCourses: [],
    completionRates: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return
    loadAnalytics()
  }, [session])

  const loadAnalytics = async () => {
    try {
      const [usersRes, coursesRes, skillsRes, enrollmentsRes, certsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/courses'),
        axios.get('/api/skills'),
        axios.get('/api/enrollments'),
        axios.get('/api/certificates')
      ])

      const users = usersRes.data
      const courses = coursesRes.data
      const skills = skillsRes.data
      const enrollments = enrollmentsRes.data
      const certificates = certsRes.data

      // Calculate analytics
      const recentSignups = users
        .filter(user => new Date(user.createdAt) > new Date(Date.now() - 7*24*60*60*1000))
        .length

      const popularCourses = courses
        .map(course => ({
          ...course,
          enrollmentCount: course._count?.enrollments || 0
        }))
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 5)

      setAnalytics({
        totalUsers: users.length,
        totalCourses: courses.length,
        totalSkills: skills.length,
        totalEnrollments: enrollments.length,
        totalCertificates: certificates.length,
        recentSignups,
        popularCourses,
        studentCount: users.filter(u => u.role === 'student').length,
        adminCount: users.filter(u => u.role === 'admin').length,
        facultyCount: users.filter(u => u.role === 'faculty').length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={analytics.totalUsers}
          icon={<Users className="h-8 w-8 text-blue-600" />}
          color="blue"
          subtitle={`${analytics.recentSignups} new this week`}
        />
        <MetricCard
          title="Total Courses"
          value={analytics.totalCourses}
          icon={<BookOpen className="h-8 w-8 text-green-600" />}
          color="green"
          subtitle={`${analytics.totalEnrollments} total enrollments`}
        />
        <MetricCard
          title="Skills Catalog"
          value={analytics.totalSkills}
          icon={<Award className="h-8 w-8 text-purple-600" />}
          color="purple"
          subtitle="Available skills"
        />
        <MetricCard
          title="Certificates Issued"
          value={analytics.totalCertificates}
          icon={<Target className="h-8 w-8 text-orange-600" />}
          color="orange"
          subtitle={`${analytics.completedEnrollments} completions`}
        />
      </div>

      {/* User Distribution */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Distribution</h2>
          <div className="space-y-4">
            <UserTypeBar
              label="Students"
              count={analytics.studentCount}
              total={analytics.totalUsers}
              color="bg-blue-500"
            />
            <UserTypeBar
              label="Faculty"
              count={analytics.facultyCount}
              total={analytics.totalUsers}
              color="bg-purple-500"
            />
            <UserTypeBar
              label="Admins"
              count={analytics.adminCount}
              total={analytics.totalUsers}
              color="bg-red-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Completion Rate</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {analytics.totalEnrollments > 0 
                ? Math.round((analytics.completedEnrollments / analytics.totalEnrollments) * 100)
                : 0}%
            </div>
            <p className="text-gray-600">
              {analytics.completedEnrollments} of {analytics.totalEnrollments} enrollments completed
            </p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${analytics.totalEnrollments > 0 
                    ? (analytics.completedEnrollments / analytics.totalEnrollments) * 100
                    : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Courses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Popular Courses</h2>
        {analytics.popularCourses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No course data available</p>
        ) : (
          <div className="space-y-4">
            {analytics.popularCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    {course.skill && (
                      <span className="text-sm text-gray-500">{course.skill.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{course.enrollmentCount} enrolled</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color, subtitle }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200"
  }

  return (
    <div className={`${colors[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  )
}

function UserTypeBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{count} ({Math.round(percentage)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
