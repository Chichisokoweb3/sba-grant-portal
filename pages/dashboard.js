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
        // Create/update profile
        await supabase.from('profiles').upsert({
          id: session.user.id,
          email: session.user.email,
        })
      }
    }
    checkUser()
  }, [])

  if (!user) return <div className="p-8 text-center">Loading...</div>

  const selectOption = (option) => {
    if (option === 'grant') router.push('/apply-grant')
    else if (option === 'loan') router.push('/loan')
    else if (option === 'disaster') router.push('/disaster')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-blue-900">Welcome, {user.email}</h1>
        <p className="text-gray-600 mt-2">Select the assistance you need:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { label: 'Small Business Grant', value: 'grant', desc: 'Up to $150,000' },
            { label: 'Business Loan', value: 'loan', desc: 'Check back later' },
            { label: 'Disaster Relief Fund', value: 'disaster', desc: 'Check back later' },
          ].map(item => (
            <div
              key={item.value}
              onClick={() => selectOption(item.value)}
              className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-blue-800">{item.label}</h2>
              <p className="text-gray-500 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
        {/* Also link to customer portal */}
        <div className="mt-12">
          <button
            onClick={() => router.push('/customer-portal')}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900"
          >
            My Customer Portal
          </button>
        </div>
      </div>
    </div>
  )
}