'use client'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { BookOpen, Users, Calendar, Award, Plus, Edit } from "lucide-react"
import Link from "next/link"

export default function CourseDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { courseId } = params
  const [course, setCourse] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) return
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      const [courseRes, assignmentsRes, discussionsRes] = await Promise.all([
        axios.get(`/api/courses/${courseId}`),
        axios.get(`/api/courses/${courseId}/assignments`),
        axios.get(`/api/discussions?courseId=${courseId}`)
      ])
      
      setCourse(courseRes.data)
      setAssignments(assignmentsRes.data)
      setDiscussions(discussionsRes.data)

      // Check if student is enrolled
      if (session?.user?.role === 'student') {
        const enrollmentRes = await axios.get(`/api/enrollments?courseId=${courseId}`)
        setEnrollment(enrollmentRes.data.find(e => e.courseId === courseId))
      }
    } catch (error) {
      toast.error('Failed to load course data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    try {
      await axios.post('/api/enrollments', { courseId })
      toast.success('Successfully enrolled!')
      loadCourseData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll')
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (!course) return <div className="text-center py-8">Course not found</div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {course.skill && (
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {course.skill.name}
                </span>
              )}
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {course._count?.enrollments || 0} enrolled
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {session?.user?.role === 'admin' && (
            <Link
              href={`/admin/courses/${courseId}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Link>
          )}
          
          {session?.user?.role === 'student' && !enrollment && (
            <button
              onClick={handleEnroll}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Enroll Now
            </button>
          )}
        </div>

        {enrollment && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-800">✅ You are enrolled in this course</span>
              <span className="text-sm text-green-600">Progress: {enrollment.progress}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Assignments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Assignments</h2>
              {session?.user?.role === 'admin' && (
                <Link
                  href={`/admin/courses/${courseId}/assignments/new`}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Assignment
                </Link>
              )}
            </div>
            
            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map(assignment => (
                  <Link
                    key={assignment.id}
                    href={`/assignments/${assignment.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</div>
                        <div>{assignment.maxPoints} points</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No assignments available</p>
            )}
          </div>

          {/* Discussions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Discussions</h2>
              <Link
                href={`/discussions/new?courseId=${courseId}`}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
              >
                Start Discussion
              </Link>
            </div>
            
            {discussions.length > 0 ? (
              <div className="space-y-3">
                {discussions.slice(0, 5).map(discussion => (
                  <Link
                    key={discussion.id}
                    href={`/discussions/${discussion.id}`}
                    className="block p-3 border rounded hover:bg-gray-50"
                  >
                    <h3 className="font-medium">{discussion.title}</h3>
                    <p className="text-sm text-gray-600">By {discussion.author?.name}</p>
                  </Link>
                ))}
                {discussions.length > 5 && (
                  <Link href={`/discussions?courseId=${courseId}`} className="text-blue-600 text-sm">
                    View all discussions →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No discussions yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Course Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Instructor:</span>
                <p className="text-gray-600">{course.createdBy?.name}</p>
              </div>
              <div>
                <span className="font-medium">Category:</span>
                <p className="text-gray-600">{course.skill?.category || 'General'}</p>
              </div>
              <div>
                <span className="font-medium">Total Assignments:</span>
                <p className="text-gray-600">{assignments.length}</p>
              </div>
            </div>
          </div>

          {enrollment && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
