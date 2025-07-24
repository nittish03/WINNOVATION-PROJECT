'use client'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { MessageCircle, User, Calendar, Send, ArrowLeft } from "lucide-react"

export default function ThreadPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { threadId } = params
  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!threadId) return
    loadThreadData()
  }, [threadId])

  const loadThreadData = async () => {
    try {
      const [threadRes, repliesRes] = await Promise.all([
        axios.get(`/api/discussions/${threadId}`),
        axios.get(`/api/discussions/${threadId}/replies`)
      ])
      setThread(threadRes.data)
      setReplies(repliesRes.data)
    } catch (error) {
      toast.error('Failed to load discussion')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) {
      toast.error('Please enter a reply')
      return
    }

    setSubmitting(true)
    try {
      await axios.post(`/api/discussions/${threadId}/replies`, {
        content: replyContent
      })
      toast.success('Reply posted!')
      setReplyContent('')
      loadThreadData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (!thread) return <div className="text-center py-8">Discussion not found</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Discussions
      </button>

      {/* Thread Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{thread.title}</h1>
            {thread.course && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3">
                {thread.course.title}
              </span>
            )}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <User className="h-4 w-4 mr-1" />
              <span className="mr-4">{thread.author?.name}</span>
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(thread.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {replies.length}
            </div>
            <div className="text-sm text-gray-500">replies</div>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{thread.content}</p>
        </div>
      </div>

      {/* Reply Form */}
      {session && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Post a Reply</h2>
          <form onSubmit={handleReply}>
            <div className="mb-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !replyContent.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {submitting ? (
                'Posting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Reply
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Replies */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Replies ({replies.length})
        </h2>
        
        {replies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No replies yet. Be the first to respond!</p>
          </div>
        ) : (
          replies.map((reply, index) => (
            <div key={reply.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{reply.author?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  #{index + 1}
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
