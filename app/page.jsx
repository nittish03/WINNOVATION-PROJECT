'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-800">
          Student Skill Development Portal
        </h1>
        <p className="mb-6 text-gray-700">
          Track your skills, enroll in courses, and earn certificates — all in one place.<br />
          {session
            ? `Welcome, ${session.user.name || session.user.email}!`
            : 'Please sign in to get started.'}
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/skills"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
          >
            Browse Skills
          </Link>
          <Link
            href="/courses"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition"
          >
            Explore Courses
          </Link>
          <Link
            href="/profile"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition"
          >
            My Profile
          </Link>
        </div>

        {!session && (
          <div className="mt-8 mb-2">
            <Link
              href="/api/auth/signin"
              className="underline text-blue-700 hover:text-blue-900"
            >
              Sign in with your account
            </Link>
          </div>
        )}
      </div>
      <footer className="text-sm text-gray-400 mt-8">
        &copy; {new Date().getFullYear()} Student Skill Development Portal
      </footer>
    </div>
  )
}
