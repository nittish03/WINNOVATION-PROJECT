'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { BookOpen, Award, Users, TrendingUp, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({})
  const [recentCourses, setRecentCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    loadDashboardData()
  }, [session])

  const loadDashboardData = async () => {
    try {
      const [enrollmentsRes, skillsRes, certsRes, coursesRes] = await Promise.all([
        axios.get('/api/enrollments'),
        axios.get('/api/user-skills'),
        axios.get('/api/certificates'),
        axios.get('/api/courses')
      ])

      setStats({
        enrolledCourses: enrollmentsRes.data.length,
        completedCourses: enrollmentsRes.data.filter(e => e.status === 'completed').length,
        skillsLearned: skillsRes.data.length,
        certificates: certsRes.data.length,
        avgProgress: Math.round(enrollmentsRes.data.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollmentsRes.data.length) || 0
      })

      setRecentCourses(enrollmentsRes.data.slice(0, 3))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16">
      {/* Welcome Header */}
      <div className="bg-blue-600 text-white rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name}!</h1>
        <p className="mt-2">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
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
            {recentCourses.map(enrollment => (
              <div key={enrollment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{enrollment.course?.title}</p>
                  <p className="text-sm text-gray-600">{enrollment.progress || 0}% complete</p>
                </div>
                <Link href={`/courses/${enrollment.courseId}`} className="text-blue-600 text-sm">
                  Continue
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600", 
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600"
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value || 0}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickLink({ href, title }) {
  return (
    <Link href={href} className="block p-3 rounded hover:bg-gray-50 border">
      <span className="font-medium">{title}</span>
    </Link>
  )
}
