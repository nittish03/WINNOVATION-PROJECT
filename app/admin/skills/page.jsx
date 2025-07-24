'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { toast } from "react-toastify"
import { Award, Plus, Edit, Trash2, Search } from "lucide-react"

export default function AdminSkillsPage() {
  const { data: session } = useSession()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General'
  })

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return
    loadSkills()
  }, [session])

  const loadSkills = async () => {
    try {
      const response = await axios.get('/api/skills')
      setSkills(response.data)
    } catch (error) {
      toast.error('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSkill) {
        await axios.patch(`/api/skills/${editingSkill.id}`, formData)
        toast.success('Skill updated!')
      } else {
        await axios.post('/api/skills', formData)
        toast.success('Skill created!')
      }
      setShowForm(false)
      setEditingSkill(null)
      setFormData({ name: '', description: '', category: 'General' })
      loadSkills()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save skill')
    }
  }

  const handleEdit = (skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      description: skill.description || '',
      category: skill.category || 'General'
    })
    setShowForm(true)
  }

  const handleDelete = async (skillId) => {
    if (!confirm('Are you sure you want to delete this skill?')) return
    
    try {
      await axios.delete(`/api/skills/${skillId}`)
      toast.success('Skill deleted!')
      loadSkills()
    } catch (error) {
      toast.error('Failed to delete skill')
    }
  }

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!session || session.user.role !== 'admin') {
    return <div className="text-center py-8">Access denied. Admins only.</div>
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
          <p className="text-gray-600 mt-2">Manage the skills catalog</p>
        </div>
        
        <button
          onClick={() => {
            setEditingSkill(null)
            setFormData({ name: '', description: '', category: 'General' })
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Skills Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="General">General</option>
                  <option value="Programming">Programming</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Design">Design</option>
                  <option value="Management">Management</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Brief description of the skill"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingSkill ? 'Update Skill' : 'Create Skill'}
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

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No skills found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first skill to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {skill.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {skill.description && (
                <p className="text-gray-600 text-sm mb-4">{skill.description}</p>
              )}
              
              <div className="text-xs text-gray-500">
                Created: {new Date(skill.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
