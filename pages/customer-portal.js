import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import SupportButton from '../components/SupportButton'

export default function CustomerPortal() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [application, setApplication] = useState(null)
  const [showWithdrawInfo, setShowWithdrawInfo] = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/')
        return
      }
      setUser(session.user)
      const { data } = await supabase
        .from('grant_applications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setApplication(data)
    })()
  }, [])

  const handleWithdrawClick = () => setShowWithdrawInfo(true)

  if (!user) return <div className="p-8 text-gray-600">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
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

      <main className="flex-1 max-w-2xl mx-auto w-full p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Portal</h2>
          {application ? (
            <div className="space-y-4">
              <p className="text-lg">
                Status: <span className={`font-semibold capitalize ${application.status === 'approved' ? 'text-green-700' : 'text-blue-700'}`}>{application.status}</span>
              </p>
              {application.status === 'approved' && application.approved_amount && (
                <>
                  <p className="text-green-700 font-bold text-xl">
                    Approved Amount: ${parseInt(application.approved_amount).toLocaleString()}
                  </p>
                  <button onClick={handleWithdrawClick}
                    className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed font-semibold" disabled>
                    Withdraw Funds
                  </button>
                  {showWithdrawInfo && (
                    <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mt-4">
                      <p className="text-yellow-800 font-medium">
                        To activate withdrawal, please contact customer support with your account details. The withdrawal button will be enabled after verification.
                      </p>
                    </div>
                  )}
                </>
              )}
              {application.status === 'pending' && (
                <p className="text-blue-700 font-medium">Your application is being reviewed. Check back later.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No application found. Apply for a grant first.</p>
          )}
          <div className="mt-8 space-y-3">
            <button onClick={() => router.push('/chat')}
              className="w-full bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-800 transition">
              Contact Customer Support
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="w-full text-blue-700 hover:underline font-medium">Back to Dashboard</button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-sm">
        © 2026 SBA Grants and Loans. All rights reserved.
      </footer>
      <SupportButton />
    </div>
  )
}