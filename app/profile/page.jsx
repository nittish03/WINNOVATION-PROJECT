'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Mail, 
  GraduationCap, 
  Building, 
  BookOpen,
  Camera,
  Shield,
  Calendar,
  MapPin
} from "lucide-react"

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [edit, setEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ 
    name: "", 
    university: "", 
    degree: "", 
    branch: "", 
    image: "" 
  })

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    loadProfile()
  }, [session, router])

  const loadProfile = async () => {
    try {
      const response = await axios.get("/api/profile")
      setProfile(response.data)
      setForm({
        name: response.data?.name || "",
        university: response.data?.university || "",
        degree: response.data?.degree || "",
        branch: response.data?.branch || "",
        image: response.data?.image || ""
      })
    } catch (error) {
      toast.error("Failed to load profile")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await axios.patch("/api/profile", form)
      toast.success("Profile updated successfully!")
      setEdit(false)
      await loadProfile()
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              {/* Profile Image */}
              <motion.div 
                className="relative inline-block mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <img
                    src={profile.image}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20"></div>
                  <motion.div
                    className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEdit(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Basic Info */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.name || 'User Name'}
              </h2>
              <p className="text-gray-600 mb-4">{profile.email}</p>
              
              {/* Role Badge */}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  profile.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : profile.role === 'instructor'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                <Shield className="h-4 w-4 mr-2" />
                {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
              </motion.span>

              {/* Member Since */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                {!edit && (
                  <motion.button
                    onClick={() => setEdit(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </motion.button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!edit ? (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Profile Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ProfileField
                        icon={<User className="h-5 w-5" />}
                        label="Full Name"
                        value={profile.name || 'Not provided'}
                      />
                      <ProfileField
                        icon={<Mail className="h-5 w-5" />}
                        label="Email Address"
                        value={profile.email}
                      />
                      <ProfileField
                        icon={<Building className="h-5 w-5" />}
                        label="University"
                        value={profile.university || 'Not provided'}
                      />
                      <ProfileField
                        icon={<GraduationCap className="h-5 w-5" />}
                        label="Degree"
                        value={profile.degree || 'Not provided'}
                      />
                      <ProfileField
                        icon={<BookOpen className="h-5 w-5" />}
                        label="Branch/Major"
                        value={profile.branch || 'Not provided'}
                        className="md:col-span-2"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={saveProfile}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        icon={<User className="h-5 w-5" />}
                        label="Full Name"
                        type="text"
                        value={form.name}
                        onChange={(value) => handleInputChange('name', value)}
                        placeholder="Enter your full name"
                      />
                      <FormField
                        icon={<Building className="h-5 w-5" />}
                        label="University"
                        type="text"
                        value={form.university}
                        onChange={(value) => handleInputChange('university', value)}
                        placeholder="Enter your university"
                      />
                      <FormField
                        icon={<GraduationCap className="h-5 w-5" />}
                        label="Degree"
                        type="text"
                        value={form.degree}
                        onChange={(value) => handleInputChange('degree', value)}
                        placeholder="e.g., Bachelor of Technology"
                      />
                      <FormField
                        icon={<BookOpen className="h-5 w-5" />}
                        label="Branch/Major"
                        type="text"
                        value={form.branch}
                        onChange={(value) => handleInputChange('branch', value)}
                        placeholder="e.g., Computer Science"
                      />
                      <FormField
                        icon={<Camera className="h-5 w-5" />}
                        label="Profile Image URL"
                        type="url"
                        value={form.image}
                        onChange={(value) => handleInputChange('image', value)}
                        placeholder="https://example.com/image.jpg"
                        className="md:col-span-2"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                      <motion.button
                        type="button"
                        onClick={() => setEdit(false)}
                        className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </motion.button>
                      
                      <motion.button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: saving ? 1 : 1.02 }}
                        whileTap={{ scale: saving ? 1 : 0.98 }}
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function ProfileField({ icon, label, value, className = "" }) {
  return (
    <motion.div
      className={`p-4 bg-gray-50 rounded-xl border border-gray-200 ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center space-x-3">
        <div className="text-gray-500">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-gray-900 font-medium">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

function FormField({ icon, label, type, value, onChange, placeholder, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">{icon}</span>
          <span>{label}</span>
        </div>
      </label>
      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
        whileFocus={{ scale: 1.02 }}
      />
    </div>
  )
}
