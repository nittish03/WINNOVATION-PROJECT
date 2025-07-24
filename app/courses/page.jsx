'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

export default function CoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState([])
  const [skills, setSkills] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skillId, setSkillId] = useState('')

  useEffect(() => {
    fetch('/api/skills').then(res => res.json()).then(setSkills)
    fetch('/api/courses').then(res => res.json()).then(setCourses)
  }, [])

  async function addCourse(e) {
    e.preventDefault()
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, skillId })
    })
    if (res.ok) {
      toast.success('Course Added!')
      setTitle('')
      setDescription('')
      setSkillId('')
      fetch('/api/courses').then(res => res.json()).then(setCourses)
    } else {
      toast.error('Error adding course')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Courses</h1>
      {session?.user?.role === 'admin' && (
        <form onSubmit={addCourse} className="mb-6 space-y-2">
          <input className="border p-2 rounded w-full" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Course Title" />
          <input className="border p-2 rounded w-full" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
          <select className="border p-2 rounded w-full" value={skillId} onChange={e => setSkillId(e.target.value)}>
            <option value="">Select Skill</option>
            {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
          </select>
          <button className="bg-blue-600 text-white py-2 px-4 rounded" type="submit">Add Course</button>
        </form>
      )}
      <ul className="space-y-2">
        {courses.map(course => (
          <li key={course.id} className="p-2 bg-gray-100 rounded">
            {course.title} {course.skill && <span className="text-gray-400">({course.skill.name})</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
