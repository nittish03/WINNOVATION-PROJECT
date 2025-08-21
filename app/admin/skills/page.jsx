'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Award, Plus, Edit, Trash2, Search } from "lucide-react"
import { toast } from "react-toastify"

export default function AdminSkillsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadSkills()
  }, [session, router])

  const loadSkills = async () => {
    try {
      const response = await axios.get('/api/admin/skills')
      setSkills(response.data)
    } catch (error) {
      console.error('Error loading skills:', error)
      toast.error('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingSkill) {
        await axios.put(`/api/admin/skills/${editingSkill.id}`, formData)
        toast.success('Skill updated successfully!')
      } else {
        await axios.post('/api/admin/skills', formData)
        toast.success('Skill created successfully!')
      }
      setShowCreateForm(false)
      setEditingSkill(null)
      setFormData({ name: '', description: '', category: 'General' })
      loadSkills()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save skill')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      description: skill.description || '',
      category: skill.category
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (skillId) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      setDeletingId(skillId)
      try {
        await axios.delete(`/api/admin/skills/${skillId}`)
        toast.success('Skill deleted successfully!')
        loadSkills()
      } catch (error) {
        toast.error('Failed to delete skill')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const categories = [...new Set(skills.map(skill => skill.category))]
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter
    return matchesSearch && matchesCategory
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Skills</h1>
            <p className="text-gray-600">Create and organize learning skills</p>
          </div>
          <button
            onClick={() => {
              setEditingSkill(null)
              setFormData({ name: '', description: '', category: 'General' })
              setShowCreateForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSkills.map(skill => (
            <div key={skill.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                    <span className="text-sm text-gray-500">{skill.category}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    disabled={deletingId === skill.id}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    disabled={deletingId === skill.id}
                  >
                    {deletingId === skill.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {skill.description || 'No description available'}
              </p>
              
              <div className="flex justify-between text-sm text-gray-500">
                <span>{skill._count?.users || 0} learners</span>
                <span>{skill._count?.courses || 0} courses</span>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Skill Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Programming">Programming</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingSkill ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingSkill(null)
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
