'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { toast } from "react-toastify"
import { Award, Download, Eye, Plus, Calendar } from "lucide-react"

export default function CertificatesPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState([])
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    courseId: '',
    title: '',
    url: ''
  })

  useEffect(() => {
    if (!session) return
    loadData()
  }, [session])

  const loadData = async () => {
    try {
      const certificatesRes = await axios.get('/api/certificates')
      setCertificates(certificatesRes.data)

      if (session.user.role === 'admin') {
        const [coursesRes, usersRes] = await Promise.all([
          axios.get('/api/courses'),
          axios.get('/api/admin/users')
        ])
        setCourses(coursesRes.data)
        setUsers(usersRes.data.filter(u => u.role === 'student'))
      }
    } catch (error) {
      toast.error('Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleIssueCertificate = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/certificates', formData)
      toast.success('Certificate issued successfully!')
      setShowIssueForm(false)
      setFormData({ userId: '', courseId: '', title: '', url: '' })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to issue certificate')
    }
  }

  if (!session) return <div className="text-center py-8">Please sign in to view certificates.</div>
  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {session.user.role === 'admin' ? 'Manage Certificates' : 'My Certificates'}
          </h1>
          <p className="text-gray-600 mt-2">
            {session.user.role === 'admin' 
              ? 'Issue and manage student certificates'
              : 'View and download your earned certificates'
            }
          </p>
        </div>
        
        {session.user.role === 'admin' && (
          <button
            onClick={() => setShowIssueForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Issue Certificate
          </button>
        )}
      </div>

      {/* Issue Certificate Form (Admin Only) */}
      {showIssueForm && session.user.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Issue New Certificate</h2>
            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select student</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
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
                  <option value="">Select course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Certificate of Completion - Course Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="https://certificates.example.com/..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Issue Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setShowIssueForm(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {session.user.role === 'admin' 
              ? 'Issue your first certificate to get started.'
              : 'Complete courses to earn certificates.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-yellow-200">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <Award className="h-8 w-8" />
                  <span className="text-sm font-medium">Certificate</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {certificate.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="font-medium">Student:</span>
                    <span className="ml-2">{certificate.user?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Course:</span>
                    <span className="ml-2">{certificate.course?.title}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {certificate.url ? (
                  <div className="flex gap-2">
                    <a
                      href={certificate.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </a>
                    <a
                      href={certificate.url}
                      download
                      className="bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition-colors"
                      title="Download Certificate"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-100 text-gray-600 text-center py-2 px-4 rounded-md text-sm">
                    Certificate file not available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {certificates.length > 0 && (
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Certificate Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {certificates.length}
              </div>
              <div className="text-sm text-gray-600">
                {session.user.role === 'admin' ? 'Total Issued' : 'Earned'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(certificates.map(c => c.courseId)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {certificates.filter(c => new Date(c.issuedAt) > new Date(Date.now() - 30*24*60*60*1000)).length}
              </div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {certificates.filter(c => c.url).length}
              </div>
              <div className="text-sm text-gray-600">With Files</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
