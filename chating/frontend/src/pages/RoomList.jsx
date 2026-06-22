import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRooms, createRoom } from '../store/roomsSlice'
import './RoomsList.css'

function initials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function RoomList() {
  const dispatch = useDispatch()
  const { items: rooms, status, creating, error } = useSelector(
    (state) => state.rooms,
  )

  useEffect(() => {
    dispatch(fetchRooms())
  }, [dispatch])

  function addroom() {
    const name = window.prompt('Enter a name for the new room')
    if (!name || !name.trim()) return
    dispatch(createRoom(name.trim()))
  }

  return (
    <main className="rooms">
      <header className="rooms-header">
        <h1>Rooms</h1>
        <button
          type="button"
          className="new-room-btn"
          onClick={addroom}
          disabled={creating}
        >
          {creating ? 'Adding…' : '+ Add New Room'}
        </button>
      </header>

      {status === 'loading' && <p>Loading rooms…</p>}
      {error && <p className="rooms-error">{error}</p>}

      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room.id} className="room-item">
            <span className="room-avatar">{initials(room.name)}</span>
            <div className="room-info">
              <span className="room-name">{room.name}</span>
              <span className="room-last">{room.id}</span>
            </div>
          </li>
        ))}
      </ul>

      {status === 'succeeded' && rooms.length === 0 && (
        <p>No rooms yet. Create one!</p>
      )}
    </main>
  )
}

export default RoomList
