'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { toast } from "react-toastify"
import { FileText, Plus, Edit, Eye, Calendar, Users } from "lucide-react"
import Link from "next/link"

export default function AdminAssignmentsPage() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxPoints: 100
  })

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return
    loadData()
  }, [session])

  const loadData = async () => {
    try {
      const [assignmentsRes, coursesRes] = await Promise.all([
        axios.get('/api/assignments'),
        axios.get('/api/courses')
      ])
      setAssignments(assignmentsRes.data)
      setCourses(coursesRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/assignments', formData)
      toast.success('Assignment created!')
      setShowForm(false)
      setFormData({ title: '', description: '', courseId: '', dueDate: '', maxPoints: 100 })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create assignment')
    }
  }

  if (!session || session.user.role !== 'admin') {
    return <div className="text-center py-8">Access denied. Admins only.</div>
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600 mt-2">Create and manage course assignments</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </button>
      </div>

      {/* Assignment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxPoints}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxPoints: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Assignment instructions and requirements"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Create Assignment
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first assignment to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-10 w-10 text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {assignment.title}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {assignment.description}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="flex items-center mr-4">
                            <FileText className="h-4 w-4 mr-1" />
                            Course: {assignment.course?.title}
                          </span>
                          {assignment.dueDate && (
                            <span className="flex items-center mr-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {assignment._count?.submissions || 0} submissions
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-semibold text-gray-900">
                        {assignment.maxPoints} pts
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Link
                          href={`/assignments/${assignment.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
