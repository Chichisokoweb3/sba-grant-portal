import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import SupportButton from '../components/SupportButton'

export default function Chat() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const chatRef = useRef(null)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/')
        return
      }
      setUser(session.user)
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      const subscription = supabase
        .channel('chat-room')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${session.user.id}`,
        }, payload => setMessages(prev => [...prev, payload.new]))
        .subscribe()
      return () => { supabase.removeChannel(subscription) }
    })()
  }, [])

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() && !imageFile) return
    let imageUrl = null
    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB')
        return
      }
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `chat-${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`ids/${fileName}`, imageFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`ids/${fileName}`)
        imageUrl = urlData.publicUrl
      } else {
        alert('Image upload failed')
        return
      }
    }
    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      sender: 'user',
      message: newMsg,
      image_url: imageUrl,
    })
    if (!error) {
      setNewMsg('')
      setImageFile(null)
    }
  }

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
          <span className="bg-yellow-300 text-yellow-900 text-xs px-3 py-1 rounded-full font-medium">
            🛡️ Monitored for safety
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-800">Customer Support Chat</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ maxHeight: '60vh' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg p-3 ${msg.sender === 'user' ? 'bg-blue-100 text-gray-900' : 'bg-gray-200 text-gray-900'}`}>
                  <p className="text-xs text-gray-500 mb-1">{msg.sender === 'user' ? 'You' : 'Support'}</p>
                  {msg.message && <p>{msg.message}</p>}
                  {msg.image_url && (
                    <img src={msg.image_url} alt="attachment" className="mt-1 max-w-xs rounded" />
                  )}
                </div>
              </div>
            ))}
            <div ref={chatRef} />
          </div>
          <form onSubmit={sendMessage} className="p-4 border-t flex gap-2 items-center bg-white">
            <input type="text" placeholder="Type a message..." className="flex-1 border-2 border-gray-400 rounded-full px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
              value={newMsg} onChange={e => setNewMsg(e.target.value)} />
            <label className="cursor-pointer text-gray-600 hover:text-blue-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
            </label>
            <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-800 transition">
              Send
            </button>
          </form>
        </div>
        <button onClick={() => router.push('/customer-portal')} className="mt-4 text-blue-700 hover:underline font-medium text-center">
          ← Back to Portal
        </button>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-sm">
        © 2026 SBA Grants and Loans. All rights reserved.
      </footer>
      <SupportButton />
    </div>
  )
}