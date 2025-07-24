'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import axios from "axios"
import { FileText, Calendar, Users, ArrowLeft, Download, Eye, Edit, Star, Save, X, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function AdminAssignmentDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Edit functionality states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100
  })

  // Grade functionality states
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [gradingSubmission, setGradingSubmission] = useState(null)
  const [gradeLoading, setGradeLoading] = useState(false)
  const [gradeFormData, setGradeFormData] = useState({
    points: '',
    feedback: ''
  })

  // Bulk Grade functionality states
  const [showBulkGradeModal, setShowBulkGradeModal] = useState(false);
  const [bulkGradeData, setBulkGradeData] = useState({});
  const [bulkGradeLoading, setBulkGradeLoading] = useState(false);

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    if (params.id) {
      loadAssignmentData()
    }
  }, [session, router, params.id])

  const loadAssignmentData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [assignmentRes, submissionsRes] = await Promise.all([
        axios.get(`/api/admin/assignments/${params.id}`),
        axios.get(`/api/admin/assignments/${params.id}/submissions`)
      ])
      
      setAssignment(assignmentRes.data)
      
      if (submissionsRes.data) {
        setSubmissions(submissionsRes.data.submissions || [])
        setStats(submissionsRes.data.stats)
      }
    } catch (error) {
      console.error('Error loading assignment:', error)
      setError(error.response?.data?.error || 'Failed to load assignment data')
    } finally {
      setLoading(false)
    }
  }

  // Edit Assignment Functions
  const handleEditClick = () => {
    setEditFormData({
      title: assignment.title,
      description: assignment.description || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
      maxPoints: assignment.maxPoints
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setEditLoading(true)
      
      const response = await axios.put(`/api/admin/assignments/${params.id}`, editFormData)
      
      setAssignment(response.data)
      setShowEditModal(false)
      toast.success('Assignment updated successfully!')
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast.error(error.response?.data?.error || 'Failed to update assignment')
    } finally {
      setEditLoading(false)
    }
  }

  // Grade Submission Functions
  const handleGradeClick = (submission) => {
    setGradingSubmission(submission)
    setGradeFormData({
      points: submission.grade?.points || '',
      feedback: submission.grade?.feedback || ''
    })
    setShowGradeModal(true)
  }

  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    try {
      setGradeLoading(true)
      
      await axios.post('/api/admin/grades', {
        assignmentId: assignment.id,
        userId: gradingSubmission.userId,
        points: parseInt(gradeFormData.points),
        feedback: gradeFormData.feedback
      })
      
      setShowGradeModal(false)
      setGradingSubmission(null)
      toast.success('Grade submitted successfully!')
      
      // Reload data to reflect changes
      loadAssignmentData()
    } catch (error) {
      console.error('Error submitting grade:', error)
      toast.error(error.response?.data?.error || 'Failed to submit grade')
    } finally {
      setGradeLoading(false)
    }
  }

  const handleBulkGradeClick = () => {
    const pendingSubmissions = submissions.filter(s => !s.grade);
    if (pendingSubmissions.length === 0) {
      toast.info('No pending submissions to grade');
      return;
    }
    const initialGrades = pendingSubmissions.reduce((acc, sub) => {
      acc[sub.id] = { points: '', feedback: '' };
      return acc;
    }, {});
    setBulkGradeData(initialGrades);
    setShowBulkGradeModal(true);
  };

  const handleBulkGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      setBulkGradeLoading(true);
      const gradesToSubmit = Object.entries(bulkGradeData)
        .filter(([_, grade]) => grade.points !== '')
        .map(([submissionId, grade]) => {
          const submission = submissions.find(s => s.id === submissionId);
          return {
            assignmentId: assignment.id,
            userId: submission.userId,
            points: parseInt(grade.points),
            feedback: grade.feedback,
          };
        });

      if (gradesToSubmit.length === 0) {
        toast.info('No grades were entered.');
        return;
      }

      await axios.post('/api/admin/grades/bulk', { grades: gradesToSubmit });

      setShowBulkGradeModal(false);
      setBulkGradeData({});
      toast.success('Grades submitted successfully!');
      loadAssignmentData();
    } catch (error) {
      console.error('Error submitting bulk grades:', error);
      toast.error(error.response?.data?.error || 'Failed to submit grades');
    } finally {
      setBulkGradeLoading(false);
    }
  };

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
            <Link href="/admin/assignments" className="text-blue-600 hover:text-blue-800">
              Back to assignments
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Assignment not found</h1>
            <Link href="/admin/assignments" className="text-blue-600 hover:text-blue-800">
              Back to assignments
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
        <div className="flex items-center mb-8">
          <Link
            href="/admin/assignments"
            className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-gray-600">{assignment.course?.title}</p>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900">{assignment.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <p className="mt-1 text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No due date'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Points</label>
                    <p className="mt-1 text-gray-900">{assignment.maxPoints}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created By</label>
                  <p className="mt-1 text-gray-900">{assignment.createdBy?.name}</p>
                </div>
              </div>
            </div>

            {/* Submissions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submissions</h2>
              {submissions.length === 0 ? (
                <p className="text-gray-500">No submissions yet</p>
              ) : (
                <div className="space-y-4">
                  {submissions.map(submission => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{submission.user?.name}</p>
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {submission.grade ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded">
                              {submission.grade.points}/{assignment.maxPoints}
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded">
                              Pending
                            </span>
                          )}
                          <button
                            onClick={() => handleGradeClick(submission)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title={submission.grade ? "Edit Grade" : "Grade Submission"}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          {submission.fileUrl && (
                            <Link
                              href={submission.fileUrl}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Download className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{submission.content}</p>
                      {submission.grade?.feedback && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">
                            <strong>Feedback:</strong> {submission.grade.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {stats && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Submissions</span>
                    <span className="font-medium">{stats.totalSubmissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Graded</span>
                    <span className="font-medium">{stats.gradedSubmissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-medium">{stats.pendingGrading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Score</span>
                    <span className="font-medium">
                      {stats.averageScore !== null ? `${stats.averageScore}/${assignment.maxPoints}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submission Rate</span>
                    <span className="font-medium">{stats.submissionRate}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEditClick}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Assignment
                </button>
                <button
                  onClick={handleBulkGradeClick}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Grade Submissions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Assignment Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit Assignment</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                  <input
                    type="number"
                    value={editFormData.maxPoints}
                    onChange={(e) => setEditFormData({...editFormData, maxPoints: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit" 
                    disabled={editLoading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {editLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Assignment
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grade Submission Modal */}
        {showGradeModal && gradingSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Grade Submission - {gradingSubmission.user?.name}
                </h2>
                <button
                  onClick={() => setShowGradeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Submission Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Submission Content:</h3>
                <p className="text-gray-700 text-sm">{gradingSubmission.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {new Date(gradingSubmission.submittedAt).toLocaleString()}
                </p>
                {gradingSubmission.fileUrl && (
                  <div className="mt-2">
                    <Link
                      href={gradingSubmission.fileUrl}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View Attachment
                    </Link>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points (Max: {assignment.maxPoints})
                  </label>
                  <input
                    type="number"
                    value={gradeFormData.points}
                    onChange={(e) => setGradeFormData({...gradeFormData, points: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    min="0"
                    max={assignment.maxPoints}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                  <textarea
                    value={gradeFormData.feedback}
                    onChange={(e) => setGradeFormData({...gradeFormData, feedback: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    placeholder="Provide feedback for the student..."
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit" 
                    disabled={gradeLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {gradeLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Submit Grade
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGradeModal(false)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Grade Submission Modal */}
        {showBulkGradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Bulk Grade Submissions
                </h2>
                <button
                  onClick={() => setShowBulkGradeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleBulkGradeSubmit}>
                <div className="space-y-4">
                  {submissions.filter(s => !s.grade).map(submission => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4 grid grid-cols-3 gap-4 items-start">
                      <div className="col-span-1">
                        <p className="font-medium text-gray-900">{submission.user?.name}</p>
                        <p className="text-sm text-gray-700 mt-2">{submission.content}</p>
                        {submission.fileUrl && (
                          <div className="mt-2">
                            <Link
                              href={submission.fileUrl}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View Attachment
                            </Link>
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Points (Max: {assignment.maxPoints})
                          </label>
                          <input
                            type="number"
                            value={bulkGradeData[submission.id]?.points || ''}
                            onChange={(e) => setBulkGradeData({ ...bulkGradeData, [submission.id]: { ...bulkGradeData[submission.id], points: e.target.value } })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                            min="0"
                            max={assignment.maxPoints}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                          <textarea
                            value={bulkGradeData[submission.id]?.feedback || ''}
                            onChange={(e) => setBulkGradeData({ ...bulkGradeData, [submission.id]: { ...bulkGradeData[submission.id], feedback: e.target.value } })}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                            placeholder="Provide feedback..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-4 mt-4">
                  <button
                    type="submit"
                    disabled={bulkGradeLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {bulkGradeLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Submit All Grades
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkGradeModal(false)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
