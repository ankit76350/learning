import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

const cards = [
  {
    title: 'My Rooms',
    topic: '/topic/cricket',
    description: 'Live match commentary and score updates.',
    action: true,
    path: '/my-rooms-list',
  },
  {
    title: 'Orders',
    topic: '/topic/orders',
    description: 'Real-time order status broadcast to all clients.',
  },
  {
    title: 'Admin Rooms',
    topic: '/topic/messages',
    description: 'Open room for everyone connected over WebSocket.',
    action: true,
    path: '/admin-room-list',
  },
]

function App() {
  const navigate = useNavigate()

  // Name entry happens here, on "Open Room". If a name is already stored we
  // skip straight to the rooms list; otherwise we ask once and save it.
  const [pendingPath, setPendingPath] = useState(null)
  const [nameDraft, setNameDraft] = useState('')

  function openRoom(path) {
    const saved = localStorage.getItem('chatUserName')
    if (saved && saved.trim()) {
      navigate(path)
      return
    }
    setPendingPath(path)
  }

  function submitName(e) {
    e.preventDefault()
    const name = nameDraft.trim()
    if (!name) return
    localStorage.setItem('chatUserName', name)
    const path = pendingPath
    setPendingPath(null)
    setNameDraft('')
    navigate(path)
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Pick a topic to start chatting over WebSocket.</p>
      </header>

      <section className="card-grid">
        {cards.map((card) => (
          <article key={card.topic} className="card">
            <h2>{card.title}</h2>
            <p className="card-desc">{card.description}</p>
            <code>{card.topic}</code>

            {card.action && (
              <button
                type="button"
                className="card-btn"
                onClick={() => openRoom(card.path)}
              >
                Open Room
              </button>
            )}
          </article>
        ))}
      </section>

      {pendingPath && (
        <div className="modal-overlay" onClick={() => setPendingPath(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <form className="name-form" onSubmit={submitName}>
              <h2>Enter your name to access the hall</h2>
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
              <div className="name-form-actions">
                <button
                  type="button"
                  className="name-form-cancel"
                  onClick={() => setPendingPath(null)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={!nameDraft.trim()}>
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
