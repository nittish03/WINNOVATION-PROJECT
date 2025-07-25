'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { MessageSquare, ArrowLeft, User, Calendar, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"
import Image from "next/image"

export default function DiscussionThreadPage() {
  const params = useParams();
  const { id } = params;
  const { data: session } = useSession()
  const router = useRouter()
  const [thread, setThread] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [reload, setReload] = useState(false)
  const [userColors, setUserColors] = useState({});

  const generateColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      let value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  useEffect(() => {
    if (id) {
      loadThread()
      loadReplies()
    }

    const interval = setInterval(() => {
      if (id) {
        loadReplies(true); // Pass true to indicate a background refresh
      }
    }, 500); // Poll every 0.5 seconds

    return () => clearInterval(interval);
  }, [id, reload])

  const loadThread = async () => {
    try {
      const response = await axios.get(`/api/discussions/${id}`)
      setThread(response.data)
    } catch (error) {
      console.error("Error loading discussion thread:", error)
      toast.error("Failed to load discussion.")
      router.push("/discussions")
    }
  }

  const loadReplies = async (isBackground = false) => {
    try {
      const response = await axios.get(`/api/discussions/${id}/replies`)
      const newReplies = response.data;

      // Simple comparison by stringifying the arrays
      if (JSON.stringify(newReplies) !== JSON.stringify(replies)) {
        setReplies(newReplies);
        const newColors = {};
        newReplies.forEach(reply => {
          if (!newColors[reply.authorId]) {
            newColors[reply.authorId] = generateColor(reply.authorId);
          }
        });
        setUserColors(newColors);
      }
    } catch (error) {
      console.error("Error loading replies:", error)
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    try {
      await axios.post(`/api/discussions/${id}/replies`, {
        content: replyContent,
      })
      setReplyContent("")
      setReload(!reload)
      toast.success("Reply posted successfully!")
    } catch (error) {
      toast.error("Failed to post reply.")
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (confirm("Are you sure you want to delete this reply?")) {
      try {
        await axios.delete(`/api/discussions/${id}/replies/${replyId}`);
        toast.success("Reply deleted successfully!");
        setReload(!reload);
      } catch (error) {
        toast.error("Failed to delete reply.");
      }
    }
  };

  const handleDeleteAllReplies = async () => {
    if (confirm("Are you sure you want to delete ALL replies in this thread? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/discussions/${id}/replies`);
        toast.success("All replies have been deleted.");
        setReload(!reload);
      } catch (error) {
        toast.error("Failed to delete all replies.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Discussion not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/discussions" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discussions
        </Link>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{thread.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{thread.author?.name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-gray-700">{thread.content}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Replies ({replies.length})</h2>
            {(session?.user?.role === 'admin' || session?.user?.id === thread?.authorId) && replies.length > 0 && (
              <button
                onClick={handleDeleteAllReplies}
                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete All
              </button>
            )}
          </div>
          <div className="space-y-4 text-white">
            {replies.map((reply) => (
              <div key={reply.id} className={`p-4 rounded-lg text-gray-100`} style={{ backgroundColor: userColors[reply.authorId] || '#f0f0f0' }}>
                <div className="flex items-start space-x-4">
<div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
  {reply.author?.image ? (
    <Image
      src={`/api/image-proxy?url=${encodeURIComponent(reply.author.image)}`}
      alt={reply.author?.name || 'User avatar'}
      width={40}
      height={40}
      className="w-full h-full object-cover"
    />
  ) : (
    <User className="h-6 w-6 text-gray-400" />
  )}
</div>
                  <div className="flex-1 t">
                    <div className="flex items-center justify-between">
                    <p className="font-semibold">{reply.author?.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-white">
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                      {(session?.user?.role === 'admin' || session?.user?.id === reply.authorId) && (
                        <button
                          onClick={() => handleDeleteReply(reply.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-white mt-1">{reply.content}</p>
                </div>
              </div>
            </div>
            ))}
            {replies.length === 0 && <p className="text-gray-500">No replies yet.</p>}
          </div>

          {session && (
            <form onSubmit={handleReplySubmit} className="mt-6 flex items-center space-x-4">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Reply
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
