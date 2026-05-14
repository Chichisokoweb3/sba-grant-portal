import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

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

      // Load previous messages
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
      setMessages(data || [])

      // Subscribe to new messages (real‑time)
      const subscription = supabase
        .channel('chat-room')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${session.user.id}`,
        }, payload => {
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    })()
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom
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
        .upload(`ids/${fileName}`, imageFile) // reuse bucket
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
    <div className="min-h-screen bg-gray-100 flex flex-col p-4">
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col bg-white rounded-xl shadow overflow-hidden">
        <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
          <h2 className="font-semibold">Customer Support</h2>
          <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full font-medium">
            🛡️ This chat is monitored for your safety
          </span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ maxHeight: '60vh' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg p-3 ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-200'}`}>
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
        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2 items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
          />
          <label className="cursor-pointer text-gray-600 hover:text-blue-600">
            📎
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setImageFile(e.target.files[0])}
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
      <button onClick={() => router.push('/customer-portal')} className="mt-4 text-blue-600 underline self-center">
        ← Back to Portal
      </button>
    </div>
  )
}