'use client'
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"

export default function SkillsPage() {
  const { data: session } = useSession()
  const [skills, setSkills] = useState([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const fetchSkills = async () => {
    const { data } = await axios.get('/api/skills')
    setSkills(data)
  }
  useEffect(() => { fetchSkills() }, [])

  async function handleSkill(e) {
    e.preventDefault()
    try {
      await axios.post('/api/skills', { name, description })
      toast.success("Skill added")
      setName(""); setDescription(""); fetchSkills()
    } catch (e) {
      toast.error(e.response?.data?.error || "Error adding skill")
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 ">
      <h1 className="text-2xl font-bold mb-4">Skills Catalog</h1>
      {session?.user?.role === "admin" && (
        <form onSubmit={handleSkill} className="mb-8 flex gap-2 text-black">
          <input required placeholder="Skill Name" className="border p-2 flex-1 rounded " value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Description" className="border p-2 flex-1 rounded" value={description} onChange={e => setDescription(e.target.value)} />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </form>
      )}
      <ul className="space-y-2">
        {skills.map(skill => <li key={skill.id} className="p-2 bg-gray-100 rounded text-black">{skill.name}</li>)}
      </ul>
    </div>
  )
}
