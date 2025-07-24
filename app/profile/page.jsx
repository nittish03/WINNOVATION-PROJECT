'use client'
'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function ProfilePage() {
    const router = useRouter();
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({
    name: '',
    university: '',
    degree: '',
    branch: '',
    image: '',
  })

  useEffect(() => {
    if (!session) return
    axios.get('/api/profile').then(res => {
      const profile = res.data
      setProfile(profile)
      setForm({
        name: profile?.name || '',
        university: profile?.university || '',
        degree: profile?.degree || '',
        branch: profile?.branch || '',
        image: profile?.image || '',
      })
    })
  }, [session])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }


  async function saveProfile(e) {
    e.preventDefault()
    try {
      const res = await axios.patch('/api/profile', form)
      if (res.status === 200) {
        toast.success('Profile updated!')
        setEdit(false)
        axios.get('/api/profile').then(res => setProfile(res.data))
      } else {
        toast.error('Error updating profile')
      }
    } catch (error) {
      toast.error('Error updating profile')
    }
  }

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <>
  <div>Please sign in.</div>
  <button onClick={()=>{
    router.push("/login")
  }}>Sign in</button>
  </>
                        
  if (!profile) return <div>Loading profile...</div>

  return (
    <div className="py-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {!edit ? (
        <div>
          <div className="mb-4">
            {/* <img src={profile.image || '/avatar.png'} alt="profile" className="w-24 h-24 object-cover rounded-full mb-2" /> */}
            <div><span className="font-semibold">Name:</span> {profile.name}</div>
            <div><span className="font-semibold">Email:</span> {profile.email}</div>
            <div><span className="font-semibold">University:</span> {profile.university}</div>
            <div><span className="font-semibold">Degree:</span> {profile.degree}</div>
            <div><span className="font-semibold">Branch:</span> {profile.branch}</div>
          </div>
          <button onClick={() => setEdit(true)} className="bg-blue-700 text-white py-2 px-4 rounded">Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={saveProfile} className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Name" />
          <input name="university" value={form.university} onChange={handleChange} className="w-full border p-2 rounded" placeholder="University" />
          <input name="degree" value={form.degree} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Degree" />
          <input name="branch" value={form.branch} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Branch" />
          <input name="image" value={form.image} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Image URL" />
          <button className="bg-green-600 text-white py-2 px-4 rounded" type="submit">Save</button>
          <button type="button" className="ml-2 py-2 px-4 rounded border" onClick={() => setEdit(false)}>Cancel</button>
        </form>
      )}
    </div>
  )
}
