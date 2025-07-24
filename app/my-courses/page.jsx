'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { BookOpen, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function MyCoursesPage() {
  const { data: session } = useSession()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    loadEnrollments()
  }, [session])

  const loadEnrollments = async () => {
    try {
      const response = await axios.get('/api/enrollments')
      setEnrollments(response.data)
    } catch (error) {
      console.error('Error loading enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-gray-600">Track your learning progress</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No courses enrolled</h3>
          <p className="mt-1 text-gray-500">
            <Link href="/courses" className="text-blue-600">Browse courses</Link> to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(enrollment => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">{enrollment.course?.title}</h3>
                    <p className="text-sm text-gray-500">
                      by {enrollment.course?.createdBy?.name}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {enrollment.course?.description?.slice(0, 100)}...
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{enrollment.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    enrollment.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>

                <Link
                  href={`/courses/${enrollment.courseId}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {enrollments.length > 0 && (
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {enrollments.length}
              </div>
              <div className="text-sm text-gray-600">Total Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {enrollments.filter(e => e.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length) || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
