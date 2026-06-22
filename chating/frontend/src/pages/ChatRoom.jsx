import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  fetchMessages,
  addMessage,
  clearMessages,
} from '../store/messagesSlice'
import { setActiveRoom, clearActiveRoom } from '../store/notificationsSlice'
import { connectToRoom, sendMessage as publishMessage } from '../api/chatSocket'
import './CSS/ChatRoom.css'

// Backend timestamps are ISO strings (LocalDateTime); format to HH:MM.
function formatTime(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Mock users who are "in" the room. Replace with live data later.
const mockParticipants = ['Riya', 'Aman', 'Sophia', 'Karan']

function ChatRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // The name was collected earlier on the dashboard's "Open Room" button and
  // saved in localStorage. We just read it here and mirror it to the URL
  // (?name=...) so it shows in the address bar.
  const [searchParams, setSearchParams] = useSearchParams()
  const username = localStorage.getItem('chatUserName') || ''

  const messages = useSelector((state) => state.messages.items)
  const [draft, setDraft] = useState('')
  const [connected, setConnected] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const bottomRef = useRef(null)
  const clientRef = useRef(null)

  // Current user shown first, then the mock participants.
  const participants = [username, ...mockParticipants]

  // If we somehow reached a room without a stored name, go back to the start.
  useEffect(() => {
    if (!username) navigate('/', { replace: true })
  }, [username, navigate])

  // Keep the URL in sync with the known name.
  useEffect(() => {
    if (username && searchParams.get('name') !== username) {
      setSearchParams({ name: username }, { replace: true })
    }
  }, [username, searchParams, setSearchParams])

  // Tell the global notifier which room is open so it won't toast this one.
  useEffect(() => {
    dispatch(setActiveRoom(roomId))
    return () => {
      dispatch(clearActiveRoom())
    }
  }, [dispatch, roomId])

  // 1) Load the room's message history, clearing it on leave.
  useEffect(() => {
    if (!username) return
    dispatch(fetchMessages(roomId))
    return () => {
      dispatch(clearMessages())
    }
  }, [dispatch, roomId, username])

  // 2) Open the live connection and push every broadcast message into the store.
  useEffect(() => {
    if (!username) return
    const client = connectToRoom(
      roomId,
      (message) => dispatch(addMessage(message)),
      setConnected,
    )
    clientRef.current = client
    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [dispatch, roomId, username])

  // Auto-scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !clientRef.current) return

    // Server stamps timestamp + id and broadcasts it back to us, so we don't
    // add it optimistically (that would show it twice).
    publishMessage(clientRef.current, roomId, {
      sender: username,
      content: text,
    })
    setDraft('')
  }

  // Nothing to render until the redirect above kicks in.
  if (!username) return null

  return (
    <main className="chat">
      <header className="chat-header">
        <button
          type="button"
          className="chat-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="chat-title">
          <h1>Chat</h1>
          <code>{roomId}</code>
          <p className="chat-you">
            you are &quot;<strong>{username}</strong>&quot;
            {!connected && <em className="chat-status"> · connecting…</em>}
          </p>
        </div>

        <button
          type="button"
          className="chat-online"
          onClick={() => setShowParticipants(true)}
        >
          <span className="chat-online-dot" />
          {participants.length} online
        </button>
      </header>

      <section className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">No messages yet. Say hi 👋</p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender === username
                ? 'chat-bubble chat-bubble--own'
                : 'chat-bubble'
            }
          >
            <span className="chat-sender">{msg.sender}</span>
            <span className="chat-text">{msg.content}</span>
            <span className="chat-time">{formatTime(msg.timestamp)}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </section>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          autoFocus
        />
        <button type="submit" disabled={!draft.trim() || !connected}>
          Send
        </button>
      </form>

      {showParticipants && (
        <div
          className="modal-overlay"
          onClick={() => setShowParticipants(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>In this room ({participants.length})</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowParticipants(false)}
              >
                ✕
              </button>
            </header>
            <ul className="modal-list">
              {participants.map((person, i) => (
                <li key={`${person}-${i}`} className="modal-list-item">
                  <span className="room-avatar">
                    {person.slice(0, 2).toUpperCase()}
                  </span>
                  <span>
                    {person}
                    {i === 0 && <em className="modal-you"> (you)</em>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  )
}

export default ChatRoom
