import { useRouter } from 'next/router'

export default function Loan() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <h1 className="text-2xl font-bold text-gray-700">Loans</h1>
      <p className="mt-4 text-gray-500">Not currently available, please check back later.</p>
      <button onClick={() => router.push('/dashboard')} className="mt-6 text-blue-600 underline">← Back</button>
    </div>
  )
}