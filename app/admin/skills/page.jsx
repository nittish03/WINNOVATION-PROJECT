'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { toast } from "react-toastify"
import { Award, Plus, Edit, Trash } from "lucide-react"

export default function AdminSkillsPage() {
  const { data: session } = useSession()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General'
  })

  const categories = ['General', 'Programming', 'Frontend', 'Backend', 'Data Science', 'Design', 'Management', 'Infrastructure']

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
        toast.success('Skill updated successfully!')
      } else {
        await axios.post('/api/skills', formData)
        toast.success('Skill created successfully!')
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
      toast.success('Skill deleted successfully!')
      loadSkills()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete skill')
    }
  }

  if (!session || session.user.role !== 'admin') {
    return <div className="text-center py-8">Access denied. Admins only.</div>
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
          <p className="text-gray-600 mt-2">Manage the skills catalog</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </button>
      </div>

      {/* Skill Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingSkill ? 'Edit Skill' : 'Create New Skill'}
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
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
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
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingSkill ? 'Update' : 'Create'} Skill
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSkill(null)
                    setFormData({ name: '', description: '', category: 'General' })
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skills by Category */}
      {Object.keys(groupedSkills).length === 0 ? (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No skills found</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first skill to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-blue-600" />
                {category} ({categorySkills.length})
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{skill.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {skill.description && (
                      <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created: {new Date(skill.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
