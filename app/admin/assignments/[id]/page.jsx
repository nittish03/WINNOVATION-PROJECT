'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { FileText, Calendar, Users, ArrowLeft, Edit, Eye, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function AdminAssignmentDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    if (params.id) {
      loadAssignmentDetails()
    }
  }, [session, router, params.id])

  const loadAssignmentDetails = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        axios.get(`/api/admin/assignments/${params.id}`),
        axios.get(`/api/admin/assignments/${params.id}/submissions`)
      ])
      setAssignment(assignmentRes.data)
      setSubmissions(submissionsRes.data)
    } catch (error) {
      console.error('Error loading assignment details:', error)
      toast.error('Failed to load assignment details')
      router.push('/admin/assignments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800'
      case 'graded': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getSubmissionStatus = (submission, assignment) => {
    if (submission.grade) return 'graded'
    if (submission) return 'submitted'
    if (new Date(assignment.dueDate) < new Date()) return 'overdue'
    return 'pending'
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
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Assignment not found</h3>
            <p className="mt-1 text-gray-500">The assignment you're looking for doesn't exist.</p>
            <Link
              href="/admin/assignments"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Link>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/assignments"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Assignments
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-3xl font-bold text-gray-900">Assignment Details</h1>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/admin/assignments/${assignment.id}/edit`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Assignment Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <FileText className="h-10 w-10 text-blue-600 mt-1" />
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
                <p className="text-gray-600 mt-2">{assignment.description}</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Course:</span>
                    <p className="text-gray-900">{assignment.course?.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Due Date:</span>
                    <p className="text-gray-900">
                      {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
                      {new Date(assignment.dueDate).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Max Points:</span>
                    <p className="text-gray-900">{assignment.maxPoints}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.grade).length}
            </div>
            <div className="text-sm text-gray-600">Graded</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {submissions.filter(s => !s.grade).length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {submissions.length > 0 
                ? Math.round(submissions.filter(s => s.grade).reduce((acc, s) => acc + s.grade.points, 0) / submissions.filter(s => s.grade).length) || 0
                : 0
              }
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Submissions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => {
                  const status = getSubmissionStatus(submission, assignment)
                  return (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.user?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.submittedAt 
                          ? new Date(submission.submittedAt).toLocaleString()
                          : 'Not submitted'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.grade 
                          ? `${submission.grade.points}/${assignment.maxPoints}`
                          : 'Not graded'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/submissions/${submission.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {submission.fileUrl && (
                            <a
                              href={submission.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {submissions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No submissions yet</h3>
            <p className="mt-1 text-gray-500">Students haven't submitted their work for this assignment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
