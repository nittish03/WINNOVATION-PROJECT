'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { MessageSquare, Plus, Calendar, User } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"

export default function DiscussionsPage() {
  const { data: session } = useSession()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })

  useEffect(() => {
    loadThreads()
  }, [])

  const loadThreads = async () => {
    try {
      const response = await axios.get('/api/discussions')
      setThreads(response.data)
    } catch (error) {
      console.error('Error loading discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/discussions', formData)
      toast.success('Discussion created successfully!')
      setShowForm(false)
      setFormData({ title: '', content: '' })
      loadThreads()
    } catch (error) {
      toast.error('Failed to create discussion')
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Discussions</h1>
          <p className="text-gray-600">Join conversations and ask questions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </button>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No discussions yet</h3>
          <p className="mt-1 text-gray-500">Start the first discussion</p>
        </div>
      ) : (
        <div className="space-y-6">
          {threads.map(thread => (
            <div key={thread.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <MessageSquare className="h-8 w-8 text-blue-600 mt-1" />
                  <div className="ml-4 flex-1">
                    <Link href={`/discussions/${thread.id}`}>
                      <h3 className="text-lg font-semibold hover:text-blue-600 cursor-pointer">
                        {thread.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mt-2 line-clamp-3">{thread.content}</p>
                    
                    <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{thread.author?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span>{thread._count?.replies || 0} replies</span>
                      {thread.course && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {thread.course.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Discussion Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Start New Discussion</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Discussion title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                  rows={4}
                  placeholder="What would you like to discuss?"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md">
                  Create Discussion
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
