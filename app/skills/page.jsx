'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

export default function SkillsPage() {
  const { data: session } = useSession()
  const [skills, setSkills] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetch('/api/skills').then(res => res.json()).then(setSkills)
  }, [])

  async function handleAddSkill(e) {
    e.preventDefault()
    const res = await fetch('/api/skills', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.ok) {
      toast.success('Skill Added!')
      setName('')
      setDescription('')
      fetch('/api/skills').then(res => res.json()).then(setSkills)
    } else {
      toast.error('Error adding skill')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 text-black">
      <h1 className="text-2xl font-bold mb-4">Skills Directory</h1>
      {session?.user?.role === 'admin' && (
        <form onSubmit={handleAddSkill} className="mb-6 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Skill Name" className="border p-2 rounded w-full" required />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded w-full" />
          <button className="bg-blue-600 text-black py-2 px-4 rounded" type="submit">Add Skill</button>
        </form>
      )}
      <ul className="space-y-2">
        {skills.map(skill => (
          <li key={skill.id} className="p-2 bg-gray-100 rounded">{skill.name}</li>
        ))}
      </ul>
    </div>
  )
}
