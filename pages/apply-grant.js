import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

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
    const { data: uploadData, error: uploadError } = await supabase.storage
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-blue-900">Small Business Grant Request</h1>
        <p className="text-gray-600 mt-1">Select grant amount and upload required documents.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-medium">Full Name</label>
            <input required className="w-full border p-2 rounded" value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})} />
          </div>
          <div>
            <label className="block font-medium">Phone Number</label>
            <input required type="tel" className="w-full border p-2 rounded" value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="block font-medium">Grant Amount</label>
            <select className="w-full border p-2 rounded" value={form.grantAmount}
              onChange={e => setForm({...form, grantAmount: e.target.value})}>
              <option value="50000">$50,000</option>
              <option value="100000">$100,000</option>
              <option value="150000">$150,000</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">Bank Name</label>
            <input required className="w-full border p-2 rounded" value={form.bankName}
              onChange={e => setForm({...form, bankName: e.target.value})} />
          </div>
          <div>
            <label className="block font-medium">Account Number</label>
            <input required className="w-full border p-2 rounded" value={form.accountNumber}
              onChange={e => setForm({...form, accountNumber: e.target.value})} />
          </div>
          <div>
            <label className="block font-medium">Routing Number</label>
            <input required className="w-full border p-2 rounded" value={form.routingNumber}
              onChange={e => setForm({...form, routingNumber: e.target.value})} />
          </div>
          <div>
            <label className="block font-medium">Upload ID (Driver’s License / Passport – max 5MB)</label>
            <input type="file" accept="image/*" required className="w-full border p-2 rounded"
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
            className="w-full bg-blue-700 text-white p-3 rounded-lg font-semibold hover:bg-blue-800">
            {uploading ? 'Submitting...' : 'Submit Application'}
          </button>
          {message && <p className="text-center text-sm text-green-700">{message}</p>}
        </form>
        <button onClick={() => router.push('/dashboard')} className="mt-4 text-blue-600 underline">
          ← Back to selection
        </button>
      </div>
    </div>
  )
}