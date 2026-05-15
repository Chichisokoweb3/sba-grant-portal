import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/')
      } else {
        setUser(session.user)
        await supabase.from('profiles').upsert({
          id: session.user.id,
          email: session.user.email,
        })
      }
    }
    checkUser()
  }, [])

  if (!user) return <div className="p-8 text-center text-gray-600">Loading...</div>

  const selectOption = (option) => {
    if (option === 'grant') router.push('/apply-grant')
    else if (option === 'loan') router.push('/loan')
    else if (option === 'disaster') router.push('/disaster')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <h1 className="text-xl font-bold tracking-tight">SBA Grants and Loans</h1>
          </div>
          <span className="text-blue-200 text-sm hidden sm:block">{user.email}</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your SBA Assistance Portal</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select the type of assistance you need. Our programs are designed to help small businesses grow, recover, and thrive.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Grant Card */}
          <div
            onClick={() => selectOption('grant')}
            className="cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Small Business Grant</h3>
            <p className="text-gray-600 mb-4">Apply for a grant up to <strong>$150,000</strong> to start or expand your business.</p>
            <span className="text-blue-700 font-semibold hover:underline">Apply Now →</span>
          </div>

          {/* Loan Card */}
          <div
            onClick={() => selectOption('loan')}
            className="cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Business Loan</h3>
            <p className="text-gray-600 mb-4">Low‑interest loans for working capital, equipment, and more.</p>
            <span className="text-red-600 font-medium">Currently Unavailable</span>
          </div>

          {/* Disaster Relief Card */}
          <div
            onClick={() => selectOption('disaster')}
            className="cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Disaster Relief Fund</h3>
            <p className="text-gray-600 mb-4">Assistance for businesses affected by natural disasters.</p>
            <span className="text-red-600 font-medium">Currently Unavailable</span>
          </div>
        </div>

        {/* Customer Portal Link */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/customer-portal')}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition shadow-md"
          >
            Go to My Customer Portal
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-sm">
        © 2026 SBA Grants and Loans. All rights reserved. Secure & Encrypted.
      </footer>
    </div>
  )
}