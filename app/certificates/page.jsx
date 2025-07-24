'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

export default function CertificatesPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState([])
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [userId, setUserId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    fetch('/api/certificates').then(res => res.json()).then(setCertificates)
    fetch('/api/courses').then(res => res.json()).then(setCourses)
    // fetch('/api/users').then(res => res.json()).then(setUsers) // Optionally populate this for admin
  }, [])

  async function addCertificate(e) {
    e.preventDefault()
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId, url })
    })
    if (res.ok) {
      toast.success('Certificate Issued!')
      setUserId('')
      setCourseId('')
      setUrl('')
      fetch('/api/certificates').then(res => res.json()).then(setCertificates)
    } else {
      toast.error('Error issuing certificate')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Certificates</h1>
      {session?.user?.role === 'admin' && (
        <form onSubmit={addCertificate} className="mb-6 space-y-2">
          <input className="border p-2 rounded w-full" value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" required />
          <select className="border p-2 rounded w-full" value={courseId} onChange={e => setCourseId(e.target.value)} required>
            <option value="">Select Course</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <input className="border p-2 rounded w-full" value={url} onChange={e => setUrl(e.target.value)} placeholder="Certificate URL (optional)" />
          <button className="bg-blue-600 text-white py-2 px-4 rounded" type="submit">Issue Certificate</button>
        </form>
      )}
      <ul className="space-y-2">
        {certificates.map(cert => (
          <li key={cert.id} className="p-2 bg-gray-100 rounded">
            {cert.course?.title || cert.courseId} <br />
            {cert.url && <a href={cert.url} className="text-blue-700 underline" target="_blank">View Certificate</a>}
          </li>
        ))}
      </ul>
    </div>
  )
}
