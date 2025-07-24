'use client'
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    if (!session) return;
    axios.get("/api/profile").then(r => setProfile(r.data));
    axios.get("/api/enrollments").then(r => setEnrollments(r.data));
    axios.get("/api/certificates").then(r => setCertificates(r.data));
    if (session.user.role === "student") {
      axios.get("/api/user-skills").then(r => setUserSkills(r.data));
    }
    axios.get("/api/courses").then(r => setCourses(r.data));
  }, [session]);

  if (status === "loading" || !session) return <div>Loading...</div>;

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold mb-4">
        {session.user.role === 'admin' ? "Admin " : ""}Dashboard
      </h1>
      {profile && (
        <div className="mb-6">
          <span className="font-bold">Name:</span> {profile.name} <br />
          <span className="font-bold">Email:</span> {profile.email}
        </div>
      )}
      {/* Additional analytics/stats here */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Courses</h2>
        <ul>
          {courses.map(c => (
            <li key={c.id}>{c.title}</li>
          ))}
        </ul>
      </div>
      {session.user.role === 'student' && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Enrolled Courses</h2>
            <ul>
              {enrollments.map(e => (
                <li key={e.id}>{e.course?.title} [{e.status}]</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Skill Proficiency</h2>
            <ul>
              {userSkills.map(us => (
                <li key={us.id}>{us.skill.name}: Level {us.level}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Certificates</h2>
            <ul>
              {certificates.map(cert => (
                <li key={cert.id}>
                  {cert.course?.title}
                  {cert.url && (
                    <a href={cert.url} className="ml-2 text-blue-600 underline" target="_blank">Certificate</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
