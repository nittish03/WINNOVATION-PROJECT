'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import axios from 'axios'

export default function EnrollmentsPage() {
  const { data: session } = useSession()
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')

  useEffect(() => {
    axios.get('/api/enrollments').then(res => setEnrollments(res.data))
    axios.get('/api/courses').then(res => setCourses(res.data))
  }, [])

  async function enroll(e) {
    e.preventDefault()
    try {
      const res = await axios.post('/api/enrollments', { courseId })
      if (res.status === 200) {
        toast.success('Enrolled!')
        setCourseId('')
        axios.get('/api/enrollments').then(res => setEnrollments(res.data))
      } else {
        toast.error('Error enrolling')
      }
    } catch (error) {
      toast.error('Error enrolling')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">My Enrollments</h1>
      {session?.user?.role === 'student' && (
        <form onSubmit={enroll} className="mb-6 space-y-2">
          <select className="border p-2 rounded w-full" value={courseId} onChange={e => setCourseId(e.target.value)} required>
            <option value="">Select Course</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <button className="bg-blue-600 text-white py-2 px-4 rounded" type="submit">Enroll</button>
        </form>
      )}
      <ul className="space-y-2">
        {enrollments.map(enr => (
          <li key={enr.id} className="p-2 bg-gray-100 rounded">
            {enr.course?.title || enr.courseId} [{enr.status}]
          </li>
        ))}
      </ul>
    </div>
  )
}
