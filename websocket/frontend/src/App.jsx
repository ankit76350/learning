import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStomp } from './StompContext'
import './App.css'

// One config object per category keeps the three inputs DRY.
const CATEGORIES = [
  { key: 'student', label: 'Student', destination: '/app/studentupdate', page: '/studentupdate' },
  { key: 'teacher', label: 'Teacher', destination: '/app/teacherupdate', page: '/teacherupdate' },
  { key: 'staff', label: 'Staff', destination: '/app/staffupdate', page: '/staffupdate' },
]

function App() {
  const client = useStomp()
  // One text value per category, e.g. { student: "", teacher: "", staff: "" }
  const [messages, setMessages] = useState({ student: '', teacher: '', staff: '' })

  const handleChange = (key, value) => {
    setMessages((prev) => ({ ...prev, [key]: value }))
  }

  // Publish to the category's /app destination. The backend echoes it to the
  // matching /topic, which the category's page is subscribed to.
  const send = (cat) => {
    const text = messages[cat.key]
    if (!client || !text.trim()) return
    client.send(cat.destination, {}, text)
    setMessages((prev) => ({ ...prev, [cat.key]: '' }))
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Send Updates</h1>
      {!client && <p style={{ color: 'crimson' }}>Connecting to server…</p>}

      {CATEGORIES.map((cat) => (
        <div key={cat.key} style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder={`Enter ${cat.label} message`}
            value={messages[cat.key]}
            onChange={(e) => handleChange(cat.key, e.target.value)}
          />
          <button onClick={() => send(cat)} style={{ marginLeft: '8px' }}>
            Send {cat.label}
          </button>
          <Link to={cat.page} style={{ marginLeft: '8px' }}>
            open {cat.label} page →
          </Link>
        </div>
      ))}
    </div>
  )
}

export default App
