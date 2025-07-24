'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"
import axios from "axios"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({ name: "", university: "", degree: "", branch: "", image: "" })

  useEffect(() => {
    if (!session) return;
    axios.get("/api/profile").then(r => {
      setProfile(r.data)
      setForm({
        name: r.data?.name || "",
        university: r.data?.university || "",
        degree: r.data?.degree || "",
        branch: r.data?.branch || "",
        image: r.data?.image || ""
      })
    })
  }, [session])

  const saveProfile = async (e) => {
    e.preventDefault()
    await axios.patch("/api/profile", form)
    toast.success("Profile updated")
    setEdit(false)
    axios.get("/api/profile").then(r => setProfile(r.data))
  }

  if (!session) return <div>Loading...</div>
  if (!profile) return <div>Loading profile...</div>
  return (
    <div className="py-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {!edit ? (
        <div>
          <div className="mb-4">
            <img src={profile.image || '/avatar.png'} alt="profile" className="w-24 h-24 object-cover rounded-full mb-2" />
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
          <input name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border p-2 rounded" placeholder="Name" />
          <input name="university" value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} className="w-full border p-2 rounded" placeholder="University" />
          <input name="degree" value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} className="w-full border p-2 rounded" placeholder="Degree" />
          <input name="branch" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="w-full border p-2 rounded" placeholder="Branch" />
          <input name="image" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full border p-2 rounded" placeholder="Profile Image URL" />
          <div className="flex gap-2">
            <button className="bg-green-600 text-white py-2 px-4 rounded" type="submit">Save</button>
            <button type="button" className="py-2 px-4 rounded border" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
