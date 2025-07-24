'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function MyCourses() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    axios.get("/api/enrollments").then(r => setEnrollments(r.data));
  }, []);
  if (session?.user?.role !== "student") return <div>Not Allowed.</div>;

  return (
    <div className="py-8 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-6">My Courses</h1>
      <ul>
        {enrollments.map(e => (
          <li key={e.id} className="mb-4 p-4 bg-gray-100 rounded">
            <strong>{e.course?.title}</strong> <br />
            Status: {e.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
