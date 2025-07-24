'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { FileText, Calendar, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AssignmentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    loadAssignments()
  }, [session, router])

  const loadAssignments = async () => {
    try {
      const response = await axios.get('/api/assignments')
      setAssignments(response.data)
    } catch (error) {
      console.error('Error loading assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatus = (assignment) => {
    if (assignment.submission) return 'submitted'
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

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Manage your course assignments</p>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-gray-500">Assignments will appear here when available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map(assignment => {
              const status = getStatus(assignment)
              const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={assignment.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <FileText className="h-8 w-8 text-blue-600 mt-1" />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <p className="text-gray-600 mt-1">{assignment.course?.title}</p>
                        <p className="text-gray-500 text-sm mt-2">{assignment.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
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
                      <span>Max Points: {assignment.maxPoints}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/assignments/${assignment.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                      {status === 'pending' && (
                        <Link
                          href={`/assignments/${assignment.id}/submit`}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          Submit
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Stats */}
        {assignments.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {assignments.filter(a => getStatus(a) === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {assignments.filter(a => getStatus(a) === 'submitted').length}
              </div>
              <div className="text-sm text-gray-600">Submitted</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {assignments.filter(a => getStatus(a) === 'overdue').length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
