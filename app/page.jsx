'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BookOpen, Award, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Student Skill Development
            <span className="text-blue-600 block">Portal</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Enhance your skills, track your progress,  in a comprehensive learning environment designed for modern students.
          </p>

          {session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Welcome back, <span className="font-semibold text-blue-600">{session.user.name || session.user.email}</span>!
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/courses"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
          <p className="text-lg text-gray-600">Everything you need for comprehensive skill development</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Courses</h3>
            <p className="text-gray-600">Access comprehensive courses designed to enhance your skills with practical assignments and projects.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill Assessment</h3>
            <p className="text-gray-600">Track and rate your proficiency levels across different skills with our comprehensive assessment system.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
            <p className="text-gray-600">Connect with peers through discussion forums and collaborative learning environments.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 rounded-lg p-3 w-fit mb-4">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-gray-600">Monitor your learning journey with detailed analytics and earn certificates upon completion.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!session && (
        <div className="bg-blue-600 text-white py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of students who are already advancing their skills with our platform.
            </p>
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
