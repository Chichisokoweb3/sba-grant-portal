import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import SupportButton from '../components/SupportButton'

export default function ApplyGrant() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    grantAmount: '50000',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
  })
  const [idFile, setIdFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.replace('/')
      else setUser(session.user)
    })()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!idFile) {
      setMessage('Please upload your ID.')
      return
    }
    setUploading(true)
    const fileExt = idFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`ids/${fileName}`, idFile)
    if (uploadError) {
      setMessage('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(`ids/${fileName}`)
    const idUrl = urlData.publicUrl
    const { error: insertError } = await supabase.from('grant_applications').insert({
      user_id: user.id,
      grant_amount: form.grantAmount,
      id_document_url: idUrl,
      bank_name: form.bankName,
      account_number: form.accountNumber,
      routing_number: form.routingNumber,
      status: 'pending'
    })
    if (insertError) {
      setMessage('Submission error: ' + insertError.message)
    } else {
      setMessage('Application submitted! Check your customer portal for status.')
    }
    setUploading(false)
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
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Small Business Grant Request</h2>
          <p className="text-gray-500 mb-6">Select grant amount and upload required documents.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required className="w-full border-2 border-gray-400 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input required type="tel" className="w-full border-2 border-gray-400 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grant Amount</label>
              <select className="w-full border-2 border-gray-400 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                value={form.grantAmount} onChange={e => setForm({...form, grantAmount: e.target.value})}>
                <option value="50000">$50,000</option>
                <option value="100000">$100,000</option>
                <option value="150000">$150,000</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input required className="w-full border-2 border-gray-400 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input required className="w-full border-2 border-gray-400 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
              <input required className="w-full border-2 border-gray-400 rounded-lg p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                value={form.routingNumber} onChange={e => setForm({...form, routingNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID (Driver’s License / Passport – max 5MB)</label>
              <input type="file" accept="image/*" required className="w-full border-2 border-gray-400 rounded-lg p-3 text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e => {
                  const file = e.target.files[0]
                  if (file && file.size > 5 * 1024 * 1024) {
                    setMessage('File too large. Max 5MB.')
                    return
                  }
                  setIdFile(file)
                }} />
            </div>
            <button type="submit" disabled={uploading}
              className="w-full bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-900 disabled:opacity-50 transition">
              {uploading ? 'Submitting...' : 'Submit Application'}
            </button>
            {message && <p className="text-center text-sm text-green-700 font-medium">{message}</p>}
          </form>
          <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-700 hover:underline font-medium">
            ← Back to selection
          </button>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-sm">
        © 2026 SBA Grants and Loans. All rights reserved. Secure & Encrypted.
      </footer>
      <SupportButton />
    </div>
  )
}