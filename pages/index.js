import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setError(error.message)
    else setStep('code')
    setLoading(false)
  }

  const verifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    if (error) setError(error.message)
    else window.location.href = '/dashboard'
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Government‑style header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <h1 className="text-xl font-bold tracking-tight">SBA Grants and Loans</h1>
          </div>
          <span className="text-blue-200 text-sm hidden sm:block">U.S. Small Business Assistance</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Access Your Account</h2>
              <p className="text-gray-500 mt-1">Sign in or create an account to apply for grants and loans.</p>
            </div>

            {step === 'email' ? (
              <form onSubmit={sendCode} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
                >
                  {loading ? 'Sending code...' : 'Send Verification Code'}
                </button>
                {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                <p className="text-xs text-gray-500 text-center mt-4">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            ) : (
              <form onSubmit={verifyCode} className="space-y-4">
                <p className="text-sm text-gray-600">
                  We sent a 6‑digit code to <strong className="text-gray-900">{email}</strong>. Please enter it below.
                </p>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="6"
                    placeholder="000000"
                    className="w-full border border-gray-300 rounded-lg p-3 text-center text-2xl tracking-widest text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                    required
                  />
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs text-red-800">
                    <strong>Security warning:</strong> Do not share this code with anyone. Our support team will never ask for it.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-blue-600 text-sm hover:underline"
                >
                  ← Use a different email
                </button>
              </form>
            )}
          </div>

          {/* Footer text */}
          <p className="text-xs text-gray-400 text-center mt-6">
            This is a U.S. Small Business Administration authorized portal. All communication is secure and encrypted.
          </p>
        </div>
      </main>
    </div>
  )
}