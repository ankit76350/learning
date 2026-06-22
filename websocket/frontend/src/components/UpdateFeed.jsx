import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStomp } from '../StompContext'

// Generic page body: subscribes to one /topic/... and shows every message
// that arrives on it. Each page below just passes a different topic + title.
export default function UpdateFeed({ title, topic }) {
  const client = useStomp()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!client) return // wait until the shared connection is ready

    // Subscribe to this page's topic. The backend @SendTo("/topic/...")
    // broadcasts here whenever someone sends the matching update.
    const subscription = client.subscribe(topic, (response) => {
      setMessages((prev) => [...prev, response.body])
    })

    // Unsubscribe when we leave the page.
    return () => subscription.unsubscribe()
  }, [client, topic])

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/">&larr; Back</Link>
      <h1>{title}</h1>
      <p style={{ color: '#888' }}>Listening on {topic}</p>

      {messages.length === 0 ? (
        <p>No messages yet…</p>
      ) : (
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
