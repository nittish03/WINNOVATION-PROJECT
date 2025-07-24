'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { toast } from "react-toastify"
import { BookOpen, Plus, Edit, Trash2, Users, Calendar } from "lucide-react"
import Link from "next/link"

export default function AdminCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillId: ''
  })

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return
    loadData()
  }, [session])

  const loadData = async () => {
    try {
      const [coursesRes, skillsRes] = await Promise.all([
        axios.get('/api/courses'),
        axios.get('/api/skills')
      ])
      setCourses(coursesRes.data)
      setSkills(skillsRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCourse) {
        await axios.patch(`/api/courses/${editingCourse.id}`, formData)
        toast.success('Course updated!')
      } else {
        await axios.post('/api/courses', formData)
        toast.success('Course created!')
      }
      setShowForm(false)
      setEditingCourse(null)
      setFormData({ title: '', description: '', skillId: '' })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save course')
    }
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      skillId: course.skillId || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all related assignments and enrollments.')) return
    
    try {
      await axios.delete(`/api/courses/${courseId}`)
      toast.success('Course deleted!')
      loadData()
    } catch (error) {
      toast.error('Failed to delete course')
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
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-2">Create and manage learning courses</p>
        </div>
        
        <button
          onClick={() => {
            setEditingCourse(null)
            setFormData({ title: '', description: '', skillId: '' })
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </button>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
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
                  Related Skill
                </label>
                <select
                  value={formData.skillId}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a skill (optional)</option>
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
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
                  placeholder="Course description and objectives"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
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

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first course to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    {course.skill && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {course.skill.name}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {course.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course._count?.enrollments || 0} enrolled
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Course
                  </Link>
                  <Link
                    href={`/admin/courses/${course.id}/assignments`}
                    className="bg-green-100 text-green-800 py-2 px-3 rounded-md text-sm hover:bg-green-200 transition-colors"
                    title="Manage Assignments"
                  >
                    Assignments
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {courses.length > 0 && (
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {courses.length}
              </div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {courses.reduce((acc, course) => acc + (course._count?.enrollments || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Enrollments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {courses.filter(course => course.skill).length}
              </div>
              <div className="text-sm text-gray-600">Skill-Based</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {courses.filter(course => new Date(course.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}
              </div>
              <div className="text-sm text-gray-600">Created This Month</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
