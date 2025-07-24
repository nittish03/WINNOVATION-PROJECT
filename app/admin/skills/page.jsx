'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { Award, Plus } from "lucide-react"
import { toast } from "react-toastify"

export default function SkillsPage() {
  const { data: session } = useSession()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General'
  })

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const response = await axios.get('/api/skills')
      setSkills(response.data)
    } catch (error) {
      console.error('Error loading skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/skills', formData)
      toast.success('Skill created successfully!')
      setShowForm(false)
      setFormData({ name: '', description: '', category: 'General' })
      loadSkills()
    } catch (error) {
      toast.error('Failed to create skill')
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Skills</h1>
          <p className="text-gray-600">Explore and learn new skills</p>
        </div>
        {session?.user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </button>
        )}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map(skill => (
          <div key={skill.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h3 className="text-lg font-semibold">{skill.name}</h3>
                <span className="text-sm text-gray-500">{skill.category}</span>
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

      {/* Create Skill Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Skill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skill Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="General">General</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md">
                  Create
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
