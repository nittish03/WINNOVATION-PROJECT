'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { FileText, Calendar, Users, Eye, Edit, Trash2, Plus, Search, Filter, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function AdminAssignmentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxPoints: 100
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [session, router])

  const loadData = async () => {
    try {
      const [assignmentsRes, coursesRes] = await Promise.all([
        axios.get('/api/admin/assignments'),
        axios.get('/api/courses')
      ])
      setAssignments(assignmentsRes.data)
      setCourses(coursesRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingAssignment) {
        await axios.put(`/api/admin/assignments/${editingAssignment.id}`, formData)
        toast.success('Assignment updated successfully!')
      } else {
        await axios.post('/api/admin/assignments', formData)
        toast.success('Assignment created successfully!')
      }
      setShowCreateForm(false)
      setEditingAssignment(null)
      setFormData({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        maxPoints: 100
      })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      courseId: assignment.courseId,
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
      maxPoints: assignment.maxPoints
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (assignmentId) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      setDeletingId(assignmentId)
      try {
        await axios.delete(`/api/admin/assignments/${assignmentId}`)
        toast.success('Assignment deleted successfully!')
        loadData()
      } catch (error) {
        toast.error('Failed to delete assignment')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const getAssignmentStatus = (assignment) => {
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    
    if (dueDate < now) return 'overdue'
    const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 3) return 'due-soon'
    return 'active'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'due-soon': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = courseFilter === 'all' || assignment.courseId === courseFilter
    const assignmentStatus = getAssignmentStatus(assignment)
    const matchesStatus = statusFilter === 'all' || assignmentStatus === statusFilter
    
    return matchesSearch && matchesCourse && matchesStatus
  })

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Assignments</h1>
            <p className="text-gray-600">Monitor all course assignments and submissions</p>
          </div>
          <button
            onClick={() => {
              setEditingAssignment(null)
              setFormData({
                title: '',
                description: '',
                courseId: '',
                dueDate: '',
                maxPoints: 100
              })
              setShowCreateForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="due-soon">Due Soon</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment)
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                            <div className="text-sm text-gray-500">Max Points: {assignment.maxPoints}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.course?.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.createdBy?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{assignment._count?.submissions || 0}</span>
                          <span className="text-gray-500 mx-1">/</span>
                          <span className="text-gray-500">{assignment._count?.grades || 0} graded</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className={
                            status === 'overdue' ? 'text-red-600' : 'text-gray-900'
                          }>
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status === 'due-soon' ? 'Due Soon' : 
                           status === 'overdue' ? 'Overdue' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/assignments/${assignment.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Assignment"
                            disabled={deletingId === assignment.id}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Assignment"
                            disabled={deletingId === assignment.id}
                          >
                            {deletingId === assignment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
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
        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-gray-500">
              {assignments.length === 0 
                ? 'Create your first assignment to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
            <div className="text-sm text-gray-600">Total Assignments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {assignments.reduce((acc, a) => acc + (a._count?.submissions || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {assignments.reduce((acc, a) => acc + (a._count?.grades || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Graded</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {assignments.filter(a => getAssignmentStatus(a) === 'overdue').length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>

        {/* Create/Edit Assignment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    placeholder="Assignment title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    placeholder="Assignment description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                  <input
                    type="number"
                    value={formData.maxPoints}
                    onChange={(e) => setFormData({...formData, maxPoints: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingAssignment ? 'Update Assignment' : 'Create Assignment')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingAssignment(null)
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                    disabled={isSubmitting}
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
