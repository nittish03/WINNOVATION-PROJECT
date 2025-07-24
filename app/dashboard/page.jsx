'use client'
'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [userSkills, setUserSkills] = useState([])
  const [certificates, setCertificates] = useState([])

  useEffect(() => {
    if (!session) return
    axios.get('/api/profile').then(res => setProfile(res.data))
    axios.get('/api/enrollments').then(res => setEnrollments(res.data))
    if(session.user?.role === 'student'){
      axios.get('/api/user-skills').then(res => setUserSkills(res.data))
    }
    axios.get('/api/certificates').then(res => setCertificates(res.data))
  }, [session])

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Please sign in.</div>
  console.log("session"+session)
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {profile?.name || session.user.email}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold text-lg mb-2">Enrolled Courses</h2>
          <ul>
            {enrollments.map(en => <li key={en.id}>{en.course?.title || en.courseId} [{en.status}]</li>)}
          </ul>
          <h2 className="font-bold text-lg mb-2 mt-4">My Skills</h2>
          <ul>
            {userSkills.map(us => <li key={us.id}>{us.skill.name} (Level {us.level})</li>)}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-2">Certificates</h2>
          <ul>
            {certificates.map(cert => (
              <li key={cert.id}>
                {cert.course?.title || cert.courseId}
                {cert.url && <span> – <a className="text-blue-600 underline" href={cert.url} target="_blank">View</a></span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
