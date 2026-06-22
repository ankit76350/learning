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
                onClick={() => navigate(card.path)}
              >
                Open Room
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  )
}

export default App