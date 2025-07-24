'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Award, 
  Plus, 
  Search, 
  Filter,
  Star,
  TrendingUp,
  Trash2,
  Edit3,
  Save,
  X,
  Target,
  BookOpen
} from "lucide-react"
import { toast } from "react-toastify"

export default function UserSkillsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [userSkills, setUserSkills] = useState([])
  const [availableSkills, setAvailableSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'student') {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [session, router])

  const loadData = async () => {
    try {
      const [userSkillsRes, availableSkillsRes] = await Promise.all([
        axios.get('/api/user-skills'),
        axios.get('/api/skills')
      ])
      setUserSkills(userSkillsRes.data)
      setAvailableSkills(availableSkillsRes.data)
    } catch (error) {
      console.error('Error loading skills:', error)
      toast.error('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const updateSkillLevel = async (userSkillId, newLevel) => {
    try {
      await axios.patch(`/api/user-skills/${userSkillId}`, { level: newLevel })
      toast.success('Skill level updated!')
      loadData()
    } catch (error) {
      toast.error('Failed to update skill level')
    }
  }

  const removeSkill = async (userSkillId) => {
    if (confirm('Are you sure you want to remove this skill?')) {
      try {
        await axios.delete(`/api/user-skills/${userSkillId}`)
        toast.success('Skill removed!')
        loadData()
      } catch (error) {
        toast.error('Failed to remove skill')
      }
    }
  }

  const addSkills = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill')
      return
    }

    try {
      await axios.post('/api/user-skills', { skills: selectedSkills })
      toast.success(`Added ${selectedSkills.length} skill(s)!`)
      setShowAddModal(false)
      setSelectedSkills([])
      loadData()
    } catch (error) {
      toast.error('Failed to add skills')
    }
  }

  const getSkillLevelText = (level) => {
    if (level <= 2) return 'Beginner'
    if (level <= 5) return 'Intermediate'
    if (level <= 8) return 'Advanced'
    return 'Expert'
  }

  const getSkillLevelColor = (level) => {
    if (level <= 2) return 'text-red-600 bg-red-100'
    if (level <= 5) return 'text-yellow-600 bg-yellow-100'
    if (level <= 8) return 'text-blue-600 bg-blue-100'
    return 'text-green-600 bg-green-100'
  }

  const categories = [...new Set(availableSkills.map(skill => skill.category))]
  const userSkillIds = new Set(userSkills.map(us => us.skillId))
  const skillsToAdd = availableSkills.filter(skill => !userSkillIds.has(skill.id))

  const filteredUserSkills = userSkills.filter(userSkill => {
    const matchesSearch = userSkill.skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || userSkill.skill.category === categoryFilter
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Skills</h1>
            <p className="text-gray-600">Manage and track your learning progress</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Skills
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Skills</p>
                <p className="text-3xl font-bold text-gray-900">{userSkills.length}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expert Level</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userSkills.filter(us => us.level >= 9).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Level</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userSkills.length > 0 
                    ? Math.round(userSkills.reduce((acc, us) => acc + us.level, 0) / userSkills.length)
                    : 0
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(userSkills.map(us => us.skill.category)).size}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow p-4 mb-6"
        >
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
        </motion.div>

        {/* Skills Grid */}
        {filteredUserSkills.length === 0 ? (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No skills found</h3>
            <p className="mt-1 text-gray-500">
              {userSkills.length === 0 
                ? 'Start by adding your first skill!' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUserSkills.map((userSkill, index) => (
                <motion.div
                  key={userSkill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{userSkill.skill.name}</h3>
                        <span className="text-sm text-gray-500">{userSkill.skill.category}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingSkill(userSkill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeSkill(userSkill.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {userSkill.skill.description || 'No description available'}
                  </p>

                  {/* Skill Level */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Proficiency Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(userSkill.level)}`}>
                        {getSkillLevelText(userSkill.level)}
                      </span>
                    </div>
                    
                    {editingSkill?.id === userSkill.id ? (
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={editingSkill.level}
                          onChange={(e) => setEditingSkill({...editingSkill, level: parseInt(e.target.value)})}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Beginner</span>
                          <span>Expert</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              updateSkillLevel(userSkill.id, editingSkill.level)
                              setEditingSkill(null)
                            }}
                            className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-xs hover:bg-green-700"
                          >
                            <Save className="h-3 w-3 inline mr-1" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSkill(null)}
                            className="flex-1 bg-gray-600 text-white py-1 px-3 rounded text-xs hover:bg-gray-700"
                          >
                            <X className="h-3 w-3 inline mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${userSkill.level * 10}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Level {userSkill.level}/10</span>
                          <span>{userSkill.level * 10}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Added {new Date(userSkill.addedAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add Skills Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Skills</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {skillsToAdd.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">All skills added!</h3>
                    <p className="mt-1 text-gray-500">You've added all available skills to your profile</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {skillsToAdd.map(skill => (
                        <div
                          key={skill.id}
                          onClick={() => {
                            setSelectedSkills(prev => 
                              prev.includes(skill.id) 
                                ? prev.filter(id => id !== skill.id)
                                : [...prev, skill.id]
                            )
                          }}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedSkills.includes(skill.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <Award className="h-6 w-6 text-blue-600 mr-2" />
                            <div>
                              <h3 className="font-medium text-gray-900">{skill.name}</h3>
                              <span className="text-sm text-gray-500">{skill.category}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{skill.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {selectedSkills.length} skill(s) selected
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setShowAddModal(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addSkills}
                          disabled={selectedSkills.length === 0}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Selected Skills
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
