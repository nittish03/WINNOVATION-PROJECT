'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { 
  BookOpen, 
  User, 
  Calendar, 
  Award, 
  Users, 
  Clock, 
  FileText,
  Play,
  CheckCircle,
  Star,
  ArrowLeft,
  MessageSquare,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function CourseDetailPage({ params }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    loadCourseData()
  }, [session, params.id, router])

  const loadCourseData = async () => {
    try {
      const [courseRes, enrollmentRes, assignmentsRes, discussionsRes] = await Promise.all([
        axios.get(`/api/courses/${params.id}`),
        session?.user?.role === 'student' 
          ? axios.get(`/api/courses/${params.id}/enrollment`).catch(() => ({ data: null }))
          : Promise.resolve({ data: null }),
        axios.get(`/api/courses/${params.id}/assignments`).catch(() => ({ data: [] })),
        axios.get(`/api/courses/${params.id}/discussions`).catch(() => ({ data: [] }))
      ])

      setCourse(courseRes.data)
      setEnrollment(enrollmentRes.data)
      setAssignments(assignmentsRes.data)
      setDiscussions(discussionsRes.data)
    } catch (error) {
      console.error('Error loading course:', error)
      if (error.response?.status === 404) {
        router.push('/courses')
        toast.error('Course not found')
      } else {
        toast.error('Failed to load course')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!session || session.user.role !== 'student') {
      toast.error('Only students can enroll in courses')
      return
    }

    setEnrolling(true)
    try {
      await axios.post('/api/enrollments', { courseId: params.id })
      toast.success('Successfully enrolled!')
      loadCourseData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll')
    } finally {
      setEnrolling(false)
    }
  }

  const getAssignmentStatus = (assignment) => {
    if (assignment.submissions?.length > 0) return 'submitted'
    if (new Date(assignment.dueDate) < new Date()) return 'overdue'
    return 'pending'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Course not found</p>
          <Link href="/courses" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/courses"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>
        </motion.div>

        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-8 w-8 mr-3" />
                  <div>
                    <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                    {course.skill && (
                      <span className="inline-flex items-center mt-2 px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                        <Award className="h-4 w-4 mr-1" />
                        {course.skill.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-blue-100 text-lg mb-4">{course.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{course.createdBy?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course._count?.enrollments || 0} students enrolled</span>
                  </div>
                </div>
              </div>

              {/* Enrollment Section */}
              <div className="mt-6 lg:mt-0 lg:ml-8">
                {session?.user?.role === 'student' && (
                  <div className="text-center">
                    {enrollment ? (
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                          <span className="text-white font-medium">Enrolled</span>
                        </div>
                        <div className="text-sm text-blue-100 mb-3">
                          Progress: {enrollment.progress || 0}%
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-green-400 h-2 rounded-full transition-all"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>
                        <div className="mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === 'completed' ? 'bg-green-500 text-white' :
                            enrollment.status === 'enrolled' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {enrollment.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <motion.button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assignments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Assignments ({assignments.length})
                </h2>
              </div>

              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map(assignment => {
                    const status = getAssignmentStatus(assignment)
                    const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div
                        key={assignment.id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                {status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>
                                  {status === 'overdue' 
                                    ? `${Math.abs(daysLeft)} days overdue`
                                    : status === 'submitted'
                                    ? 'Submitted'
                                    : `${daysLeft} days left`
                                  }
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1" />
                                <span>{assignment.maxPoints} points</span>
                              </div>
                            </div>
                          </div>
                          {enrollment && (
                            <div className="ml-4 flex space-x-2">
                              <Link
                                href={`/assignments/${assignment.id}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                              >
                                View Details
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Discussions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Discussions ({discussions.length})
                </h2>
                {enrollment && (
                  <Link
                    href={`/discussions?course=${params.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </Link>
                )}
              </div>

              {discussions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No discussions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.slice(0, 3).map(discussion => (
                    <div
                      key={discussion.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">{discussion.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{discussion.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{discussion.author?.name}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{discussion._count?.replies || 0} replies</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-4">
                {course.skill && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Skill Category</h4>
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {course.skill.category}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Instructor</h4>
                  <p className="text-gray-900">{course.createdBy?.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Created</h4>
                  <p className="text-gray-900">{new Date(course.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Students</h4>
                  <p className="text-gray-900">{course._count?.enrollments || 0} enrolled</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Assignments</h4>
                  <p className="text-gray-900">{assignments.length} total</p>
                </div>
              </div>
            </motion.div>

            {/* Related Skills */}
            {course.skill && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Skill</h3>
                <Link
                  href="/skills"
                  className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{course.skill.name}</p>
                      <p className="text-sm text-gray-500">{course.skill.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Progress (for enrolled students) */}
            {enrollment && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Course Progress</span>
                      <span>{enrollment.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      enrollment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'enrolled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Enrolled:</span>
                    <span className="text-gray-900">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
