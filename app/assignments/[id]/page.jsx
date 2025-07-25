'use client'
import { useState, useEffect } from "react"
import { use } from "react" // Add this import
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { 
  FileText, 
  Calendar, 
  Clock, 
  Star, 
  User,
  BookOpen,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye
} from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function AssignmentDetailPage({ params }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params)
  const assignmentId = resolvedParams.id

  const { data: session } = useSession()
  const router = useRouter()
  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [grade, setGrade] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionText, setSubmissionText] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    loadAssignmentData()
  }, [session, assignmentId, router])

  const loadAssignmentData = async () => {
    try {
      const [assignmentRes, submissionRes, gradeRes] = await Promise.all([
        axios.get(`/api/assignments/${assignmentId}`),
        session?.user?.role === 'student' 
          ? axios.get(`/api/assignments/${assignmentId}/submission`).catch(() => ({ data: null }))
          : Promise.resolve({ data: null }),
        session?.user?.role === 'student' 
          ? axios.get(`/api/assignments/${assignmentId}/grade`).catch(() => ({ data: null }))
          : Promise.resolve({ data: null })
      ])

      setAssignment(assignmentRes.data)
      setSubmission(submissionRes.data)
      setGrade(gradeRes.data)
      
      if (submissionRes.data) {
        setSubmissionText(submissionRes.data.content || '')
      }
    } catch (error) {
      console.error('Error loading assignment:', error)
      if (error.response?.status === 404) {
        router.push('/assignments')
        toast.error('Assignment not found')
      } else {
        toast.error('Failed to load assignment')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmission = async (e) => {
    e.preventDefault()
    
    if (!submissionText.trim()) {
      toast.error('Please enter your submission content')
      return
    }

    setSubmitting(true)
    try {
      await axios.post(`/api/assignments/${assignmentId}/submission`, {
        content: submissionText
      })
      toast.success('Assignment submitted successfully!')
      loadAssignmentData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const getAssignmentStatus = () => {
    if (submission) return 'submitted'
    if (new Date(assignment?.dueDate) < new Date()) return 'overdue'
    return 'pending'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="h-4 w-4" />
      case 'overdue': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Assignment not found</p>
          <Link href="/assignments" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            ← Back to Assignments
          </Link>
        </div>
      </div>
    )
  }

  const status = getAssignmentStatus()
  const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/assignments"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Link>
        </motion.div>

        {/* Assignment Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                <Link 
                  href={`/courses/${assignment.course?.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {assignment.course?.title}
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className={`font-medium ${
                  status === 'overdue' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className={`font-medium ${
                  status === 'overdue' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {status === 'overdue' 
                    ? `${Math.abs(daysLeft)} days overdue`
                    : status === 'submitted'
                    ? 'Submitted'
                    : `${daysLeft} days left`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Star className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Max Points</p>
                <p className="font-medium text-gray-900">{assignment.maxPoints}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Assignment Description</h3>
            <div className="prose max-w-none text-gray-700">
              <p>{assignment.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {session?.user?.role === 'student' && (
              <>
                {/* Submission Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-blue-600" />
                    Your Submission
                  </h2>

                  {submission ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Submitted Successfully</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Submitted on {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                        </div>
                      </div>
                      
                      {submission.fileUrl && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Attached File:</h4>
                          <a 
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            View Submission File
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmission} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Answer *
                        </label>
                        <textarea
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Enter your assignment submission here..."
                          rows={8}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Make sure to review your work before submitting
                        </p>
                        <button
                          type="submit"
                          disabled={submitting || status === 'overdue'}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {submitting ? 'Submitting...' : 'Submit Assignment'}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>

                {/* Grade Section */}
                {grade && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-500" />
                      Your Grade
                    </h2>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {grade.points}/{assignment.maxPoints}
                        </div>
                        <div className="text-lg text-blue-800">
                          {Math.round((grade.points / assignment.maxPoints) * 100)}%
                        </div>
                      </div>
                      
                      {grade.feedback && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Instructor Feedback:</h4>
                          <p className="text-gray-700">{grade.feedback}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 text-sm text-gray-600">
                        Graded on {new Date(grade.gradedAt).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Course</h4>
                  <Link 
                    href={`/courses/${assignment.course?.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {assignment.course?.title}
                  </Link>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Instructor</h4>
                  <p className="text-gray-900">{assignment.createdBy?.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Created</h4>
                  <p className="text-gray-900">{new Date(assignment.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                    <span className="ml-1 capitalize">{status}</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/courses/${assignment.course?.id}`}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                >
                  <BookOpen className="h-4 w-4 mr-3 text-gray-500 group-hover:text-gray-700" />
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    View Course
                  </span>
                </Link>
                <Link
                  href="/assignments"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                >
                  <FileText className="h-4 w-4 mr-3 text-gray-500 group-hover:text-gray-700" />
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    All Assignments
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
