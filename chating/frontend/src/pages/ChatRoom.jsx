import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import './ChatRoom.css'

function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Mock users who are "in" the room. Replace with live data later.
const mockParticipants = ['Riya', 'Aman', 'Sophia', 'Karan']

function ChatRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  // The name lives in the URL (?name=...) so it's visible in the address bar
  // and survives refresh. An inline form sets it (not window.prompt, which
  // would fire twice under React StrictMode in development).
  const [searchParams, setSearchParams] = useSearchParams()
  const username = searchParams.get('name') || ''
  const [nameDraft, setNameDraft] = useState('')

  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  const bottomRef = useRef(null)

  // Current user shown first, then the mock participants.
  const participants = [username, ...mockParticipants]

  function submitName(e) {
    e.preventDefault()
    const name = nameDraft.trim()
    if (!name) return
    setSearchParams({ name })
  }

  // Auto-scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: username, text, time: timeNow() },
    ])
    setDraft('')
  }

  // Ask for a name before showing the chat.
  if (!username) {
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
        </header>

        <form className="chat-name-gate" onSubmit={submitName}>
          <h2>Enter your name to join</h2>
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Your name"
            autoFocus
          />
          <button type="submit" disabled={!nameDraft.trim()}>
            Join chat
          </button>
        </form>
      </main>
    )
  }

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
            <span className="chat-text">{msg.text}</span>
            <span className="chat-time">{msg.time}</span>
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
        <button type="submit" disabled={!draft.trim()}>
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
