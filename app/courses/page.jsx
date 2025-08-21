'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { BookOpen, Users, Plus, Award, Calendar, User } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function CoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState([])
  const [skills, setSkills] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [enrolling, setEnrolling] = useState({})
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [coursesRes, skillsRes] = await Promise.all([
        axios.get('/api/courses'),
        axios.get('/api/skills')
      ])
      setCourses(coursesRes.data)
      setSkills(skillsRes.data)

      // If student, load their enrollments
      if (session?.user?.role === 'student') {
        const enrollmentsRes = await axios.get('/api/enrollments')
        setEnrollments(enrollmentsRes.data)
      }
    } catch (error) {
      toast.error('Failed to load data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await axios.post('/api/courses', formData)
      toast.success('Course created successfully!')
      setShowCreateForm(false)
      setFormData({ title: '', description: '', skillId: '' })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnroll = async (courseId) => {
    setEnrolling(prev => ({ ...prev, [courseId]: true }))
    try {
      await axios.post('/api/enrollments', { courseId })
      toast.success('Successfully enrolled!')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll')
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }))
    }
  }

  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.courseId === courseId)
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600">
              {session?.user?.role === 'admin' 
                ? 'Manage and create courses for students'
                : 'Explore and enroll in available courses'
              }
            </p>
          </div>
          
          {(session?.user?.role === 'admin' || session?.user?.role === 'instructor') && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </button>
          )}
        </div>

        {/* Create Course Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Course</h2>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    placeholder="Enter course title"
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
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    placeholder="Course description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Skill
                  </label>
                  <select
                    value={formData.skillId}
                    onChange={(e) => setFormData(prev => ({ ...prev, skillId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value="">Select a skill (optional)</option>
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Course'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {session?.user?.role === 'admin' 
                ? 'Create your first course to get started.'
                : 'Courses will appear here when they become available.'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {course.title}
                        </h3>
                        {course.skill && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Award className="h-3 w-3 mr-1" />
                            {course.skill.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description || 'No description available.'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{course.createdBy?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course._count?.enrollments || 0} enrolled</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                    
                    {session?.user?.role === 'student' && (
                      <>
                        {isEnrolled(course.id) ? (
                          <div className="bg-green-100 text-green-800 py-2 px-3 rounded-md text-sm font-medium">
                            Enrolled ✓
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrolling[course.id]}
                            className="bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {enrolling[course.id] ? 'Enrolling...' : 'Enroll'}
                          </button>
                        )}
                      </>
                    )}
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
                  {new Set(courses.map(course => course.skill?.name).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-600">Skill Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {session?.user?.role === 'student' ? enrollments.length : courses.filter(c => c.publishedAt).length}
                </div>
                <div className="text-sm text-gray-600">
                  {session?.user?.role === 'student' ? 'My Enrollments' : 'Published'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
