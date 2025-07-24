'use client'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { FileText, Calendar, Clock, User, Send, Download, Eye } from "lucide-react"

export default function AssignmentDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { assignmentId } = params
  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [grade, setGrade] = useState(null)
  const [submissions, setSubmissions] = useState([]) // For admin view
  const [content, setContent] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!assignmentId) return
    loadAssignmentData()
  }, [assignmentId])

  const loadAssignmentData = async () => {
    try {
      const assignmentRes = await axios.get(`/api/assignments/${assignmentId}`)
      setAssignment(assignmentRes.data)

      if (session?.user?.role === 'student') {
        // Load student's submission and grade
        try {
          const submissionRes = await axios.get(`/api/assignments/${assignmentId}/submission`)
          setSubmission(submissionRes.data)
        } catch (error) {
          // No submission yet
        }

        try {
          const gradeRes = await axios.get(`/api/assignments/${assignmentId}/grade`)
          setGrade(gradeRes.data)
        } catch (error) {
          // No grade yet
        }
      } else if (session?.user?.role === 'admin') {
        // Load all submissions for admin
        const submissionsRes = await axios.get(`/api/assignments/${assignmentId}/submissions`)
        setSubmissions(submissionsRes.data)
      }
    } catch (error) {
      toast.error('Failed to load assignment')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Please provide your submission content')
      return
    }

    setSubmitting(true)
    try {
      await axios.post(`/api/assignments/${assignmentId}/submit`, {
        content,
        fileUrl: fileUrl || null
      })
      toast.success('Assignment submitted successfully!')
      loadAssignmentData()
      setContent('')
      setFileUrl('')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGrade = async (submissionId, points, feedback) => {
    try {
      await axios.post(`/api/assignments/${assignmentId}/grade`, {
        submissionId,
        points,
        feedback
      })
      toast.success('Grade saved!')
      loadAssignmentData()
    } catch (error) {
      toast.error('Failed to save grade')
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (!assignment) return <div className="text-center py-8">Assignment not found</div>

  const isOverdue = assignment.dueDate && new Date() > new Date(assignment.dueDate)
  const canSubmit = session?.user?.role === 'student' && (!isOverdue || !assignment.dueDate)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Assignment Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
            <p className="text-gray-600 mb-4">{assignment.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Course: {assignment.course?.title}
              </span>
              {assignment.dueDate && (
                <span className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                  <Calendar className="h-4 w-4 mr-1" />
                  Due: {new Date(assignment.dueDate).toLocaleString()}
                  {isOverdue && <span className="ml-1 font-medium">(Overdue)</span>}
                </span>
              )}
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Max Points: {assignment.maxPoints}
              </span>
            </div>
          </div>
          
          {session?.user?.role === 'admin' && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {submissions.length}
              </div>
              <div className="text-sm text-gray-500">Submissions</div>
            </div>
          )}
        </div>

        {/* Status indicators */}
        {session?.user?.role === 'student' && (
          <div className="flex gap-4">
            {submission && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <span className="text-green-800 font-medium">✅ Submitted</span>
                <div className="text-sm text-green-600">
                  {new Date(submission.submittedAt).toLocaleString()}
                </div>
              </div>
            )}
            
            {grade && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-800 font-medium">
                  Grade: {grade.points}/{assignment.maxPoints}
                </span>
                {grade.feedback && (
                  <div className="text-sm text-blue-600 mt-1">{grade.feedback}</div>
                )}
              </div>
            )}
            
            {isOverdue && !submission && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="text-red-800 font-medium">⚠️ Overdue</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Submission Form */}
      {session?.user?.role === 'student' && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {submission ? 'Update Submission' : 'Submit Assignment'}
          </h2>
          
          {submission && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Previous Submission:</h3>
              <div className="text-gray-700 whitespace-pre-wrap">{submission.content}</div>
              {submission.fileUrl && (
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4 mr-1" />
                  View Attached File
                </a>
              )}
            </div>
          )}

          {canSubmit ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your submission here..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File URL (Optional)
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/your-file.pdf"
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {submission ? 'Update Submission' : 'Submit Assignment'}
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isOverdue ? 'This assignment is overdue and no longer accepts submissions.' : 'Submission period has ended.'}
            </div>
          )}
        </div>
      )}

      {/* Admin View - All Submissions */}
      {session?.user?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Student Submissions</h2>
          
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No submissions yet
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((sub) => (
                <div key={sub.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{sub.user?.name}</h3>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    {sub.grade && (
                      <div className="text-right">
                        <div className="font-semibold">
                          {sub.grade.points}/{assignment.maxPoints}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap">
                      {sub.content}
                    </div>
                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View File
                      </a>
                    )}
                  </div>
                  
                  <GradingForm
                    submission={sub}
                    maxPoints={assignment.maxPoints}
                    onGrade={(points, feedback) => handleGrade(sub.id, points, feedback)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Grading form component for admin
function GradingForm({ submission, maxPoints, onGrade }) {
  const [points, setPoints] = useState(submission.grade?.points || '')
  const [feedback, setFeedback] = useState(submission.grade?.feedback || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onGrade(parseInt(points), feedback)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="border-t pt-3 mt-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points (0-{maxPoints})
          </label>
          <input
            type="number"
            min="0"
            max={maxPoints}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feedback
          </label>
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="Optional feedback for student"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Grade'}
      </button>
    </form>
  )
}
