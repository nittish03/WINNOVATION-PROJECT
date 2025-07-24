'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Award, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"

export default function CertificatesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'student') {
      router.push('/dashboard')
      return
    }
    loadCertificates()
  }, [session, router])

  const loadCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates')
      setCertificates(response.data)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-600">Your achievements and completed courses</p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No certificates earned yet</h3>
            <p className="mt-1 text-gray-500">
              Complete courses to earn certificates. 
              <Link href="/courses" className="text-blue-600 hover:text-blue-800 ml-1">Browse courses</Link>
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(certificate => (
                <div key={certificate.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-lg overflow-hidden border-2 border-yellow-200 hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-yellow-500 rounded-full">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-gray-900">Certificate of Completion</h3>
                        <p className="text-sm text-gray-600">Achievement Unlocked</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{certificate.title}</h4>
                      <p className="text-sm text-gray-600">
                        Course: {certificate.course?.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="border-t border-yellow-200 pt-4">
                      <div className="flex space-x-2">
                        {certificate.url ? (
                          <Link
                            href={certificate.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-yellow-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700 flex items-center justify-center transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Certificate
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-gray-300 text-gray-500 text-center py-2 px-4 rounded-md text-sm font-medium cursor-not-allowed"
                          >
                            Certificate Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Certificate Badge */}
                  <div className="bg-yellow-600 text-white text-center py-2">
                    <div className="text-xs font-medium">VERIFIED CERTIFICATE</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievement Stats */}
            <div className="mt-12 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievement Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {certificates.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Certificates</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {new Set(certificates.map(c => c.course?.skill?.category).filter(Boolean)).size || 0}
                  </div>
                  <div className="text-sm text-gray-600">Skill Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {certificates.length > 0 
                      ? new Date(Math.max(...certificates.map(c => new Date(c.issuedAt)))).getFullYear()
                      : new Date().getFullYear()
                    }
                  </div>
                  <div className="text-sm text-gray-600">Latest Achievement</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
