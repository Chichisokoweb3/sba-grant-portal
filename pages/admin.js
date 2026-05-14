import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const ADMIN_UUID = '0156adf1-b37a-4533-a9fb-b7102ed0627f' // replace with actual UUID from step 3.6

export default function Admin() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('applications')
  const [applications, setApplications] = useState([])
  const [chats, setChats] = useState({}) // userId -> messages
  const [selectedUser, setSelectedUser] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyImage, setReplyImage] = useState(null)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.id !== ADMIN_UUID) {
        router.replace('/')
        return
      }
      setUser(session.user)
      fetchApplications()
      fetchAllChats()
    })()
  }, [])

  const fetchApplications = async () => {
    const { data } = await supabase.from('grant_applications').select('*').order('created_at', { ascending: false })
    setApplications(data || [])
  }

  const fetchAllChats = async () => {
    const { data: users } = await supabase.from('profiles').select('id, email')
    let chatsTemp = {}
    for (let u of users) {
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: true })
      chatsTemp[u.id] = { email: u.email, messages: msgs || [] }
    }
    setChats(chatsTemp)
  }

  const approveApplication = async (appId, amount) => {
    await supabase
      .from('grant_applications')
      .update({ status: 'approved', approved_amount: amount })
      .eq('id', appId)
    fetchApplications()
    // The customer portal will reflect this immediately after refresh.
  }

  const sendAdminReply = async (userId) => {
    if (!replyText.trim() && !replyImage) return
    let imageUrl = null
    if (replyImage) {
      const fileExt = replyImage.name.split('.').pop()
      const fileName = `admin-${userId}-${Date.now()}.${fileExt}`
      await supabase.storage.from('documents').upload(`ids/${fileName}`, replyImage)
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`ids/${fileName}`)
      imageUrl = urlData.publicUrl
    }
    await supabase.from('chat_messages').insert({
      user_id: userId,
      sender: 'admin',
      message: replyText,
      image_url: imageUrl,
    })
    setReplyText('')
    setReplyImage(null)
    // Refresh chat for that user
    const { data: updated } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setChats(prev => ({ ...prev, [userId]: { ...prev[userId], messages: updated || [] } }))
  }

  if (!user) return <div className="p-8">Access denied.</div>

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold text-red-700">Admin Panel</h1>
      <div className="flex gap-4 mt-4 border-b pb-2">
        {['applications', 'chats', 'monitoring'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-4 py-2 rounded-t-lg font-medium ${
              activeTab === tab ? 'bg-red-100 text-red-800 border-b-2 border-red-500' : 'text-gray-600'
            }`}
          >
            {tab === 'monitoring' ? 'Monitoring' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'applications' && (
        <div className="mt-4 grid gap-4">
          {applications.map(app => (
            <div key={app.id} className="border p-4 rounded-lg bg-gray-50">
              <p><strong>User ID:</strong> {app.user_id}</p>
              <p>Amount Requested: ${app.grant_amount}</p>
              <p>Status: {app.status}</p>
              {app.id_document_url && (
                <img src={app.id_document_url} alt="ID" className="mt-2 w-32 h-20 object-cover rounded" />
              )}
              <p>Bank: {app.bank_name} | Acc: {app.account_number}</p>
              {app.status === 'pending' && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => approveApplication(app.id, app.grant_amount)}
                    className="bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Approve ${parseInt(app.grant_amount).toLocaleString()}
                  </button>
                </div>
              )}
              {app.status === 'approved' && app.approved_amount && (
                <p className="text-green-700">Approved: ${parseInt(app.approved_amount).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'chats' && (
        <div className="mt-4 flex">
          <div className="w-1/3 border-r pr-4">
            <h3 className="font-semibold mb-2">Users</h3>
            {Object.entries(chats).map(([uid, data]) => (
              <div
                key={uid}
                onClick={() => setSelectedUser(uid)}
                className={`p-2 cursor-pointer rounded ${selectedUser === uid ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              >
                {data.email || uid}
              </div>
            ))}
          </div>
          <div className="w-2/3 pl-4 flex flex-col">
            {selectedUser ? (
              <>
                <h3 className="font-semibold mb-2">Chat with {chats[selectedUser]?.email}</h3>
                <div className="flex-1 overflow-y-auto h-96 border p-2 rounded space-y-2">
                  {(chats[selectedUser]?.messages || []).map(msg => (
                    <div key={msg.id} className={`${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block p-2 rounded-lg ${msg.sender === 'admin' ? 'bg-red-100' : 'bg-gray-200'}`}>
                        {msg.message}
                        {msg.image_url && <img src={msg.image_url} className="max-w-xs mt-1 rounded" />}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Type reply..."
                    className="flex-1 border rounded px-3 py-1"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <label className="cursor-pointer">📎
                    <input type="file" accept="image/*" className="hidden" onChange={e => setReplyImage(e.target.files[0])} />
                  </label>
                  <button
                    onClick={() => sendAdminReply(selectedUser)}
                    className="bg-red-600 text-white px-4 py-1 rounded"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a user to view chat.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="mt-4">
          <p className="text-gray-700">All activity is logged. For security, this system is under continuous monitoring.</p>
          {/* You can extend with logs later */}
        </div>
      )}
    </div>
  )
}