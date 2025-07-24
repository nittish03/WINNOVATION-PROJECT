'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { toast } from "react-toastify"
import { Users, Search, Filter, MoreVertical, Shield, User, GraduationCap } from "lucide-react"

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    if (!session || session.user.role !== 'admin') return
    loadUsers()
  }, [session])

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users')
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { role: newRole })
      toast.success('User role updated!')
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (!session || session.user.role !== 'admin') {
    return <div className="text-center py-8">Access denied. Admins only.</div>
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Education
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleSelector
                          currentRole={user.role}
                          userId={user.id}
                          onRoleChange={handleRoleChange}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{user.university || 'Not specified'}</div>
                          <div className="text-xs">{user.degree} - {user.branch}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>Enrollments: {user._count?.enrollments || 0}</div>
                          <div>Certificates: {user._count?.certificates || 0}</div>
                          <div>Skills: {user._count?.skills || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="text-xs text-gray-500">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RoleSelector({ currentRole, userId, onRoleChange }) {
  const [role, setRole] = useState(currentRole)
  const [isChanging, setIsChanging] = useState(false)

  const handleChange = async (newRole) => {
    if (newRole === role) return
    
    setIsChanging(true)
    await onRoleChange(userId, newRole)
    setRole(newRole)
    setIsChanging(false)
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'faculty': return <GraduationCap className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'faculty': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isChanging}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(role)} ${
        isChanging ? 'opacity-50' : 'hover:bg-opacity-75 cursor-pointer'
      }`}
    >
      <option value="student">Student</option>
      <option value="faculty">Faculty</option>
      <option value="admin">Admin</option>
    </select>
  )
}
