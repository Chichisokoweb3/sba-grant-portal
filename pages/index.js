import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'code'
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
    else window.location.href = '/dashboard' // redirect after login
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-blue-900">Business Assistance Portal</h1>
        <p className="text-center text-gray-600 mt-2">Sign in or create account with email</p>
        {step === 'email' ? (
          <form onSubmit={sendCode} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border rounded-lg p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white p-3 rounded-lg font-semibold hover:bg-blue-800"
            >
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-6 space-y-4">
            <p className="text-sm text-gray-700">
              Enter the 6‑digit code we sent to <strong>{email}</strong>.
            </p>
            <input
              type="text"
              placeholder="000000"
              className="w-full border rounded-lg p-3 text-center text-lg tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <p className="text-xs text-red-600 font-medium">
              🔒 Do not share this code with anyone. Our support team will never ask for it.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-blue-600 text-sm"
            >
              Change email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}