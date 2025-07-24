'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { Award, Plus, Trash2 } from "lucide-react"
import { toast } from "react-toastify"

export default function UserSkillsPage() {
  const { data: session } = useSession()
  const [userSkills, setUserSkills] = useState([])
  const [allSkills, setAllSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    skillId: '',
    level: 1
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userSkillsRes, allSkillsRes] = await Promise.all([
        axios.get('/api/user-skills'),
        axios.get('/api/skills')
      ])
      setUserSkills(userSkillsRes.data)
      setAllSkills(allSkillsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/user-skills', formData)
      toast.success('Skill added successfully!')
      setShowForm(false)
      setFormData({ skillId: '', level: 1 })
      loadData()
    } catch (error) {
      toast.error('Failed to add skill')
    }
  }

  const handleDelete = async (userSkillId) => {
    if (confirm('Are you sure you want to remove this skill?')) {
      try {
        await axios.delete(`/api/user-skills/${userSkillId}`)
        toast.success('Skill removed successfully!')
        loadData()
      } catch (error) {
        toast.error('Failed to remove skill')
      }
    }
  }

  const availableSkills = allSkills.filter(skill => 
    !userSkills.some(us => us.skillId === skill.id)
  )

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Skills</h1>
          <p className="text-gray-600">Track and manage your skill levels</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </button>
      </div>

      {userSkills.length === 0 ? (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No skills added yet</h3>
          <p className="mt-1 text-gray-500">Add your first skill to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSkills.map(userSkill => (
            <div key={userSkill.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold">{userSkill.skill?.name}</h3>
                    <span className="text-sm text-gray-500">{userSkill.skill?.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(userSkill.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Level {userSkill.level}/10</span>
                  <span className="text-sm text-gray-500">{userSkill.level * 10}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${userSkill.level * 10}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                {userSkill.skill?.description || 'No description available'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Skill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Skill</label>
                <select
                  value={formData.skillId}
                  onChange={(e) => setFormData({...formData, skillId: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Choose a skill</option>
                  {availableSkills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Proficiency Level: {formData.level}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md">
                  Add Skill
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
