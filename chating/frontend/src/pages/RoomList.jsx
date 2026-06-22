import { useState } from 'react'
import './RoomsList.css'

const initialrooms = [
  { id: 1, name: 'Cricket Room', lastMessage: 'India needs 12 off 6 balls!' },
  { id: 2, name: 'Orders', lastMessage: 'Order #1042 has been shipped.' },
  { id: 3, name: 'General room', lastMessage: 'Hey everyone 👋' },
]

function initials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function roomList() {
  const [rooms, setrooms] = useState(initialrooms)

  function addroom() {
    const name = window.prompt('Enter a name for the new room')
    if (!name || !name.trim()) return

    setrooms((prev) => [
      ...prev,
      { id: Date.now(), name: name.trim(), lastMessage: 'No messages yet' },
    ])
  }

  return (
    <main className="rooms">
      <header className="rooms-header">
        <h1>Rooms</h1>
        <button type="button" className="new-room-btn" onClick={addroom}>
          + Add New Room
        </button>
      </header>

      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room.id} className="room-item">
            <span className="room-avatar">{initials(room.name)}</span>
            <div className="room-info">
              <span className="room-name">{room.name}</span>
              <span className="room-last">{room.lastMessage}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default roomList
