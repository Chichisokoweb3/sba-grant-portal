import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

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
      // Fetch latest grant application
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

  const handleWithdrawClick = () => {
    setShowWithdrawInfo(true) // show message to contact support
  }

  if (!user) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-blue-900">Customer Portal</h1>
        {application ? (
          <div className="mt-6 space-y-4">
            <p>Status: <span className="font-semibold capitalize">{application.status}</span></p>
            {application.status === 'approved' && application.approved_amount && (
              <>
                <p className="text-green-700 font-bold text-lg">
                  Approved Amount: ${parseInt(application.approved_amount).toLocaleString()}
                </p>
                <button
                  onClick={handleWithdrawClick}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                  disabled
                >
                  Withdraw Funds
                </button>
                {showWithdrawInfo && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                    <p className="text-yellow-800">
                      To activate withdrawal, please contact customer support with your account details.
                      The withdrawal button will be enabled after verification.
                    </p>
                  </div>
                )}
              </>
            )}
            {application.status === 'pending' && (
              <p className="text-blue-600">Your application is being reviewed. Check back later.</p>
            )}
          </div>
        ) : (
          <p>No application found. Apply for a grant first.</p>
        )}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push('/chat')}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Contact Customer Support
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-blue-600 underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}