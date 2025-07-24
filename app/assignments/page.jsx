'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { FileText, Calendar, Clock, CheckCircle, Plus } from "lucide-react"
import Link from "next/link"

export default function AssignmentsPage() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, submitted, overdue

  useEffect(() => {
    if (!session) return
    loadAssignments()
  }, [session])

  const loadAssignments = async () => {
    try {
      const assignmentsRes = await axios.get('/api/assignments')
      setAssignments(assignmentsRes.data)

      if (session.user.role === 'student') {
        const submissionsRes = await axios.get('/api/assignments/submissions')
        setSubmissions(submissionsRes.data)
      }
    } catch (error) {
      console.error('Failed to load assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAssignmentStatus = (assignment) => {
    if (session.user.role === 'admin') return 'admin'
    
    const submission = submissions.find(s => s.assignmentId === assignment.id)
    const isOverdue = assignment.dueDate && new Date() > new Date(assignment.dueDate)
    
    if (submission) return 'submitted'
    if (isOverdue) return 'overdue'
    return 'pending'
  }

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true
    return getAssignmentStatus(assignment) === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="h-4 w-4" />
      case 'overdue': return <Clock className="h-4 w-4" />
      case 'pending': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (!session) return <div className="text-center py-8">Please sign in to view assignments.</div>
  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {session.user.role === 'admin' ? 'Manage Assignments' : 'My Assignments'}
          </h1>
          <p className="text-gray-600 mt-2">
            {session.user.role === 'admin' 
              ? 'Create and manage course assignments'
              : 'View and submit your course assignments'
            }
          </p>
        </div>
        
        {session.user.role === 'admin' && (
          <Link
            href="/admin/assignments/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      {session.user.role === 'student' && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Assignments' },
                { key: 'pending', label: 'Pending' },
                { key: 'submitted', label: 'Submitted' },
                { key: 'overdue', label: 'Overdue' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {session.user.role === 'admin' 
              ? 'Create your first assignment to get started.'
              : 'No assignments match the current filter.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredAssignments.map((assignment) => {
              const status = getAssignmentStatus(assignment)
              const submission = submissions.find(s => s.assignmentId === assignment.id)
              
              return (
                <li key={assignment.id}>
                  <Link
                    href={`/assignments/${assignment.id}`}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {assignment.title}
                            </h3>
                            {session.user.role === 'student' && (
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                {getStatusIcon(status)}
                                <span className="ml-1 capitalize">{status}</span>
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {assignment.description}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Course: {assignment.course?.title}
                            </span>
                            {assignment.dueDate && (
                              <span className="ml-4 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-lg font-semibold text-gray-900">
                          {assignment.maxPoints} pts
                        </div>
                        {submission && (
                          <div className="text-sm text-gray-500 mt-1">
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                        {session.user.role === 'admin' && (
                          <div className="text-sm text-gray-500 mt-1">
                            {assignment._count?.submissions || 0} submissions
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Statistics */}
      {assignments.length > 0 && session.user.role === 'student' && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {assignments.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {assignments.filter(a => getAssignmentStatus(a) === 'submitted').length}
              </div>
              <div className="text-sm text-gray-600">Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {assignments.filter(a => getAssignmentStatus(a) === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {assignments.filter(a => getAssignmentStatus(a) === 'overdue').length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
