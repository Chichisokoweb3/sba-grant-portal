import { useRouter } from 'next/router'
import SupportButton from '../components/SupportButton'

export default function Disaster() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-blue-900 text-white py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <h1 className="text-xl font-bold tracking-tight">SBA Grants and Loans</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Disaster Relief Fund</h2>
          <p className="text-gray-500 mb-6">Assistance for businesses affected by natural disasters.</p>
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">Not currently available. Please check back later.</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-blue-700 hover:underline font-medium">
            ← Back to Dashboard
          </button>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-sm">
        © 2026 SBA Grants and Loans. All rights reserved.
      </footer>
      <SupportButton />
    </div>
  )
}